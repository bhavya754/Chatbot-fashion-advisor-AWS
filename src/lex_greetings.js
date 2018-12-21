'use strict';
 // --------------- Helpers to build responses which match the structure of the necessary dialog actions -----------------------

function elicitSlot(sessionAttributes, intentName, slots, slotToElicit, message) {
    return {
        sessionAttributes,
        dialogAction: {
            type: 'ElicitSlot',
            intentName,
            slots,
            slotToElicit,
            message,
        },
    };
}

function close(sessionAttributes, fulfillmentState, message) {
    return {
        sessionAttributes,
        dialogAction: {
            type: 'Close',
            fulfillmentState : fulfillmentState,
            message : message,
        },
    };
}

function delegate(sessionAttributes, slots) {
    return {
        sessionAttributes,
        dialogAction: {
            type: 'Delegate',
            slots,
        },
    };
}

function greeting(intentRequest, callback) {
    console.log('Inside greeting function');
    var userid = intentRequest.userId;
    var response = null;
    var AWS = require("aws-sdk");
    AWS.config.update({
      region: "us-west-2",
    });
    var docClient = new AWS.DynamoDB.DocumentClient();
    console.log("Querying for user from dynamodb.");
    var params = {
        TableName : "cloud_project_user",
        KeyConditionExpression: "#userid = :userid",
        ExpressionAttributeNames:{
            "#userid": "userid"
        },
        ExpressionAttributeValues: {
            ":userid": userid
        }
    };
    docClient.query(params, function(err, data) {
        if (err) {
            console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
        } else {
            console.log("Query succeeded.", data.Items);
            if(data.Items.length > 0) {
                response = 'Hi ' + data.Items[0].username + '! Welcome back. How may I help you today?';
            }
            else {
                response = 'Hi, Welcome to Fashionista! Please answer a few questions to enjoy our services. Type yes to proceed.';
            }
            console.log(response);
            callback(close(intentRequest.sessionAttributes, 'Fulfilled',
            { contentType: 'PlainText', content: response }));
            // data.Items.forEach(function(item) {
            //     console.log(" -", item.year + ": " + item.title);
            // });
        }
    });
}

 // --------------- Intents -----------------------

/**
 * Called when the user specifies an intent for this skill.
 */
function dispatch(intentRequest, callback) {
    console.log(`dispatch userId=${intentRequest.userId}, intentName=${intentRequest.currentIntent.name}`);

    const intentName = intentRequest.currentIntent.name;

    // Dispatch to your skill's intent handlers
    if (intentName === 'GreetingsIntent') {
        return greeting(intentRequest, callback);
    }
    throw new Error(`Intent with name ${intentName} not supported`);
}

// --------------- Main handler -----------------------

// Route the incoming request based on intent.
// The JSON body of the request is provided in the event slot.
exports.handler = (event, context, callback) => {
    try {
        console.log(`event.bot.name=${event.bot.name}`);

        /**
         * Uncomment this if statement and populate with your Lex bot name and / or version as
         * a sanity check to prevent invoking this Lambda function from an undesired Lex bot or
         * bot version.
         */
        if (event.bot.name !== 'cloud_project') {
             callback('Invalid Bot Name');
        }
        dispatch(event, (response) => callback(null, response));
    } catch (err) {
        callback(err);
    }
};