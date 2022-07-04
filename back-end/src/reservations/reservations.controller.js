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
  "created_at",
  "updated_at",
  "status",
];
const hasRequiredFields = hasProperties(
  "first_name",
  "last_name",
  "mobile_number",
  "people",
  "reservation_date",
  "reservation_time", 
);

/*        VAILDATION FUNCTIONS           */
async function reservationExists(req, res, next) {
  const { reservation_id } = req.params;
  const reservation = await service.read(Number(reservation_id));

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
  const standard = /([01]?[0-9]|2[0-3]):[0-5][0-9]/; //matching HH:MM time format
 
  if(reservation_time.match(standard)){
    return next();
  }
  next({status:400, message: "reservation_time is not valid"});
};

//returns 400 if people is not a number
function validPeople(req, res, next){
  const { people } = req.body.data
  
  if(typeof people == "number") {
    return next();
  };
  next({status: 400, message: "people is not a number"});
};

//returns 400 if reservation occurs in the past
function notPast(req, res, next){ 
  const date = req.body.data.reservation_date;
  const time = req.body.data.reservation_time;

  
  const current = new Date();
  const dateString = new Date(`${date} ${time}`).toUTCString();
  const valid = new Date(dateString);

  if(current < valid){
    return next();
  };
  next({status:400, message: `reservation must be in the future `});
};

//returns 400 if reservation_date falls on a tuesday
function notTues(req, res, next){ 
  const date = req.body.data.reservation_date;
  const time = req.body.data.reservation_time;

  const valid = new Date(`${date} ${time}`)
  if(valid.getDay() !== 2){
    
    return next();
  };
  next({status:400, message: "closed on Tuesdays"});
};

//returns 400 if reservation_time is not available
function avaiableTime(req, res, next){
  const resTime = req.body.data.reservation_time;
  if(resTime < "10:30"){
    return next({status: 400, message: "Pick a later time"});
  }
  else if(resTime > "21:30"){
    return next({status: 400, message: "Pick an earlier time"});
  };
  next()
};

//returns 400 if status is 'seated' or 'finished'
function checkStatus(req, res, next){
  const {data: {status} = {}} = req.body;
  if(status === 'seated') return next({status: 400, message:`status is seated`});
  if(status === 'finished') return next({status: 400, message:`status is finished`});
  next();
};

function hasValidStatus(req, res, next) {
  const { status } = req.body.data;
  const validStatus = [
    "booked",
    "seated",
    "finished",
    "cancelled",
  ];

  if (!validStatus.includes(status)) {
    return next({ status: 400, message: `${status} unknown, please select a valid status: ${validStatus.join(", ")}`}) 
  }
  next();
}

//returns 400 if status is currently finished (a finished reservation cannot be updated)
function finishedReserve(req, res, next){
  const reservation = res.locals.reservation;
  if(reservation.status === 'finished' || reservation.status === 'cancelled') return next({status:400, message: `a finished reservation cannot be updated`})
  next();
};

 /*         CRUD          */
 async function list(req, res) {
  const { date, mobile_number } = req.query

  if(date) {
    const data = await service.readDate(date);
    res.json({ data })
  } else { 
    const data = await service.search(mobile_number)
    res.json({ data })
  }
};

async function read(req, res){
  const data = await service.read(res.locals.reservation.reservation_id);
  
  res.json({ data })
};

async function create(req, res) {
  const data = await service.create(req.body.data);

  res.status(201).json({ data });
};

async function update(req, res) {
  const updatedReservation = {
    ...req.body.data,
  };
  data = await service.update(updatedReservation);
  
  res.json({data: data[0]});
}

async function updateStatus(req, res) {
  const { status } = req.body.data;
  const { reservation_id } = req.params;
  
  const results = await service.updateByStatus(
    reservation_id,
    status
  );
 
  //returns 200 for status 'booked', 'seated', 'finished'
  res.status(200).json({ data: results });
}

module.exports = {
  list: [asyncErrorBoundary(list)],
  create: [
    hasRequiredFields, 
    hasOnlyValidProperties, 
    validPeople, 
    validDate, 
    validTime, 
    notPast,
    notTues, 
    avaiableTime,
    checkStatus,
    asyncErrorBoundary(create)
  ],
  read: [reservationExists, asyncErrorBoundary(read)],
  update: [
    reservationExists, 
    hasRequiredFields, 
    validDate,
    validPeople,
    validTime, 
    asyncErrorBoundary(update)
  ],
  updateStatus: [
    asyncErrorBoundary(reservationExists), 
    finishedReserve, 
    hasValidStatus, 
    asyncErrorBoundary(updateStatus)
  ],
};