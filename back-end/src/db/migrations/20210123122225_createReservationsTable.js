exports.up = function (knex) {
  return knex.schema.createTable("reservations", (table) => {
    table.increments("reservation_id").primary();
    table.string("first_name").notNullable();
    table.string("last_name").notNullable();
    table.string("mobile_number").notNullable();
    table.date("reservation_date").notNullable();
    table.string("reservation_time").notNullable();
    table.string("status").defaultTo("booked"); //returns 201 if status is 'booked'
    table.integer("people").notNullable();
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("reservations");
};
