const sqlite3 = require('sqlite3').verbose();
const tableName = "socialcredits";

const db = new sqlite3.Database('./socialcredits.db',sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE | sqlite3.OPEN_FULLMUTEX,(err) => {
    if(err) return console.error(err.message);
    console.log("Connected to SQL Database");
})

function changeSocialCredits(Name,Value){
    db.run(`CREATE TABLE IF NOT EXISTS ${tableName} (credit INT, name CHAR);`);
    db.run(`INSERT OR IGNORE INTO ${tableName} (credit, name) VALUES (${Value},'${Name}'); `);
    db.run(`UPDATE ${tableName} SET user_name='${Name}', age=${Value} WHERE user_name='${Name}';`);
}

module.exports.changeSocialCredits = changeSocialCredits