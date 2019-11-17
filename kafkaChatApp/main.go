package main

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/websocket"
	"github.com/joho/godotenv"
	"gopkg.in/confluentinc/confluent-kafka-go.v1/kafka"

	"github.com/gorilla/mux"
)

//Upgrader is responsible for changing the protocol from http to ws
var Upgrader websocket.Upgrader

type Channel struct {
	conn websocket.Conn // WebSocket connection.
	send chan Packet    // Outgoing packets queue.
}
type Packet struct {
	Data       []byte
	DType      string
	Persistent bool
	From       string
	To         string
	Timestamp  string
}

type Client struct {
	Id string
}

// mapping between subscriber and topics subscribed by it
var subscriptionTopics map[string][]string

// mapping between subscriber and broadcast topic subscribed
var broadcastTopicSubscription map[string]string

// mapping between producer and subscribers in its broadcast list
var broadcastSubscribers map[string][]string

// mapping between
var broadcastTopicProducer map[string]string

func init() {
	Upgrader = websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
		CheckOrigin: func(r *http.Request) bool {
			return true
		},
	}
	// temp := make([]string, 0)
	broadcastSubscribers = make(map[string][]string, 0)
	broadcastTopicSubscription = make(map[string]string, 0)
	subscriptionTopics = make(map[string][]string)
	broadcastTopicProducer = make(map[string]string)

}

func NewChannel(c websocket.Conn, clientId string) *Channel {
	res := &Channel{
		conn: c,
		send: make(chan Packet),
	}

	go res.reader(clientId)
	go res.writer(clientId)

	return res
}
func (c *Channel) writer(clientId string) {
	// We make buffered write to reduce write syscalls.
	go func(c *Channel) {
		consumer, err := kafka.NewConsumer(&kafka.ConfigMap{
			"bootstrap.servers": os.Getenv("KAFKA_HOST"),
			"group.id":          os.Getenv("KAFKA_GROUP"),
			"auto.offset.reset": "earliest",
		})
		if err != nil {
			log.Println(err)
			return
		}
		topic, ok := broadcastTopicSubscription[clientId]
		if !ok {
			return
		}
		consumer.SubscribeTopics([]string{topic, "^aRegex.*[Tt]opic"}, nil)
		for {
			msg, err := consumer.ReadMessage(-1)
			if err == nil {
				err := c.conn.WriteJSON(msg.Value)
				if err != nil {
					log.Println(err)
					return
				}
				log.Printf("Message on %s: %s\n", msg.TopicPartition, string(msg.Value))
			} else {
				// The client will automatically try to recover from all errors.
				log.Printf("Consumer error: %v (%v)\n", err, msg)
			}
		}

	}(c)
	consumer, err := kafka.NewConsumer(&kafka.ConfigMap{
		"bootstrap.servers": os.Getenv("KAFKA_HOST"),
		"group.id":          os.Getenv("KAFKA_GROUP"),
		"auto.offset.reset": "earliest",
	})
	if err != nil {
		log.Println(err)
		return
	}
	defer consumer.Close()
	log.Println("topics subscribed by the client", subscriptionTopics[clientId])
	consumer.SubscribeTopics(subscriptionTopics[clientId], nil)
	for {
		msg, err := consumer.ReadMessage(-1)
		if err == nil {
			if err := c.conn.WriteJSON(msg.Value); err != nil {
				log.Println(err)
				// return
			}
			log.Printf("Message on %s: %s\n", msg.TopicPartition, string(msg.Value))
		} else {
			// The client will automatically try to recover from all errors.
			log.Printf("Consumer error: %v (%v)\n", err, msg)
		}
	}
	if err != nil {
		log.Println(err)
	}

	//send delivered signal on topic
}

func (c *Channel) handle(data []byte) {

	pkt := Packet{}
	json.Unmarshal(data, &pkt)

}

func (c *Channel) reader(clientId string) {
	p, err := kafka.NewProducer(&kafka.ConfigMap{"bootstrap.servers": "localhost"})
	if err != nil {
		log.Println(err)
		return
	}

	defer p.Close()
	for {
		//send sent signal on topic
		temp := Packet{}
		if err := c.conn.ReadJSON(&temp); err != nil {
			log.Println(err)
		}

		data, _ := json.Marshal(temp)
		topic := temp.From
		if v, ok := broadcastTopicProducer[temp.From]; ok {
			topic = v
		} else {
			if _, ok := subscriptionTopics[temp.To]; !ok {
				subscriptionTopics[temp.To] = make([]string, 0)
			}
			subscriptionTopics[temp.To] = append(subscriptionTopics[temp.To], temp.From)

		}
		defer func() {
			delete(broadcastTopicProducer, temp.From)
			delete(broadcastSubscribers, temp.From)
		}()
		err = p.Produce(
			&kafka.Message{
				Value: data,
				TopicPartition: kafka.TopicPartition{
					Topic:     &topic,
					Partition: kafka.PartitionAny,
				},
			}, nil)
		if err != nil {
			log.Println(err)
			return
		}
		p.Flush(1000)
		//Delivery Report(for audit logs)

		// msg received here
		// todo data to be written to kafka here for audit trails
		// if err := ws.WriteMessage(msgType, data); err != nil {
		// 	log.Println(err)
		// }
		//msg sent back to client (signal sent)
	}
	go func() {
		for {
			select {
			case e := <-p.Events():
				switch ev := e.(type) {
				case *kafka.Message:
					if ev.TopicPartition.Error != nil {
						log.Printf("Delivery failed: %v\n", ev.TopicPartition)
					} else {

						log.Printf("Delivered message to %v\n", string(ev.Value))
						//Logs to the Audit trail DB done here
					}
				}
			}
		}
	}()
}

func ws(w http.ResponseWriter, r *http.Request) {
	log.Println("Trying to connect")
	clientId := r.URL.Query().Get("clientId")

	conn, err := Upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
	}

	NewChannel(*conn, clientId)
	//further handling of channel can be done here

}
func broadcast(w http.ResponseWriter, r *http.Request) {

	b, _ := ioutil.ReadAll(r.Body)
	data := struct {
		from string
		to   []string
	}{}
	json.Unmarshal(b, &data)
	for i := range data.to {
		broadcastTopicSubscription[data.to[i]] = "broadcast" + data.from
	}
	broadcastTopicProducer[data.from] = "broadcast" + data.from
	broadcastSubscribers[data.from] = data.to

}

func main() {
	if err := godotenv.Load("./configs/.env"); err != nil {
		log.Print("No .env file found")
	}
	r := mux.NewRouter()
	r.HandleFunc("/ws", ws).Methods("GET")
	r.HandleFunc("/broadcast", broadcast).Methods("POST")
	http.Handle("/", r)

	server := &http.Server{
		//to be replaced with viper configurations
		Addr:    os.Getenv("SERVER_HOST") + ":" + os.Getenv("SERVER_PORT"),
		Handler: r,
		// WriteTimeout: 10 * time.Second,
	}
	log.Fatalln(server.ListenAndServe())
}
