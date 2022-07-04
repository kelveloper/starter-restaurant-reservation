export function validateReservation(reservation, errors){
    errors.messages = [];
    const {
        first_name,
        last_name,
        mobile_number,
        reservation_time,
        reservation_date,
        people,
    } = reservation;  

    const current = new Date();
    const resDate = `${reservation_date} ${reservation_time}`
    const valid = new Date(resDate.toString());
    const validUTC = new Date(valid.toUTCString());

    if(!first_name) errors.messages.push("Missing first name");
    if(!last_name) errors.messages.push("Missing last name");
    if(!mobile_number) errors.messages.push("Missing mobile number");
    if(!reservation_time) errors.messages.push("Missing time");
    if(!reservation_date)errors.messages.push("Missing date");
    if(!people) errors.messages.push("Missing paty size");

    if(reservation_date && isNaN(Date.parse(reservation_date))){
        errors.messages.push('Date is not valid'); 
    };
    if(validUTC < current){ //displays an error message if the date of the reservation occurs in the past
        errors.messages.push('Date must be in the future'); 
    };
    if(valid.getDay() === 2){ //displays an error message if reservation date falls on a Tuesday
        errors.messages.push('Closed on tuesdays');
    };
    if(reservation_time && reservation_time < "10:30"){ //displays an error message if reservation time is before 10:30 AM 
        errors.messages.push('Pick a later time, we open at 10:30 AM');
      }
    if(reservation_time > "21:30"){ //displays an error message if reservation time is after the close time
        errors.messages.push('Pick an earlier time, we close at 9:30 PM');
      };
    if(errors.messages.length > 0){
        return false;
    };

    return true;
};