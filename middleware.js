'use strict';
var middleware = {
    authenticate: function(req, res, next) {
        //to access /home routes, user must be logged in
        if (!req.session.user) {
            //if user is not logged in
            return res.redirect('/auth/login');
        }
        return next();
    },
};

module.exports = middleware;
