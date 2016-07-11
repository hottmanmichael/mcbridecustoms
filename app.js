'use strict';

require('dotenv').config();

var express = require('express'),
    app = express(),
    path = require('path'),
    logger = require('morgan'),
    bodyParser = require('body-parser'),
    cookieSession = require('cookie-session');


app.use(logger('dev'));
app.use(express.static(__dirname+'/public'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
var session = cookieSession({
    name: 'melden',
    keys: [process.env.SECRET_ONE, process.env.SECRET_TWO]
});
app.use(session);


//route handler
var routes = {
    index: require('./routes/index'),
    admin: require('./routes/admin')
};

app.use('/', routes.index);
app.use('/auth', routes.admin);





const port = process.env.PORT || 3000;
app.listen(port, function() {
    console.log("listening on ", port);
});
