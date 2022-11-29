// const axios = require('axios')
// const url = 'http://checkip.amazonaws.com/';
let response;
// const mysql = require('mysql');

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html 
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 * 
 */
exports.lambdaHandler = async (event, context) => {
    
    context.callbackWaitsForEmptyEventLoop = false;

   // ready to go for CORS. To make this a completed HTTP response, you only need to add a statusCode and a body.
    let response = {
        headers: {
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Origin": "*", // Allow from anywhere
            "Access-Control-Allow-Methods": "POST" // Allow POST request
        }
    }; // response


    let actual_event = event.body;
    let info = JSON.parse(actual_event);
    console.log("info:" + JSON.stringify(info)); //  info.arg1 and info.arg2

    try {
        // DATABASE STUFF HERE
        
        // receive a POST    
        // {“email” : “xxx@gmail.com”, “projectName” : “project1”} 
        // have to add database stuff here
        // return on 200 {“name” : “project1”, “description” : “this project is”,  “entrepreneur” : “xxx@gmail.com”, “type” : “film”, “goal” : 1000,  “deadline” : “12-01-2022", “active-pledges” : [{...}, ...], “direct-supports” : [{...}, ...],  “successful” : false, “launched” : false} 
        
        // const ret = await axios(url);
        response.statusCode = 200;
        response.body  = JSON.stringify({
            //project info from database
        })
        
    } catch (err) {
        console.log(err);
        return err;
    }

    return response
};
