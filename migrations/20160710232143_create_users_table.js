'use strict';
exports.up = function(knex, Promise) {
    return knex.schema.createTable('admins', function(table) {
        table.increments();
        table.string('username');
        table.string('password');
        table.timestamp('last_logged_in').defaultTo(knex.fn.now());
        table.timestamp('logged_in_date').defaultTo(knex.fn.now());
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('admins');
};
