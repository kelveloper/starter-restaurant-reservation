const service = require("./tables.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const reservationService = require("../reservations/reservations.service")
const hasProperties = require("../errors/hasProperties");

const VALID_PROPERTIES = [
  "table_id", 
  "table_name", 
  "capacity", 
  "reservation_id", 
  "created_at", 
  "updated_at"
];
const hasRequiredFields = hasProperties(
  "table_name", 
  "capacity"
);

/*        VAILDATION FUNCTIONS           */

//returns 404 if reservation_id does not exist
async function tableExists(req, res, next) {
  const { table_id } = req.params;
  let table = await service.read(Number(table_id));

  if (table) {
    res.locals.table = table;
    return next();
  }
  next({ status: 404, message: `${table_id} cannot be found.` });
}

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

//returns 400 if table_name is one character
function hasTableName(req, res, next) {
  const {table_name} = req.body.data;

  if (!table_name || table_name.length < 2) {
    return next({ 
      status: 400, 
      message: "table_name must be at least two characters." 
    })
  }
  next();
}

//returns 400 if capacity is not a number
function validCap(req, res, next){
  const { data: { capacity } = {} } = req.body;

  if(typeof capacity == "number") {
    return next();
  };
  next({status: 400, message: "capacity is not valid"});
};

//returns 400 if table does not have sufficient capacity
function hasCap(req, res, next){
  const people = res.locals.reservation.people;
  const capacity = res.locals.table.capacity;
  
  if(capacity < people )  {
    return next({status:400, message: "not enough capacity"});
  };
  next();
};

//returns 400 if reservation_id or data is missing
function hasReservId(req, res, next){
  const {data: {reservation_id} = {}} = req.body;
  
  if(!req.body.data || !reservation_id) {
    return next({status: 400, message: "missing reservation_id or data"});
  };
  next();
};

//returns 404 if reservation_id does not exist
async function validReserve(req, res, next){
  const {data: {reservation_id} = {}} = req.body;
  const reservation = await reservationService.read(reservation_id);

  if(!reservation)return next({status: 404, message: `reservation ${reservation_id} does not exist`});
  //returns 400 if reservation is already 'seated'
  if(reservation.status === "seated")return next({status: 400, message: `${reservation_id} already seated`});
  
  res.locals.reservation = reservation;
  next();
};

function isOccupied(req, res, next){
  const table = res.locals.table;
  
  if(!table.occupied) {
    return next();
  };
  next({status:400, message: "table is occupied"});
};

/*      CRUD        */
async function list(req, res) {
  const data = await service.list();
  res.json({data});
};

async function create(req, res){
let value;
if(req.body.data.reservation_id)  value = true 

const data = await service.create({ ...req.body.data, occupied: value });
res.status(201).json({ data });
};

async function update(req, res) {
  const updatedTable = {
      ...req.body.data,
      table_id: res.locals.table.table_id,
  };
  const result = await service.update(updatedTable);
  res.json({ data: result });
}

async function seat(req, res, next) {
  const table_id = req.params.table_id;
  const reservation_id = req.body.data.reservation_id;
  
  const updated = await service.seat(table_id, reservation_id);
  res.status(200).json({ updated });
};

//returns 400 if table does not have sufficient capacity
async function unseat(req, res, next){
  const table = res.locals.table;
  const reservation_id = table.reservation_id;
  //returns 400 if table_id is not occupied
  console.log(table)
  if(!table.occupied) return next({status: 400, message: `table is not occupied`})

  const updated = await service.unseat(table.table_id, reservation_id)
  //returns 200 if table_id is occupied
  res.status(200).json({ updated });
};


module.exports = {
  list: [
    asyncErrorBoundary(list)
  ],

  create: [
    hasRequiredFields,
    hasOnlyValidProperties, 
    hasTableName,
    validCap,
    asyncErrorBoundary(create),
  ],

  update: [
    asyncErrorBoundary(tableExists), 
    hasOnlyValidProperties, 
    hasRequiredFields,
    asyncErrorBoundary(update)
  ],

  seat: [
    asyncErrorBoundary(tableExists),
    hasReservId,
    asyncErrorBoundary(validReserve),
    hasCap,
    isOccupied, 
    asyncErrorBoundary(seat),
  ],

  unseat: [
    asyncErrorBoundary(tableExists),
    asyncErrorBoundary(unseat),
  ],
};