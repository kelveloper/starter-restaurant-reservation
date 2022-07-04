const knex = require("../db/connection");

function list(date) {
    return knex("reservations")
        .select('*')
        .where({ reservation_date: date })
        .orderBy('reservation_time')
};

function create(reservation) {
    return knex("reservations")
        .insert(reservation,"*")
        .then((updatedRecords) => updatedRecords[0]);
};

function read(reservation_id){
    return knex("reservations")
        .select("*")
        .where({reservation_id : reservation_id})
        .first();
};

function update(updatedReservation) {
    return knex("reservations")
        .select("*")
        .where({ reservation_id : updatedReservation.reservation_id })
        .update(updatedReservation, "*")
}

//update a resservation given it's status 
function updateByStatus(reservation_id, status) {
    return knex("reservations")
        .where({ reservation_id })
        .update("status", status)
        .returning("*")
        .then((updatedStatus) => updatedStatus[0])
}

function readDate(date){
    return knex("reservations")
        .select("*")
        .where({ reservation_date: date })
        .whereNot({ status: "finished"}) //does not include 'finished' reservations 
        .andWhereNot({ status: "cancelled"})
        .orderBy('reservation_time');
        //.whereRaw("status is null or status <> 'finished' or status <> 'cancelled'")
};

// //returns reservations for a partial existing phone number
function search(mobile_number) {
    return knex("reservations")
      .whereRaw(
        "translate(mobile_number, '() -', '') like ?",
        `%${mobile_number.replace(/\D/g, "")}%`)
      .orderBy("reservation_date");
};

module.exports = {
    list,
    create,
    read, 
    update,
    updateByStatus,
    readDate,
    search,
}