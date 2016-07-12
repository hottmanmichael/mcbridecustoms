'use strict';
//AJAX

function Ajax(url, data, callback) {
    var req = new XMLHttpRequest();
    req.onload = function() {
        return callback(JSON.parse(req.responseText));
    };
    req.open('POST', url);
    req.setRequestHeader('Content-Type', 'application/json');
    req.setRequestHeader('Accept', 'application/json');
    req.send(JSON.stringify(data));
}

module.exports = {
    Ajax: Ajax
};
