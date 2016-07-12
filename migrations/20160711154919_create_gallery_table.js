'use strict';
exports.up = function(knex, Promise) {
    return knex.schema.createTable('gallery', function(table) {
        table.increments();
        table.string('title');
        table.boolean('isFeatured').defaultTo('false');
        table.string('img_url', 2083).notNullable();
        table.string('slug').notNullable();
        table.timestamp('uploaded_at').defaultTo(knex.fn.now());
        table.integer('order');
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('gallery');
};
