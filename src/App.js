
import React, { Component } from 'react';

import { ChatFeed, Message } from 'react-chat-ui'

import * as AmazonCognitoIdentity from 'amazon-cognito-identity-js'

const REGION = "us-west-2";
const USER_POOL_ID = 'us-west-2_AcLaKSHto';
const CLIENT_ID = '37aqjp00rvdj6mlilm9b75s895';
const IDENTITY_POOL_ID = 'us-west-2:49389f7e-59d1-4784-b957-79c8d0aaafea';

const authenticator = `cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}`;
var AWS = require('aws-sdk');
const Secret_key= "4c+6mnPieLY/Urz1GzsrVniBmG+cDaZcX9C6uMrA";
const Access_key= "AKIAJLUFKYHZLTAEGXEQ";
var poolData = {
  UserPoolId : USER_POOL_ID,
  ClientId : CLIENT_ID
};

// var authenticationData = {
//   Username : 'pk2600@columbia.edu',
//   Password : 'Qwerty123#',
// };

// var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
// var userData = {
//   Username : 'pk2600@columbia.edu',
//   Pool : userPool
// };

//var botName = 'Fashionista';
var loggedIn = false;
var config = null;
var botMessage = null;
var botResponse = null;
var lexruntime = null;
var userid = null;
var voiceip = false;

function getCurrentUser(callback) {
    var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
  var cognitoUser = userPool.getCurrentUser();
console.log("got user",cognitoUser);
console.log("got user",userPool);
  if (cognitoUser !== null) {
    cognitoUser.getSession(function(err, session) {
      if (err) {
        console.log(err);
        alert(err.message);
        return;
      }
      console.log('session validity: ' + session.isValid());
      loggedIn = true;
      cognitoUser.getUserAttributes(function(err, result) {
        if (err) {
          console.log(err);
          alert(err.message);
          return;
        }
        console.log(result);
        for (var i = 0; i < result.length; i++) {
          //console.log('attribute ' + result[i].getName() + ' has value ' + result[i].getValue());
          if(result[i].getName() === 'email') {

            userid = result[i].getValue();
            userid = userid.replace('@','');
             console.log(userid)
          }
        }
        console.log('Userid:', userid);
        AWS.config.update({
          credentials: new AWS.CognitoIdentityCredentials({
            IdentityPoolId: IDENTITY_POOL_ID,
            Logins : {
               [authenticator] : session.getIdToken().getJwtToken()
             }
          }),
          region: REGION
        });
        lexruntime = new AWS.LexRuntime({apiVersion: '2016-11-28', region : REGION});
        callback(null);
      });
    });
  }
}

// function login(callback) {
//   var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
//   cognitoUser.authenticateUser(authenticationDetails, {
//     onSuccess: function (result) {
//         console.log(result);
//         //var accessToken = result.getAccessToken().getJwtToken();
//         var idToken = result.getIdToken().getJwtToken();
//         AWS.config.region = REGION;
//         AWS.config.credentials = new AWS.CognitoIdentityCredentials({
//             IdentityPoolId : IDENTITY_POOL_ID,
//             Logins : {
//                 [authenticator] : idToken
//             }
//         });
//         AWS.config.credentials.refresh((error) => {
//             if (error) {
//                 console.log('Error logging in');
//                 console.error(error);
//             } else {
//                 console.log('Successfully logged!');
//                 loggedIn = true;
//                // config = {
//                //   apiKey : 'V6LgAf2rgTapOjUT1gRf2FooPUsrRiz4kC8rKfJ1',
//                //   invokeUrl : 'https://a7f05x8fi9.execute-api.us-west-2.amazonaws.com/test',
//                //   region : REGION,
//                //   accessKey : AWS.config.credentials.accessKeyId, // REQUIRED
//                //   secretKey : AWS.config.credentials.secretAccessKey, // REQUIRED
//                //   sessionToken : AWS.config.credentials.sessionToken
//                // };
//                 lexruntime = new AWS.LexRuntime({apiVersion: '2016-11-28', region : 'us-west-2'});
//                 callback(null);
//             }
//         });
//     },
//     onFailure: function(err) {
//       alert(err.message || JSON.stringify(err));
//       callback(null);
//     },
//   });
// }

