'use strict';
var environment = process.env.NODE_ENV || 'development';
var knex= require('../knexfile.js');
var config= knex[environment];
module.exports =require('knex')(config);
