import React, { Component } from "react";
import "./style.css";

class Chat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: this.props.user,
      messages: [],
      sender: "",
      isTyping: false,
    };
    let id = window.location.pathname && window.location.pathname.split('/').pop()
    this.socket = new WebSocket(`ws://172.16.8.78:8888/ws?clientId=${id}`)
  }
  // timeoutFunction = () => {
  //   this.setState({ isTyping: false });
  //   this.socket.send({e: "notTyping"});
  // };
  sendMessage = message => {
    let id = document.location.pathname && document.location.pathname.split('/').pop()
    let newMsg = {
      to: id === '1' ? '2' : '1',
      data: btoa(message),
      dType: 'text',
      from: id,
      confidential: false,
      timestamp: Date.now().toString()
    }
    this.socket.send(JSON.stringify(newMsg));
    this.setState({messages: [...this.state.messages, newMsg]})
  };
  userTyping = event => {
    if (event.which === 13 && event.target.value) {
      this.sendMessage(event.target.value)
      document.getElementById("message-field").value = ''
    } else {
      if (!this.state.isTyping) {
        this.setState({
          isTyping: true,
        });
        // this.socket.send(JSON.stringify{data: "typing", user: this.state.user});
      }
    }
  };
  someoneTyping = (sender) => {
    this.setState({sender})
  }
  connectToServer = () => {
      this.socket.onopen = () => {
        console.log('socket connected')
      }
  }
  componentDidMount() {
    this.connectToServer()

    this.socket.onmessage = (message) => {
      console.log('message received')
      let temp = message.data.slice(1, message.data.length - 2)
      message = atob(temp)
      message = JSON.parse(message)
      message = Object.keys(message).reduce((acc, curr) => {
        let key = curr[0].toLocaleLowerCase() + curr.slice(1)
        acc[key] = message[curr]
        return acc
      }, {})
      this.setState({messages: [...this.state.messages, message]})
    }
  }
  render() {
    let id = window.location.pathname && window.location.pathname.split('/').pop()
    return (
      <div className='chat-container'>
        <div className="header">
          {/* <div className="typing-status" id="typing-status" >
          {this.state.sender !== '' && <div>{this.state.sender} is typing</div>}
          </div> */}
        </div>
        <div className="chat-display" id="chat-display" >
          {this.state.messages.map(chat => {
            let align = "", time = "", reader;
            if(id === chat.from){
              align = "right";
              time = "left";
              reader = "You"
            }
            return(
              <div className={`chat-segment ${align}`}>
                <strong>{reader || chat.sender}</strong>
                <div class="message">{chat.data && atob(chat.data)}</div>
                <div class={`time ${time}`}>{chat.time && chat.time.slice(10)}</div>
              </div>
            )
          })}
        </div>
        <div className="message-box">
          <textarea
            className="message-field"
            id="message-field"
            placeholder="Type the message"
            onKeyUp={this.userTyping}
          />
        </div>
      </div>
    );
  }
}
export default Chat;
