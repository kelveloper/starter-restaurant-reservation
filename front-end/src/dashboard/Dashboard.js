import React, { useEffect, useState } from "react";
import { listReservations, listTables } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import { previous, today, next } from "../utils/date-time";
import DashboardReservationView from "./DashboardReservationView";
import DashboardTableView from "./DashboardTableView";
import { Link, useLocation, useHistory,} from "react-router-dom";
import queryString from "query-string";

/**
 * Defines the dashboard page.
 * @param date
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */
 function Dashboard({ date }) {
  const [reservations, setReservations] = useState([]);
  const [reservationsError, setReservationsError] = useState(null);
  const [dateOfReservations, setDateOfReservations] = useState(date);
  const { search } = useLocation();
  const history = useHistory();
  const searchDate = queryString.parse(search).date;
  const [tables, setTables] = useState([]);
  const [tablesError, setTablesError] = useState(null);

  
  useEffect(loadDashboard, [search, dateOfReservations, date, searchDate]);
  useEffect(loadTables,[]);
  useEffect(resetDate, [search, date]);
  
  const handleForm = (event) => {
    const { value } = event.target;
    history.push({
      pathname: "/dashboard",
      search:`?date=${value}`
    })
};

  function loadDashboard() {
    const abortController = new AbortController();
    setReservationsError(null);

    if (searchDate) {
      setDateOfReservations(searchDate.slice(0,10));
      listReservations({date: searchDate}, abortController.signal)
        .then(setReservations)
        .catch(setReservationsError)
      } 
    else {
      setDateOfReservations(date)
      listReservations({date}, abortController.signal)
        .then(setReservations)
        .catch(setReservationsError)
    };
    return () => abortController.abort();
  };

  function loadTables() {
    const abortController = new AbortController();
    setTablesError(null);
    listTables(abortController.signal)
      .then(setTables)
      .catch(setTablesError)
        
    return () => abortController.abort();
};

  function resetDate() {
    if(search) return
      const abortController = new AbortController();
      setDateOfReservations(date)
    return () => abortController.abort();
  };



  return (<>
      <div className="container p-3 my-2 bg-secondary text-white">
        <div className="row justify-content-center">
          <h1>Dashboard</h1>        
        </div>

        <div className="row justify-content-center">
          <div className="col-1.5">
          <button 
            id="today" type="today" className="btn btn-outline-primary btn m-2">
            <Link to={`/dashboard?date=${previous(dateOfReservations)}`}>Previous</Link>
          </button>
          </div>
          <div className="col-1.5">
          <button  
            id="today" type="today" className="btn btn-outline-primary btn m-2">
              <Link to={`/dashboard?date=${today()}`}>Today</Link>
          </button>
          </div>
          <div className="col-1.5">
          <button 
            id="next" type="next" className="btn btn-outline-primary btn m-2">
            <Link to={`/dashboard?date=${next(dateOfReservations)}`}>Next</Link>
          </button>
          </div>
        </div>

        <div className="row justify-content-center">
          <div className="col-2.5">
            <h4 className="m-3">{dateOfReservations}</h4>
          </div>
          </div>
        <div className="row justify-content-center">
          <div className="col-3">
            <input 
              type="date" 
              className="form-control" 
              name="reservation_date" 
              id="reservation_date" 
              placeholder="Date of Reservation" 
              onChange={handleForm}
            />
          </div>
        </div>
      </div>
    <div className="container p-3 my-2">    
     <DashboardReservationView reservations={reservations} loadDashboard={loadDashboard}/>
     <DashboardTableView tables={tables} loadDashboard={loadDashboard} loadTables={loadTables}/>
    </div>
    <ErrorAlert error={tablesError} />
    <ErrorAlert error={reservationsError} />
  </>);
};

export default Dashboard;