const sqlite3 = require('sqlite3').verbose();
const tableName = "socialcredits";

const db = new sqlite3.Database('./socialcredits.db',sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE | sqlite3.OPEN_FULLMUTEX,(err) => {
    if(err) return console.error(err.message);
    console.log("Connected to SQL Database");
    db.run(`CREATE TABLE IF NOT EXISTS ${tableName} (credit INT, name CHAR);`);
})

function changeSocialCredits(Name,Value){
    db.run(`CREATE TABLE IF NOT EXISTS ${tableName} (credit INT, name CHAR);`);
    db.run(`INSERT INTO ${tableName}(credit,name)` 
    + `SELECT ${Value}, '${Name}'`
    + `WHERE NOT EXISTS(SELECT 1 FROM ${tableName} WHERE name = '${Name}');`);
    
    db.each(`SELECT credit, name FROM ${tableName} WHERE name = '${Name}'`,
        function(err, row) {
            if(row != null && row.name != null && row.credit != null){
                //console.log(row.name + " : " + row.credit);
                db.run(`UPDATE ${tableName} SET name='${Name}', credit=${row.credit + Value} WHERE name='${Name}';`);
            }
        });
}

async function getTop(){
    return new Promise((resolve) => {
        let topContenders = [];
        db.each(`SELECT * from ${tableName} order by credit desc`,
            function(err,row) {
                if(row != null){
                    topContenders.push(row);
                    //console.log(row);
                }
            },
            function() {
                resolve(topContenders);
            });
    })
}
module.exports.changeSocialCredits = changeSocialCredits
module.exports.Top = getTop