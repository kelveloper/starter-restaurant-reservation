import React, { useEffect, useState} from "react";
import { useHistory, useParams } from "react-router-dom";
import { updateReservationInfo, readReservation } from "../utils/api";
import { validateReservation } from "../utils/reservationValidations";
import ErrorAlert from "../layout/ErrorAlert";
import { formatAsTime } from "../utils/date-time";
import ReservationForm from "./ReservationForm";


export default function EditReservation(){
    const [errors, setErrors] = useState({"messages":[]});
    const history = useHistory();
    const {reservation_id} = useParams();

    
    const [currentReservation, setCurrentReservation] = useState({});
    const [currentReservationError, setCurrentReservationError] = useState(null);

    useEffect(loadReservation, [reservation_id]);

    function loadReservation(){
        const abortController = new AbortController();
        setCurrentReservationError(null);
        readReservation(reservation_id, abortController.signal)
            .then(setCurrentReservation)
            .catch(setCurrentReservationError)
        return () => abortController.abort();
        };


    const handleForm = (event) => {
        setErrors({"messages": [] });
        const { name, value } = event.target;
        setCurrentReservation({...currentReservation, [name]: value});
    };

    const handleSubmit = async (event) => {
        const abortController = new AbortController();
        event.preventDefault();
        const validated = validateReservation(currentReservation, errors);

        if(!validated){
            setErrors({...errors})
            return errors.messages;
        };

        const reservation = {
                    ...currentReservation,
                    reservation_time: formatAsTime(currentReservation.reservation_time),
                    people: Number(currentReservation.people),
        };

        await updateReservationInfo(currentReservation.reservation_id, {data: reservation}, abortController.signal)
        .then(() => {history.push({
                pathname: "/dashboard",
                search:`?date=${currentReservation.reservation_date}`
        })})
        return () => {
            abortController.abort();
        };
    };
    
    return (<>
        <div className="container p-3 my-2 bg-dark text-white">
            <div className="row m-5 justify-content-center">
                <div className="col-4.5  p-3 bg-dark text-white">
                    <h1 className="m-3">Edit a Reservation</h1>
                </div>
            </div>
        </div>
        <div className="container p-3 my-2">  
        <ErrorAlert error={currentReservationError}/> 
        <ReservationForm newForm={currentReservation} errors={errors} handleSubmit={handleSubmit} handleForm={handleForm}/>
        </div>
   </> );
};