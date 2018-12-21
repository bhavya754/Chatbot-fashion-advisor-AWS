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

// ---------------- Helper Functions --------------------------------------------------

function buildValidationResult(isValid, violatedSlot, messageContent) {
    if (messageContent == null) {
        return {
            isValid,
            violatedSlot,
        };
    }
    return {
        isValid,
        violatedSlot,
        message: { contentType: 'PlainText', content: messageContent },
    };
}

function validateUserInfo(userid, username, dob, gender, location) {
    // if(age && (age < 15 || age > 100)) {
    //     return buildValidationResult(false, 'age', "Invalid age! Please enter age between (15-100) years.");
    // }
    if(dob) {
        var pattern =/^([0-9]{2})\/([0-9]{2})\/([0-9]{4})$/;
        if(!pattern.test(dob)) {
            return buildValidationResult(false, 'dob', "Invalid date of birth!");
        }
    }
    if(gender && gender !== 'M' && gender !== 'F' && gender !== 'NA') {
        return buildValidationResult(false, 'gender', "Invalid gender! Please enter 'M' for male, 'F' for female or 'NA' if you don't want to divulge your gender.");
    }
    return buildValidationResult(true, null, null);
}

 // --------------- Functions that control the bot's behavior -----------------------

/**
 * Performs dialog management and fulfillment for fashion advisor chatbot.
 *
 * Beyond fulfillment, the implementation of this intent demonstrates the use of the elicitSlot dialog action
 * in slot validation and re-prompting.
 *
 */
function greeting(intentRequest, callback) {
    const slots = intentRequest.currentIntent.slots;
    console.log(slots);
    const userid = intentRequest.userId;
    const username = slots.username;
    const dob = slots.dob;
    const location = slots.location;
    const gender = slots.gender;
    const source = intentRequest.invocationSource;
    console.log(userid, username, dob, gender, location);
    if(userid && username && dob && gender && location) {
        console.log('inside');
        var AWS = require('aws-sdk');
        AWS.config.update({region: 'us-west-2'});
        var ddb = new AWS.DynamoDB({apiVersion: '2012-10-08'});
        var params = {
          TableName: 'cloud_project_user',
          Item: {
            'userid' : {S: userid},
            'username' : {S: username},
            'dob' : {S: dob},
            'gender': {S: gender},
            'location': {S: location}
          }
        };
        ddb.putItem(params, function(err, data) {
          if (err) {
            console.log("Error writing user to db", err);
          } else {
            console.log("Success writing user to db", data);
          }
        });
    }
    if (source === 'DialogCodeHook') {
        console.log('validate');
        // Perform basic validation on the supplied input slots.  Use the elicitSlot dialog action to re-prompt for the first violation detected.
        const slots = intentRequest.currentIntent.slots;
        const validationResult = validateUserInfo(userid, username, dob, gender, location);
        if (!validationResult.isValid) {
            slots[`${validationResult.violatedSlot}`] = null;
            callback(elicitSlot(intentRequest.sessionAttributes, intentRequest.currentIntent.name, slots, validationResult.violatedSlot, validationResult.message));
            return;
        }
        const outputSessionAttributes = intentRequest.sessionAttributes;
        callback(delegate(outputSessionAttributes, intentRequest.currentIntent.slots));
        return;
    }
    // add stuff to dynamo
    callback(close(intentRequest.sessionAttributes, 'Fulfilled',
    { contentType: 'PlainText', content: `Thanks ${username} for registering with Fashionista! To continue chatting to get fashion tips for your next event and catch up on latest fashion trends, enter your query.` }));
}

 // --------------- Intents -----------------------

/**
 * Called when the user specifies an intent for this skill.
 */
function dispatch(intentRequest, callback) {
    console.log(`dispatch userId=${intentRequest.userId}, intentName=${intentRequest.currentIntent.name}`);

    const intentName = intentRequest.currentIntent.name;

    // Dispatch to your skill's intent handlers
    if (intentName === 'GetUserInfoIntent') {
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