# Secure Web App using Go WebSockets and Kafka

## Architecture

![alt text](docs/architecture.jpg "Secure E2EE based WebApp using go websockets and Kafka for Msg Queuing") 

* The archtecture consists of web socket clients, who communicate with the applicationon WS protocol.
* We secure the communication channel using SSL, as we use Transport Layer Security.
* The server behaves as a broker for maintaining subscribers for both private and broadcast chats.  
* The websockets.Upgrader is responsible for the protocol transition from http to ws.
* Zookeeper is responsible for managing the various partitions in kafka and synchronize them.

# Setup

* Following link can be used to set up and get kafka and zookeeper running, https://kafka.apache.org/quickstart.
* `go get ./...` to get all go dependencies
* edit the `.env` file present in `configs/` folder for configurations

* To run the web socket server and the kafka msg queue for chats run `go run main.go`

# Key Features

* The web sockets enable streaming of media/text over the network. Kafka acts as a persistent messaging.
* Audit-Trailing is one of the key implementations in this application. Audit trails can be logged(system logs/ audit DBs) for later point of time to trace back.
```
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
```
the non blocking channel read from p.Events() is how audit-logs can be established.
* Features such as broadcasting are implemented by mapping multiple subscribers to a topic created by a producer(person sending the message)



