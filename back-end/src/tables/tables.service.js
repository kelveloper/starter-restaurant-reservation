const knex = require("../db/connection");

function list() {
    return knex("tables")
    .select("*")
    .orderBy("table_name")
}

function create(newTable) {
    return knex("tables")
    .insert(newTable)
    .returning("*")
    .then((createdTable) => createdTable[0])
}

function read(table_id) {
    return knex("tables")
    .select("*")
    .where({ table_id })
    .first();
}

function update(updatedTable) {
    return knex("tables")
    .select("*")
    .where({ "table_id": updatedTable.table_id })
    .update(updatedTable.reservation_id, "*")
    .then((updatedRecord) => updatedRecord[0])
}

function seat(table_id, reservation_id) {
    return knex.transaction(async (transaction) => {
      await knex("reservations")
        .where({"reservation_id": reservation_id })
        .update({ status: "seated" }) //returns 200 and changes reservation status to 'seated'
        .transacting(transaction);
      return knex("tables")
        .where({ "table_id": table_id })
        .update({
            "occupied": true,
            "reservation_id": reservation_id 
        })
        .transacting(transaction)
        .then((records) => records[0]);
    });
}

function unseat(table_id, reservation_id){
    return knex.transaction(async (transaction) => {
            await knex("reservations")
            .where({"reservation_id": reservation_id })
                //returns 200 and changes reservation status to 'finished'
            .update({ status: "finished" })
            .transacting(transaction);
            return knex("tables")
            .where({ "table_id": table_id })
            .update({
                "occupied": false,
                "reservation_id": null
            })
            .transacting(transaction)
            .then((records) => records[0]);
        });
    }



function destroy(reservation_id) {
    return knex("tables")
    .where({ reservation_id })
    .del()
}

module.exports = {
    list,
    create,
    read,
    update,
    seat, 
    unseat,
    delete: destroy,
}