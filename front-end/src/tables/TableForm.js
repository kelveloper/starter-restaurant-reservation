import { useHistory } from "react-router";

export default function TableForm({newTable, errors, handleSubmit, handleForm}){
    
    const history = useHistory();
    const errorDisplay = `Resolve these issues: ${errors.messages.join(',\n ')} !`;

    return (<>
            {errors.messages.length ? <div className="alert alert-danger" role="alert">
                {errorDisplay}</div> : <div></div>}
        <div className="container p-3 my-2">    
        <form>
            <div className="mb-3">
                <label htmlFor="table_name" className="form-label">Table Name:</label>
                <input 
                    type="text" 
                    className="form-control" 
                    name="table_name" 
                    id="table_name" 
                    placeholder="Table Name" 
                    value={newTable.table_name} 
                    onChange={handleForm}
                />
            </div>
            <div className="mb-3">
                <label htmlFor="capacity" className="form-label">Capacity of Table:</label>
                <input 
                    type="number" 
                    min="1" 
                    pattern="\d+" 
                    className="form-control" 
                    name="capacity" 
                    id="capacity" 
                    placeholder='10' 
                    value={newTable.capacity} 
                    onChange={handleForm}
                />
            </div>
            <button onClick={() => history.goBack()} type="button" className="buttonSpace btn btn-secondary">Cancel</button>
            <button type="submit" onClick={handleSubmit} className="btn btn-primary m-2">Submit</button>
        </form>
        </div>
        </>)
};