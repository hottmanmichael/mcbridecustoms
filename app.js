'use strict';

require('dotenv').config();

var express = require('express'),
    app = express(),
    path = require('path'),
    logger = require('morgan'),
    bodyParser = require('body-parser'),
    cookieSession = require('cookie-session'),
    methodOverride = require('method-override');

var authenticate = require('./middleware').authenticate;

app.use(logger('dev'));
app.use(express.static(__dirname+'/public'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride('_method'));
var session = cookieSession({
    name: 'mcbc',
    keys: [process.env.SECRET_ONE, process.env.SECRET_TWO]
});
app.use(session);


//route handler
var routes = {
    index: require('./routes/index'),
    admin: require('./routes/admin'),
    auth: require('./routes/auth')
};

app.use('/', routes.index);
app.use('/auth', routes.auth);
app.use('/admin', authenticate, routes.admin);




// error handlers
//handle any other routes that don't exist
app.use('*', function(req, res, next) {
    var err = new Error('Page Not Found');
    err.status = 404;
    next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    console.log("env = development");
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        var issue = JSON.stringify({
            error: {
                message: err.message,
                error: err
            },
            stack: err.stack
        });
        res.send(issue);
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('404', {
        error: {
            message: err.message,
            error: err.status
        }
    });
});



const port = process.env.PORT || 3000;
app.listen(port, function() {
    console.log("listening on ", port);
});
