'use strict';

var request = require('request');
var https = require('https');
var queryString = require('query-string');


function send(data, callback) {
    // Make sure to add your username and api_key below.
    var post_data = queryString.stringify({
        'username' : process.env.ELASTIC_EMAIL_USERNAME,
        'api_key': process.env.ELASTIC_EMAIL_API_KEY,
        'from': data.email,
        'from_name' : data.name,
        'to' : process.env.ELASTIC_EMAIL_TO_ADDRESS,
        'subject' : data.subject,
        'template': 'Contact Form',
        'merge_text_body': data.message,
        'merge_subject': data.subject,
        'merge_name': data.name,
        'merge_email': data.email
    });

    // Object of options.
    var post_options = {
        host: 'api.elasticemail.com',
        path: '/mailer/send',
        port: '443',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': post_data.length
        }
    };
    // Create the request object.
    var post_req = https.request(post_options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {

            if (chunk.indexOf('Error') > -1) {
                return callback({
                    status: "error",
                    error: chunk,
                    message: "An error occured while sending your message"
                });
            } else {
                return callback({
                    status: 'success',
                    mid: chunk,
                    message: "Your message was sent successfully!"
                });
            }
        });
        res.on('error', function (e) {
            return callback({
                status: "error",
                error: e.message,
                message: "An error occured while sending your message"
            });
        });
    });

    // Post to Elastic Email
    post_req.write(post_data);
    post_req.end();

}


function sms(data, callback) {
    var post_data = queryString.stringify({
        'username' : process.env.ELASTIC_EMAIL_USERNAME,
        'api_key': process.env.ELASTIC_EMAIL_API_KEY,
        'from': 'Me',
        'to' : '+19705679883',
        'subject': 'Hello there',
        'body': 'hello!'
    });

    // Object of options.
    var post_options = {
        host: 'api.elasticemail.com',
        path: '/sms/send',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': post_data.length
        }
    };
    // Create the request object.
    var post_req = https.request(post_options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {

            if (chunk.indexOf('Error') > -1) {
                return callback({
                    status: "error",
                    error: chunk,
                    message: "An error occured while sending your message"
                });
            } else {
                return callback({
                    status: 'success',
                    mid: chunk,
                    message: "Your SMS was sent successfully!"
                });
            }
        });
        res.on('error', function (e) {
            return callback({
                status: "error",
                error: e.message,
                message: "An error occured while sending your message"
            });
        });
    });

    // Post to Elastic Email
    post_req.write(post_data);
    post_req.end();
}


module.exports = {
    send: send,
    sms: sms
};
