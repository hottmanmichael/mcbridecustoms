'use strict';
exports.up = function(knex, Promise) {
    return knex.schema.table('gallery', function(table) {
        table.string('cloudinary_id');
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.table('gallery', function(table) {
        table.dropColumn('cloudinary_id');
    });
};