function chatbotResponseUtil(question, callback) {
  var params = {
    botAlias: 'test', /* required */
    botName: 'cloud_project', /* required */
    contentType: 'text/plain; charset=utf-8', /* required */
    inputStream: question, /* required */
    userId: userid, /* required */
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
    getCurrentUser(function() {
      console.log('Login done');
      // AWS.config.credentials.refresh((error) => {
      //     if (error) {
      //         console.error(error);
      //     } else {
      //         console.log('Successfully logged!');
      //     }
      // });
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
    if(voiceip == true){
      const message = new Message({
      id: 1,
      message: input,
    });
    let messages = [...this.state.messages, message];

    this.setState({
      messages,
      input: ''
    });
    voiceip = false;
    return;
    }
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
          var chat=document.getElementById('chatbot');

          chat.setAttribute("style","width: 30%;float: left;height:600px;overflow: scroll;marginRight: 10px; marginLeft: 10px");
          var chat2=document.getElementById('voicediv');
          chat2.setAttribute("style","width: 400px;float:left;");
          var dresses=document.getElementById('dresses');
          if (dresses.style.display === "none") {
          dresses.style.display = "block";}
          // dresses.setAttribute("style","color: #2c3e50;width: 60%;float: right;height:600px; overflow:scroll; marginTop:5px; marginRight:5px;display : ")
          for (var clothingType in botResponse) {

            var elem1=document.createElement("div");
            elem1.className="card";
            elem1.setAttribute("style","color: #2c3e50;display: flex;overflow : scroll;margin:10px;padding:10px")
            var elem2=document.createElement("h2");
            elem2.setAttribute("style","color:white;text-align:center; font-size: 30px;margin-bottom: 0px;");
            elem2.innerText=clothingType.charAt(0).toUpperCase() + clothingType.slice(1);;
            for(var i = 0; i < botResponse[clothingType].length; i++){
              var elem3 = document.createElement("div");
              elem3.className="cardContent";
              elem3.setAttribute("style","color: #e74c3c; margin: 5px;");
              var elem4=document.createElement("a");
              var url=botResponse[clothingType][i].product_url;
              elem4.setAttribute("href",url);
              elem4.setAttribute("target","_blank")
              var elem5= document.createElement("img");
              elem5.src = botResponse[clothingType][i].image;
              elem5.setAttribute("style","width: 100%; height: 100%");
              elem4.appendChild(elem5);
              console.log(botResponse[clothingType][i]);
              elem3.appendChild(elem4);
              elem1.appendChild(elem3);
              document.getElementById('dresses').append(elem2)
              document.getElementById('dresses').append(elem1)
            }
          }
        }
         var temp=document.getElementById('chatbot');
              temp.scrollTop = temp.scrollHeight; //- temp.clientHeight;
    });
   
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
       
        <div id='chatbot' style={styles.chatbotStyle}>
        <div style={styles.messagesContainer}>


        <ChatFeed
          messages={this.state.messages}
          hasInputField={false}
          bubbleStyles={styles.bubbleStyles}
        />
        <div id='voicediv' style={styles.divStyle}>
       
        <input
          onKeyPress={this._handleKeyPress}
          onChange={this.onChange.bind(this)}
          style={styles.input}
          value={this.state.input}
        />
        <input id="Btn" type="image" value="start" style={styles.mic} src="https://s3-us-west-2.amazonaws.com/fashionadvisorproject/mic.png" />

        </div>
         </div>
        <div>
        
      </div>
      <div>
      <audio id="audio" controls style={styles.hideCon} >No support of audio tag</audio>
      </div>
      <div>
      <audio id="audioResponse" controls style={styles.hideCon}>No support of audio tag</audio>
      </div>

        </div>
        <div id='dresses' style={styles.card}></div>
        </div>
     
    );

  }
   // <header style={styles.header}>
   //        <img src="https://s3-us-west-2.amazonaws.com/fashionadvisorproject/header.png" style={styles.imageStyle}/>
   //        <input id='logout' type="image" src="https://s3-us-west-2.amazonaws.com/fashionadvisorproject/logout.png" style={styles.logout}/>
   //      </header>

  start(){
  if(loggedIn === false) {
    getCurrentUser(function() {
      console.log('Login done', userid);
      window.recorder.start();
  });
  }
  else {
    window.recorder.start();
  }
 }

  stop(){
   window.recorder.stop()
 }
 _handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      this.submitMessage();
    }
    else if(e.key === '['){
      this.start();
    }
    else if(e.key === ']') {
      this.stop();
    }
  }
          // <h2>{this.state.finalMessage}</h2>
//   <button className="button" id="startBtn">START RECORDING</button>

