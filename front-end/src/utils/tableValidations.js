export function validateTable(table, errors){
    errors.messages = [];
    const {
        table_name,
        capacity,
    } = table;  

    if(!table_name) errors.messages.push("Missing table name");
    if(!capacity) errors.messages.push("Missing capacity size");

    if (table_name && table_name.length < 2) errors.messages.push("table_name must be at least two characters")
    if(capacity && capacity < 1) errors.messages.push("capacity size must have at least 1")
};