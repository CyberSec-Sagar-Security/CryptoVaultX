/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('users', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.text('name').notNullable();
    table.text('email').notNullable().unique();
    table.text('password_hash').notNullable();
    table.boolean('is_email_verified').defaultTo(false);
    table.timestamps(true, true); // created_at and updated_at
    table.timestamp('last_login_at').nullable();
    table.text('role').defaultTo('user');
    
    // Create index on email for faster lookups
    table.index('email');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('users');
};
