import React, { Component } from 'react';

import { ChatFeed, Message } from 'react-chat-ui'

import * as AmazonCognitoIdentity from 'amazon-cognito-identity-js'

const REGION = "us-west-2";
const USER_POOL_ID = 'us-west-2_AcLaKSHto';
const CLIENT_ID = '37aqjp00rvdj6mlilm9b75s895';
const IDENTITY_POOL_ID = 'us-west-2:49389f7e-59d1-4784-b957-79c8d0aaafea';
const authenticator = `cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}`;
var AWS = require('aws-sdk');

var poolData = {
  UserPoolId : USER_POOL_ID,
  ClientId : CLIENT_ID
};

var authenticationData = {
  Username : 'pk2600@columbia.edu',
  Password : 'Qwerty123#',
};

var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
var userData = {
  Username : 'pk2600@columbia.edu',
  Pool : userPool
};

//var botName = 'Fashionista';
var loggedIn = false;
var config = null;
// var apigClientFactory = require('aws-api-gateway-client').default;
// var apigClient = null;
var botMessage = null;
var botResponse = null;
var lexruntime = null;

function login(callback) {
  var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
  cognitoUser.authenticateUser(authenticationDetails, {
    onSuccess: function (result) {
        console.log(result);
        //var accessToken = result.getAccessToken().getJwtToken();
        var idToken = result.getIdToken().getJwtToken();
        AWS.config.region = REGION;
        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId : IDENTITY_POOL_ID,
            Logins : {
                [authenticator] : idToken
            }
        });
        AWS.config.credentials.refresh((error) => {
            if (error) {
                console.log('Error logging in');
                console.error(error);
            } else {
                console.log('Successfully logged!');
                loggedIn = true;
                config = {
                  apiKey : 'V6LgAf2rgTapOjUT1gRf2FooPUsrRiz4kC8rKfJ1',
                  invokeUrl : 'https://a7f05x8fi9.execute-api.us-west-2.amazonaws.com/test',
                  region : REGION,
                  accessKey : AWS.config.credentials.accessKeyId, // REQUIRED
                  secretKey : AWS.config.credentials.secretAccessKey, // REQUIRED
                  sessionToken : AWS.config.credentials.sessionToken
                };
                //apigClient = apigClientFactory.newClient(config);
                lexruntime = new AWS.LexRuntime({apiVersion: '2016-11-28', region : 'us-west-2'});
                callback(null);
            }
        });
    },
    onFailure: function(err) {
      alert(err.message || JSON.stringify(err));
      callback(null);
    },
  });
}

function chatbotResponseUtil(question, callback) {
  var params = {
    botAlias: 'test', /* required */
    botName: 'cloud_project', /* required */
    contentType: 'text/plain; charset=utf-8', /* required */
    inputStream: question, /* required */
    userId: 'pk2600', /* required */
    accept: 'text/plain; charset=utf-8',
    requestAttributes : {},
    sessionAttributes : {}
  };
  lexruntime.postContent(params, function (err, data) {
    if (err) {
        console.log('Error lex', err);
        callback(err);
    }
    else{
        try {
          botResponse = JSON.parse(data.message);
          console.log(botResponse);
          botMessage = 'Here are a few clothing siggestions for your event!';
        } catch (e) {
          console.log('json parse error');
          botMessage = data.message;
        }
        console.log('Sucess lex', data);
        callback(data);
    }
  });
}

function chatbotResponse(input, obj, callback) {
  if(loggedIn === false) {
    login(function() {
      console.log('Login complete');
      chatbotResponseUtil(input, function() {
        callback(obj);
      });
  });
  }
  else {
    chatbotResponseUtil(input, function() {
      callback(obj);
    });
  }
}

class App extends Component {

  state = {
    input: '',
    finalMessage: '',
    messages: [
      new Message({
        id: 1,
        message: "Type something to start chatting!",
      })
    ]
  }

  async submitMessage() {
    const { input } = this.state;
    if (input === '') return;
    const message = new Message({
      id: 0,
      message: input,
    });
    let messages = [...this.state.messages, message];

    this.setState({
      messages,
      input: ''
    });
    chatbotResponse(input, this, function(res) {
        console.log('Gotten response:', botMessage);
        const message = new Message({
          id: 1,
          message: botMessage,
        });
        let messages = [...res.state.messages, message];
        res.setState({
          messages
        });
        var myNode = document.getElementById("dresses");
        //console.log(myNode)
        while (myNode.firstChild) {
            myNode.removeChild(myNode.firstChild);
        }
        if(botResponse !== null) {
          for (var clothingType in botResponse) {
            var elem1=document.createElement("div");
            elem1.className="card";
            elem1.setAttribute("style","color: #2c3e50;display: flex;overflow : scroll;margin:10px;padding:20px")
            var elem2=document.createElement("h2");
            elem2.setAttribute("style","color:white;");
            elem2.innerText=clothingType;
            for(var i = 0; i < botResponse[clothingType].length; i++){
              var elem3 = document.createElement("div");
              elem3.className="cardContent";
              elem3.setAttribute("style","color: #e74c3c; margin: 5px; min-width:100px;min-height:100px;");
              var elem4=document.createElement("img");
              elem4.setAttribute("style","width: 100%; height: 100%")
              //elem4.src = 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png';
              console.log(botResponse[clothingType][i]);
              elem4.src = botResponse[clothingType][i].image;
              elem3.appendChild(elem4);
              elem1.appendChild(elem3);
              document.getElementById('dresses').append(elem2)
              document.getElementById('dresses').append(elem1)
            }
          }
        }
    });
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

  render() {
    return (
      <div id='app' className="App" >
        <header style={styles.header}>
          <p style={styles.headerTitle}>Fashionista: Say adios to fashion faux pas!</p>
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