// <button className="button" id="stopBtn">STOP RECORDING</button>
componentDidMount()
{
var obj = this;
navigator.mediaDevices.getUserMedia({audio:true})
.then(function onSuccess(stream) {

  var recorder = window.recorder = new MediaRecorder(stream);

  var data = [];
  recorder.ondataavailable = function(e) {
    data.push(e.data);
  };

  recorder.onerror = function(e) {
    throw e.error || new Error(e.name);       }

  recorder.onstart = function(e) {
    data = [];
  }

  recorder.onstop = function(e) {

    var blobData = new Blob(data, {type: 'audio/x-l16'});

    document.getElementById("audio").src = window.URL.createObjectURL(blobData);

    var reader = new FileReader();
    reader.onload = function() {
      var audioContext = new AudioContext();
      audioContext.decodeAudioData(reader.result, function(buffer) {

        reSample(buffer, 16000, function(newBuffer){

          var arrayBuffer = convertFloat32ToInt16(newBuffer.getChannelData(0));              sendToServer(arrayBuffer);
        });
      });
    };
    reader.readAsArrayBuffer(blobData);
  }

})
.catch(function onError(error) {
  console.log(error.message);
});

// var startBtn = document.getElementById('startBtn');
//  var stopBtn = document.getElementById('stopBtn');
var btn=document.getElementById('Btn');
btn.onclick = toggle;
var log1=document.getElementById('logout');
// log1.onclick = logout_func;
function logout_func()
{
  ;
}
 // startBtn.onclick = start;
 // stopBtn.onclick = stop;
 function toggle(){
  try
  {
    var btn=document.getElementById('Btn');
    if (btn.value== 'start')
    {  
      btn.value = 'stop';
      obj.start();
    }
    else 
    {
      btn.value='start';
      obj.stop();
    }
  }
  catch(err)
  {
    console.log("error", err);
  }
 }

 function reSample(audioBuffer, targetSampleRate, onComplete) {
      var channel = audioBuffer.numberOfChannels;
      var samples = audioBuffer.length * targetSampleRate / audioBuffer.sampleRate;

      var offlineContext = new OfflineAudioContext(channel, samples, targetSampleRate);
      var bufferSource = offlineContext.createBufferSource();
      bufferSource.buffer = audioBuffer;

      bufferSource.connect(offlineContext.destination);
      bufferSource.start(0);

offlineContext.startRendering().then(function(renderedBuffer){
          onComplete(renderedBuffer);
      })
  }

function convertFloat32ToInt16(buffer) {
      var l = buffer.length;
      var buf = new Int16Array(l);
      while (l--) {
          buf[l] = Math.min(1, buffer[l]) * 0x7FFF;
      }
      return buf.buffer;
  }

  var myCredentials = new AWS.CognitoIdentityCredentials({IdentityPoolId:IDENTITY_POOL_ID}),
  myConfig = new AWS.Config({
      credentials: myCredentials,
      "accessKeyId":Access_key, "secretAccessKey": Secret_key, "region": REGION

    });


    function sendToServer(audioData){
      console.log('in sendToServer');
      console.log(userid);
        var params = {
          botAlias: 'test', /* required */
          botName: 'cloud_project', /* required */
          contentType: 'audio/x-l16; sample-rate=16000; channel-count=1', /* required */
          inputStream: audioData, /* required */
          userId: userid, /* required */
          accept: 'audio/mpeg',
          //voiceId: 'kendra',
          //sessionAttributes: '' /* This value will be JSON encoded on your behalf with JSON.stringify() */
        };
        var lexruntime = new AWS.LexRuntime({"accessKeyId":Access_key, "secretAccessKey": Secret_key, "region": REGION});
        lexruntime.postContent(params, function(err, data) {
          console.log('inpost');
          if (err) console.log('ERROR!', err, err.stack); // an error occurred
          else {
            console.log('in else');
             console.log(data.message);
             var uInt8Array = new Uint8Array(data.audioStream);
             var arrayBuffer = uInt8Array.buffer;
             var blob = new Blob([arrayBuffer]);
             console.log(blob);
             var url = URL.createObjectURL(blob);
            document.getElementById("audioResponse").src = url;
            document.getElementById("audioResponse").play();
            const input = data.message;
              obj.setState({
                input
              });
            voiceip = true;
            obj.submitMessage();
          }
        });
      }
}


}



const styles = {
  logout:{
    width: '100px',
    height: '30px',
    float: 'right',
    transform: 'translate(-40%, -680%)',
  },
  divStyle:{
    width: '500px',
  },
  hideCon:{
    display:"none"
  },
  imageStyle:{
    width:'100%',
    zIndex: 1,
    height: 'auto',
  },
  chatbotStyle:{
    //width: '30%',
    float: 'left',
    height:'600px',
    overflow: 'scroll',
    marginLeft: '30%',
    marginBottom: '5px'
    //align: 'center',
  },
  cardContent: {
     backgroundColor: '#e74c3c',
    margin: '5px'
  },
  card: {
    backgroundColor: '#2c3e50',
    width: '60%',
    float: 'right',
    height:'600px',
    overflow:'scroll',
    marginTop:'5px',
    marginRight:'5px',
    display : 'none',
    marginBottom: '5px'
  },
  bubbleStyles: {
    text: {
      fontSize: 16,
    },
    chatbubble: {
      borderRadius: 30,
      padding: 10,
    }
  },
  headerTitle: {
    color: 'white',
    fontSize: 22
  },
  header: {
     position: 'relative',
    backgroundColor: 'white',
    // borderTop: '12px solid rgb(204, 204, 204)',
    width: window.innerWidth,
    height: '100%',
  },
  messagesContainer: {
    display: 'flex',
    flexDirection: 'column',
    padding: 10,
    overflow: 'scroll'
  },
  input: {
    fontSize: 16,
    outline: 'none',
    width: '70%',
    border: 'none',
    borderBottom: '2px solid rgb(0, 132, 255)'
  },
  mic:{
    width: '25px',
    height: '25px',
  }
}

export default App
