console.log('Loading chatbot lambda function');
exports.handler = (event, context, callback) => {
    console.log("request body: " + JSON.stringify(event));
    let question = "hi";
    let sessionToken = "12345";
    let answer = "This is confusing. I've still got a lot to learn.";
    let responseCode = 200;
    if (event.body !== null && event.body !== undefined) {
        let requestBody = JSON.parse(event.body);
        question = requestBody.question;
        //sessionToken = requestBody.sessionToken;
        //console.log(question, sessionToken);
    }
    var AWS = require('aws-sdk');
    var lexruntime = new AWS.LexRuntime({apiVersion: '2016-11-28', region : 'us-west-2'});
    var params = {
      botAlias: 'test', /* required */
      botName: 'cloud_project', /* required */
      contentType: 'text/plain; charset=utf-8', /* required */
      inputStream: question, /* required */
      userId: sessionToken, /* required */
      accept: 'text/plain; charset=utf-8',
      requestAttributes : {},
      sessionAttributes : {}
    };
    if(event.httpMethod === 'POST') {
    lexruntime.postContent(params, function (err, data) {
      if (err) {
          responseCode = 500;
          console.log('Error lex', err); // an error occurred
      }
      else{
          answer = data.message;
          console.log('Sucess lex', data);           // successful response
          var responseBody = {
            answer: answer,
            input: event
        };
        var response = {
            statusCode: responseCode,
            headers: {
                "Access-Control-Allow-Origin" : "*",
                "Access-Control-Allow-Credentials" : true,
                "Access-Control-Allow-Methods" : "*",
                "Access-Control-Allow-Headers" : "*",
            },
            body: JSON.stringify(responseBody)
        };
        console.log("response: " + JSON.stringify(response))
        callback(null, response);
      }
    });
    }
    else {
      callback(null, {statusCode : responseCode,
        headers: {
                "Access-Control-Allow-Origin" : "*",
                "Access-Control-Allow-Credentials" : true,
                "Access-Control-Allow-Methods" : "*",
                "Access-Control-Allow-Headers" : "*",
            },
            body: JSON.stringify(
              {
            answer: 'OPTIONS request',
            input: null
        }
              )
      });
    }
};