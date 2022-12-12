// const axios = require('axios')
// const url = 'http://checkip.amazonaws.com/';
let response;
const mysql = require('mysql');

var config = require('./config.json');

var pool = mysql.createPool({
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database
});

function query(conx, sql, params) {
    return new Promise((resolve, reject) => {
        conx.query(sql, params, function(err, rows) {
            if (err) {
                // reject because there was an error
                reject(err);
            } else {
                // resolve because we have result(s) from the query. it may be an empty rowset or contain multiple values
                resolve(rows);
            }
        });
    });
}


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

    
    let getAllProjects = () => {
    return new Promise((resolve, reject) => {
                pool.query("SELECT * FROM Project", (error, rows) => {
                    if (error) { return reject(error); }
                    if (rows) {
                        return resolve(rows);
                    } else {
                        return reject("there are no projects");
                    }
                });
            });

    };

    let failProject = (projectName) => {
        return new Promise((resolve, reject) => {
            pool.query("UPDATE Project SET successful=false WHERE name=?", [projectName], (error, rows) => {
                if (error) { return reject(error); }
                    if (rows.affectedRows == 1) {
                        return resolve(true);
                    } else {
                        return reject("there are no projects");
                    }
                });
        });
    };
    
    let succeedProject = (projectName) => {
        return new Promise((resolve, reject) => {
            pool.query("UPDATE Project SET successful=true WHERE name=?", [projectName], (error, rows) => {
                if (error) { return reject(error); }
                    if (rows.affectedRows == 1) {
                        return resolve(true);
                    } else {
                        return reject("there are no projects");
                    }
                });
        });
    };

   
   try {
        // DATABASE STUFF HERE
        
        // receive a POST    
        // {“type” : “administrator”, “email” : “xxx@gmail.com”,  “password” : “xxx”} 
        // have to add database stuff here
        // return on 200 list of all projects ever
        
        // {“projects” : [{"name” : “project1”, “description” : “this project is”,  

        // “entrepreneur” : “xxx@gmail.com”, “type” : “film”, “goal” : 1000,  

        // “deadline” : “12-01-2022", “active-pledges” : [{...}, …]. “direct-supports” : [{...}, ...],  

        // “successful” : false, “launched” : false}, …]} 
        
        // const ret = await axios(url);
        let projects = await getAllProjects();
        
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1;
        var yyyy = today.getFullYear();
        
        if(projects) {
            
            for (let i = 0; i<projects.length; i++) {
                let project = projects[i];
                
                let projectYear = parseInt(project.deadline.substring(0, 4), 10);
                if (projectYear < yyyy) {
                    if (project.amountRaised < project.goal) {
                        const failed = await failProject(project.name);
                    }
                    else {
                        const succeeded = await succeedProject(project.name)
                    }
                }
                
                else if (projectYear === yyyy) {
                    let projectMonth = parseInt(project.deadline.substring(5, 7), 10);
                        if (projectMonth < mm) {
                            if (project.amountRaised < project.goal) {
                            const failed = await failProject(project.name);
                        }
                        else {
                            const succeeded = await succeedProject(project.name)
                        }
                    }
                    
                    else if (projectMonth === mm) {
                        let projectDay = parseInt(project.deadline.substring(8, 10), 10);
                        if (projectDay < dd) {
                            if (project.amountRaised < project.goal) {
                                const failed = await failProject(project.name);
                            }
                            
                            else {
                                const succeeded = await succeedProject(project.name)
                            }
                        }
                    }   
                }
            }
            response.statusCode = 200;
            response.result  = true;
        }else {
            response.statusCode = 400;
            response.error = "Couldn't find projects ";
        }
        
        
        
    } 
    catch (err) {
        console.log(err);
        return err;
    }

    return response
};