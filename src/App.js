import React, { Component } from 'react';

import { ChatFeed, Message } from 'react-chat-ui'

const REGION = "us-west-2";
var AWS = require('aws-sdk');
var botName = 'Chatbot';
var config = {
          apiKey : 'Aw6Pqn4Ef51vqKQg1nxgn6kdKU5ijBNuBxqPLL91',
          invokeUrl : 'https://pqj9shseg5.execute-api.us-west-2.amazonaws.com/test',
          region : REGION
};
var apigClientFactory = require('aws-api-gateway-client').default;
var apigClient = apigClientFactory.newClient(config);
var params = {};

class App extends Component {

  state = {
    input: '',
    finalMessage: '',
    messages: [
      new Message({
        id: 1,
        message: "Hello, how can I help you today?",
      })
    ]
  }
  _handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      this.submitMessage()
    }
  }
  onChange(e) {
    const input = e.target.value
    this.setState({
      input
    })
  }
  async submitMessage() {
    
    const { input } = this.state
    if (input === '') return
    const message = new Message({
      id: 0,
      message: input,
    })

    let messages = [...this.state.messages, message]

    this.setState({
      messages,
      input: ''
    })
    var body = {
        "question" : input,
      };
      var additionalParams = {
        headers : {},
        queryParams: {}
      };
      var botMessage="Reached here"
      

      // apigClient.invokeApi(params, '/search', 'GET', additionalParams, body)//.then(function(result) {
      // console.log("Sucessfully got chatbot response");
      // botMessage = String(JSON.parse(result.data.body).answer);
        // imageList = JSON.parse(result.data.body).imageList;
        // imageList=
    //TODO: set botMessage and imageLits to parsed response 
apigClient.invokeApi(params, '/search', 'GET', additionalParams, body).then(function(result) {
        botMessage = String(JSON.parse(result.data.body).answer);
        var imageList = JSON.parse(result.data.body).imageList;
        //elem.src = 'https://s3-us-west-2.amazonaws.com/hw3photos/'+imageList[i];
        
      }).catch(function(result) {
        console.error(result)
        console.error("Chatbot response failure")
      });
    const responseMessage = new Message({
      id: 1,
      message: botMessage,
    })
    messages  = [...this.state.messages, message,responseMessage]
    this.setState({ messages })
  var myNode = document.getElementById("dresses");
  console.log(myNode)
      while (myNode.firstChild) {
          myNode.removeChild(myNode.firstChild);
      }
      //for (var i = imageList.length - 1; i >= 0; i--) {
        //TODO: for loop should be for every category we return such as dresses, shoes etc.
        for(var j=0;j<3;j++){
          var elem1=document.createElement("div");
          elem1.className="card";
          elem1.setAttribute("style","color: #2c3e50;display: flex;overflow : scroll;margin:10px;padding:20px")
          var elem2=document.createElement("h2");
          elem2.setAttribute("style","color:white;");
          elem2.innerText="Dresses";
          //TODO: Set inner text to cattegory : Dresses, shoes etc.
          //for loop should be for each element in imageList
          //Replace current for loop with :
        //   for (var i = imageList.length - 1; i >= 0; i--) 
        //Replce line 113 elem4.src to :
       //elem4.src = 'https://s3-us-west-2.amazonaws.com/hw3photos/'+imageList[i];
       //replace the s3 link
          for (var i = 0;i<5;i++){
            var elem3 = document.createElement("div");
            elem3.className="cardContent";
            elem3.setAttribute("style","color: #e74c3c; margin: 5px; min-width:100px;min-height:100px;");
            
            var elem4=document.createElement("img");
            elem4.setAttribute("style","width: 100%; height: 100%")
            elem4.src = 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png';
            // elem2.src = 'https://s3-us-west-2.amazonaws.com/hw3photos/'+imageList[i];
            elem3.appendChild(elem4);
            elem1.appendChild(elem3);
            
           //document.getElementById('myImg').append("<img src=\"https://s3-us-west-2.amazonaws.com/hw3photos/test2.jpg\"/>");
        }
        document.getElementById('dresses').append(elem2)
        document.getElementById('dresses').append(elem1)
    }

  }
  render() {
    return (
      <div id='app' className="App" >
        <header style={styles.header}>
          <p style={styles.headerTitle}>Welcome!</p>
        </header>
        <div style={styles.chatbotStyle}>
        <div style={styles.messagesContainer}>

        <h2>{this.state.finalMessage}</h2>
        <ChatFeed
          messages={this.state.messages}
          hasInputField={false}
          bubbleStyles={styles.bubbleStyles}
        />

        <input
          onKeyPress={this._handleKeyPress}
          onChange={this.onChange.bind(this)}
          style={styles.input}
          value={this.state.input}
        />
        </div>
        </div>
        <div id='dresses' style={styles.card}></div>
        </div>
    );
  }
}

const styles = {
  chatbotStyle:{
    width: '30%',
    float: 'left',
    height:'600px',
    overflow: 'scroll',
    marginRight: '10px'
  },
  cardContent: {
     backgroundColor: '#e74c3c',
    margin: '5px'
  },
  card: {
    backgroundColor: '#2c3e50',
    width: '60%',
    float: 'right'
  },
  bubbleStyles: {
    text: {
      fontSize: 16,
    },
    chatbubble: {
      borderRadius: 30,
      padding: 10
    }
  },
  headerTitle: {
    color: 'white',
    fontSize: 22
  },
  header: {
    backgroundColor: 'rgb(0, 132, 255)',
    padding: 20,
    borderTop: '12px solid rgb(204, 204, 204)'
  },
  messagesContainer: {
    display: 'flex',
    flexDirection: 'column',
    padding: 10,
    overflow: 'scroll'
  },
  input: {
    fontSize: 16,
    padding: 10,
    outline: 'none',
    width: '100%',
    border: 'none',
    borderBottom: '2px solid rgb(0, 132, 255)'
  }

}

export default App
