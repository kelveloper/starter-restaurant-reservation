import { useEffect, useState } from "react";
import { useParams, useHistory } from "react-router";
import { listTables, updateTableStatus, readReservation } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import { today } from "../utils/date-time";


export default function SeatReservation(){
    const history = useHistory();
    const {reservation_id} = useParams();
    const [selectedTableID, setSelectedTableID] = useState(null);
    const [tables, setTables] = useState([]);
    const [tablesError, setTablesError] = useState("");
    
    const [currentReservation, setCurrentReservation] = useState({});
    const [currentReservationError, setCurrentReservationError] = useState(null);
 
    useEffect(loadTables, []);
    useEffect(loadReservation, [reservation_id]);

    function loadTables(){
            const abortController = new AbortController();
            setTablesError(null);
            listTables(abortController.signal)
                .then((tables) => {
                setTables(tables);
                setSelectedTableID(tables[0].table_id);
              })
                .catch(setTablesError)
            return () => abortController.abort();
    };

    function loadReservation(){
        const abortController = new AbortController();
        setCurrentReservationError(null);
        readReservation(reservation_id, abortController.signal)
            .then(setCurrentReservation)
            .catch(setCurrentReservationError)
        return () => abortController.abort();
    };

    function handleChange({ target }) {
            setSelectedTableID(target.value);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const abortController = new AbortController();
        setTablesError(null);
        let foundTable = tables.find((table) => table.table_id === Number(selectedTableID));

        if(currentReservation.people > foundTable.capacity) { //Necessary??????
            setTablesError({message: "Party size is greater then table capacity, choose another table."})
            return
        };
        updateTableStatus(selectedTableID, { data: { reservation_id } }, 'PUT', abortController.signal)
            .then(() => {history.push({
                pathname: "/dashboard",
                search:`?date=${currentReservation.reservation_date}`})
             })
            .catch(setTablesError)
        return () => abortController.abort();
    };

    const tableOptions = tables.map((table) => (
        <option key={Number(table.table_id)} value={Number(table.table_id)}>
          {table.table_name} - {table.capacity}
        </option>));

    return (
    <> 
        <div className="container p-3 my-2 bg-dark text-white">
            <div className="row m-5 justify-content-center">
            <div className="col-4.5  p-3 bg-dark text-white">
                <h1 className="m-3">Seat Reservation</h1>
            </div>
            </div>
        </div>

        <div className="container p-3 my-2 border border-primary bg-white text-white">
            <div className="row my-3 justify-content-center">
            <div className="col-5 align-self-center border border-primary p-3 bg-dark text-white">
                <div className="row justify-content-center"><h4>{currentReservation.first_name} {currentReservation.last_name}</h4></div>
                <div className="row justify-content-center"><h4>Party of {currentReservation.people}</h4></div>
            </div>
        </div>

        <div className="row my-3 justify-content-center">
            <div className="col-5 align-self-center border border-primary p-3 bg-dark text-white">
                <div className="row justify-content-center"><h4>Phone #: </h4></div>
                <div className="row justify-content-center"><h4>{currentReservation.mobile_number}</h4></div>
            </div>
        </div>
        
        
        </div>
        <div className="container p-3 my-2 bg-dark text-white">
            <div className="row mb-2 justify-content-center">
                <div className="col-2.5 p-3 bg-dark text-white">
                <h2>Select Table </h2>
                </div>
            </div>
        
            <div className="row justify-content-center">
            
                <div className="col-4.5 m-2 p-3 border border-primary bg-dark text-white">
                    <form>
                    <label className="">Table#</label>
                    <select name="table_id" onChange={handleChange} value={selectedTableID} className="form-select form-select-lg mb-2" >
                        {tableOptions}
                    </select>
                    </form>
                </div>
            </div>
            <div className="row justify-content-center">
                <div className="col-1 p-2 bg-dark text-white">    
                    <button type="submit" onClick={handleSubmit}  className="btn btn-outline-primary">Confirm</button>
                </div>
                <div className="col-1 p-2 bg-dark text-white">
                    <button type="cancel" onClick={()=> history.push(`/dashboard?date=${today()}`)}  className="btn btn-outline-danger mb-1">Cancel</button>
                </div>
            </div>
        </div>
        <ErrorAlert error={tablesError} />
        <ErrorAlert error={currentReservationError} />
    </>);
};