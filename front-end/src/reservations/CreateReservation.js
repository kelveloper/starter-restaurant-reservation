import React, { useState} from "react";
import ErrorAlert from "../layout/ErrorAlert";
import { useHistory } from "react-router-dom";
import { createReservation } from "../utils/api";
import { validateReservation } from "../utils/reservationValidations";
import ReservationForm from "./ReservationForm";
import { Link } from "react-router-dom";

export default function CreateReservation() {
    const [newForm, setNewForm] = useState({
      first_name: "",
      last_name: "",
      mobile_number: "",
      reservation_date: "",
      reservation_time: "",
      people: "",
    });
    const [reservationError, setReservationError] = useState(null)
    const [errors, setErrors] = useState({"messages":[]});
    const history = useHistory();
  
    const handleForm = ({ target }) => {
        setErrors({"messages": [] });
        let value = target.value
        if(target.type === "number") {
            value = Number(value)
        }
        setNewForm({ ...newForm, [target.name]: value });
    };
  
    const handleSubmit = async (e) => {
        const abortController = new AbortController();
        e.preventDefault();
        const validated = validateReservation(newForm, errors);

        if(!validated){
            setErrors({...errors})
            return errors.messages;
        };
        // filling and submitting form creates a new reservation
        await createReservation( newForm, abortController.signal)
        .then(() => history.replace(`/dashboard?date=${newForm.reservation_date}`))
        .catch(setReservationError)

    return () => abortController.abort();
};
    return (
      <div>
        {/*     Navigation      */}
        <nav area-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to={"/"}>Dashboard</Link>
            </li>
            <li className="breadcrumb-item active" area-label="page">
              New Reservation
            </li>
          </ol>
        </nav>
        <ErrorAlert error ={reservationError} />
        <ReservationForm
          handleSubmit={handleSubmit}
          handleForm={handleForm}
          newForm={newForm}
          history={history}
          errors={errors}
        />
      </div>
    );
  }