const service = require("./reservations.service")
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const hasProperties = require("../errors/hasProperties");

const VALID_PROPERTIES = [
  "first_name",
  "last_name",
  "mobile_number",
  "reservation_date",
  "reservation_time",
  "people",
];
const hasRequiredFields = hasProperties(
  "first_name",
  "last_name",
  "mobile_number",
  "reservation_date",
  "reservation_time",
  "people"
);

/* VAILDATION FUNCTIONS */
async function reservationExists(req, res, next) {
  const { reservation_id } = req.params;
  const reservation = await service.read(reservation_id);

  if (reservation) {
    res.locals.reservation = reservation;
    return next();
  };
  next({ status: 404, message: `reservation_id not found: ${reservation_id}` });
};

//returns 400 when properties are empty/missing
function hasOnlyValidProperties(req, res, next) {
  const { data = {} } = req.body;
  const invalidFields = Object.keys(data).filter(
    (field) => !VALID_PROPERTIES.includes(field)
  );

  if (invalidFields.length) {
    return next({
      status: 400,
      message: `Invalid field(s): ${invalidFields.join(", ")}`,
    });
  }
  next();
}

//returns 400 if reservation_date is not a date
function validDate(req, res, next){
  const { data: { reservation_date } = {} } = req.body;
  const valid = new Date(reservation_date)
  if(valid.toString() != 'Invalid Date'){
    return next();
  };
  next({status:400, message: "reservation_date is not valid"});
};

//returns 400 if reservation_time is not a time    
function validTime(req, res, next) {
  const { data: { reservation_time } = {} } = req.body;
  const standard = /^\s*(0?\d|1[0-2]):[0-5]\d(\s+(AM|PM))?\s*$/i;
 
  if(reservation_time.match(standard)){
    return next();
  }
  next({status:400, message: "reservation_time is not valid"});
};

//returns 400 if people is not a number
function validPeople(req, res, next){
  const { data: { people } = {} } = req.body;

  if(typeof people == "number") {
    return next();
  };
  next({status: 400, message: "people quantity not valid"});
};

/* CRUD */
async function list(req, res) {
  const { date } = req.query

  if(date) {
    const data = await service.list(date);
    res.json({ data })
  }
};

async function create(req, res) {
  const data = await service.create(req.body.data);
  res.status(201).json({ data });
};

module.exports = {
  list: asyncErrorBoundary(list),
  create: [hasRequiredFields, hasOnlyValidProperties, validPeople, validTime, validDate, asyncErrorBoundary(create) ],
};