const sqlite3 = require('sqlite3').verbose();
const tableName = "socialcredits";

const db = new sqlite3.Database('./socialcredits.db',sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE | sqlite3.OPEN_FULLMUTEX,(err) => {
    if(err) return console.error(err.message);
    console.log("Connected to SQL Database");
})

function changeSocialCredits(Name,Value){
    db.run(`CREATE TABLE IF NOT EXISTS ${tableName} (credit INT, name CHAR);`);
    //db.run(`UPDATE ${tableName} SET credit = ${Value} WHERE name = ${Name};`);
}

module.exports.changeSocialCredits = changeSocialCredits