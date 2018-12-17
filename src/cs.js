import { ChatFeed, Message } from 'react-chat-ui'
const REGION = "us-west-2";
var AWS = require('aws-sdk');
//fs = require('fs');
// import {uploadFile} from './hello.js';

var messages = [],
lastUserMessage = "",
botMessage = "how can I help you ",
imageList = null,
botName = 'Chatbot';
var config = {
          apiKey : 'Aw6Pqn4Ef51vqKQg1nxgn6kdKU5ijBNuBxqPLL91',
          invokeUrl : 'https://pqj9shseg5.execute-api.us-west-2.amazonaws.com/test',
          region : REGION
};

var apigClientFactory = require('aws-api-gateway-client').default;
var apigClient = apigClientFactory.newClient(config);
var params = {};

function chatbotResponse() {

   if (document.getElementById("chatbox").value !== "") {
      lastUserMessage = document.getElementById("chatbox").value;
      messages.push(lastUserMessage);
      document.getElementById("chatbox").value = "";
      var body = {
        "question" : lastUserMessage,
      };
      var additionalParams = {
        headers : {},
        queryParams: {}
      };
      apigClient.invokeApi(params, '/search', 'GET', additionalParams, body).then(function(result) {
        console.log("Sucessfully got chatbot response");
        botMessage = String(JSON.parse(result.data.body).answer);
        imageList = JSON.parse(result.data.body).imageList;
        console.log(result)
        console.log(imageList)
        var myNode = document.getElementById("myImg");
        while (myNode.firstChild) {
            myNode.removeChild(myNode.firstChild);
        }
