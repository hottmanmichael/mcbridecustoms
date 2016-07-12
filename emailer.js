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
        'to' : data.to,
        'subject' : data.subject,
        'template': 'Contact Form',
        'merge_body':data.text_body,
        'merge_subject': data.subject,
        'merge_first_name': data.name
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
            return callback(null, chunk);
        });
        res.on('error', function (e) {
            return callback(e, null);
        });
    });

    // Post to Elastic Email
    post_req.write(post_data);
    post_req.end();

}


function sms(data, callback) {
    var post_data = queryString.stringify({
        'api_key': process.env.ELASTIC_EMAIL_API_KEY,
        // 'from': 'Me',
        'to' : 19705679883,
        'subject': 'Hello there'
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
            return callback(null, chunk);
        });
        res.on('error', function (e) {
            return callback(e, null);
        });
    });

    // Post to Elastic Email
    post_req.write(post_data);
    post_req.end();
}


module.exports = {
    send: send,
    sms: send
};
