import React, { useState } from "react";
import ErrorAlert from "../layout/ErrorAlert";
import { useHistory} from "react-router-dom";
import { createTable } from "../utils/api";
import { validateTable } from "../utils/tableValidations";
import TableForm from "./TableForm";



export default function CreateTable(){
    const [newTable, setNewTable] = useState({
        table_name: "",
        capacity: 0,
    });
    const [tableError, setTableError] = useState(null);
    const [errors, setErrors] = useState({"messages":[]});
    const history = useHistory();

    const handleForm = ({ target }) => {
        setErrors({"messages": [] });
        let value = target.value
        if(target.type === "number") {
            value = Number(value)
        }
        setNewTable({ ...newTable, [target.name]: value });
    };

    const handleSubmit = async (e) => {
        const abortController = new AbortController();
        e.preventDefault();
        const validated = validateTable(newTable, errors);
        console.log(validated,errors)
        if(validated){
            setErrors({...errors})
            return errors.messages;
        };
        // filling and submitting form creates a new reservation
        console.log(newTable)
        await createTable( newTable, abortController.signal)
        .then(() => {history.replace(`/dashboard`)})
        .catch(setTableError)

    return () => abortController.abort();
  };
    
    return (<>
        <div className="container p-3 my-2 bg-dark text-white">
            <div className="row m-5 justify-content-center">
            <div className="col-4.5  p-3 bg-dark text-white">
                <h1 className="m-3">Create a Table</h1>
            </div>
           </div>
        </div>
        <ErrorAlert error ={tableError} />
        <TableForm
          handleSubmit={handleSubmit}
          handleForm={handleForm}
          newTable={newTable}
          history={history}
          errors={errors}
        />
    </>
    )
}