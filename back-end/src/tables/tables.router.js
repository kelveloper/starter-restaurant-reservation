
const router = require("express").Router();
const controller = require("./tables.controller");
const reservationRouter = require("../reservations/reservations.router");
const methodNotAllowed = require("../errors/methodNotAllowed");

router.use("/reservations/:reservation_id", reservationRouter);

router.route("/")
    .get(controller.list)
    .post(controller.create)
    .all(methodNotAllowed);

router.route("/:table_id/seat")
    .put(controller.seat)
    .delete(controller.unseat)
    .all(methodNotAllowed);

module.exports = router;