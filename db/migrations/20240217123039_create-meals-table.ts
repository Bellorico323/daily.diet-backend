import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('meals', (table) => {
    table.uuid('id').notNullable().primary()
    table.text('name').notNullable()
    table.text('description').notNullable()
    table.text('meal_hour').notNullable()
    table.text('type').notNullable()
    table.text('user_id').notNullable()

    table
      .foreign('user_id')
      .references('id')
      .inTable('users')
      .onDelete('CASCADE')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('meals')
}
