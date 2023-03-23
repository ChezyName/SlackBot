const sqlite3 = require('sqlite3').verbose();
const tableName = "socialcredits";

let db = new sqlite3.Database('./socialcredits.db',sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE | sqlite3.OPEN_FULLMUTEX,(err) => {
    if(err) return console.error(err.message);
    console.log("Connected to SQL Database");
    db.run(`CREATE TABLE IF NOT EXISTS ${tableName} (credit INT, name CHAR, id CHAR, scoutmissed INT);`);
})

function Connect(){
    db = new sqlite3.Database('./socialcredits.db',sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE | sqlite3.OPEN_FULLMUTEX,(err) => {
        if(err) return console.error(err.message);
        console.log("Re-Connected to SQL Database");
        db.run(`CREATE TABLE IF NOT EXISTS ${tableName} (credit INT, name CHAR, id CHAR, scoutmissed INT);`);
    })
}

async function getIDfromName(Name){
    return new Promise((resolve) => {
        db.each(`SELECT credit, name, id FROM ${tableName} WHERE name = '${Name}'`,
        function(err, row) {
            if(row != null && row.name != null && row.credit != null && row.id != null){
                //console.log(row.name,row.id);
                resolve(row.id);
            }
        });
    })
}

function changeSocialCreditsID(Name,Value,id){
    db.run(`CREATE TABLE IF NOT EXISTS ${tableName} (credit INT, name CHAR, id CHAR, scoutmissed INT);`);
    db.run(`INSERT INTO ${tableName}(credit,name,id,scoutmissed)` 
    + `SELECT ${Value}, '${Name}', '${id}', 0 `
    + `WHERE NOT EXISTS(SELECT 1 FROM ${tableName} WHERE name = '${Name}');`);
    
    db.each(`SELECT credit, name, id FROM ${tableName} WHERE name = '${Name}'`,
        function(err, row) {
            if(row != null && row.name != null && row.credit != null && row.id != null){
                //console.log(row.name + " : " + row.credit);
                db.run(`UPDATE ${tableName} SET credit=${row.credit + Value} WHERE name='${Name}';`);
            }
        });
}

function changeScoutMissed(Name,AddValue){    
    db.each(`SELECT credit, name, id, scoutmissed FROM ${tableName} WHERE name = '${Name}'`,
        function(err, row) {
            if(row != null && row.name != null && row.credit != null && row.id != null){
                //console.log(row.name + " : " + row.credit);
                db.run(`UPDATE ${tableName} SET scoutmissed=${row.scoutmissed + AddValue} WHERE name='${Name}';`);
            }
        });
}

function changeSocialCredits(Name,Value){
    db.run(`CREATE TABLE IF NOT EXISTS ${tableName} (credit INT, name CHAR, id CHAR, scoutmissed INT);`);
    db.run(`INSERT INTO ${tableName}(credit,name)` 
    + `SELECT ${Value}, '${Name}'`
    + `WHERE NOT EXISTS(SELECT 1 FROM ${tableName} WHERE name = '${Name}');`);
    
    db.each(`SELECT credit, name FROM ${tableName} WHERE name = '${Name}'`,
        function(err, row) {
            if(row != null && row.name != null && row.credit != null){
                //console.log(row.name + " : " + row.credit);
                db.run(`UPDATE ${tableName} SET credit=${row.credit + Value} WHERE name='${Name}';`);
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

async function getMostMissed(){
    return new Promise((resolve) => {
        db.each(`SELECT * from ${tableName} order by scoutmissed asc`,
        function(err,row) {
            if(row != null){
                resolve(row);
            }
        },)
    })
}

module.exports.getIDfromName = getIDfromName;
module.exports.changeSocialCredits = changeSocialCredits
module.exports.changeSocialCreditsID = changeSocialCreditsID
module.exports.Top = getTop
module.exports.changeScoutMissed = changeScoutMissed;
module.exports.getMostMissed = getMostMissed;
module.exports.Connect = Connect;