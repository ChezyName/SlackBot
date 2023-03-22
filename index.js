const hostname = '0.0.0.0';
const port = process.env.PORT || 3000;

require("dotenv").config();
const http = require('http');
const SlackBot = require("./slackapi");
const TBA_API = require("./TBAAPI")
const {changeScoutMissed, Top, changeSocialCreditsID, changeSocialCredits} = require('./sql');
const cliProgress = require('cli-progress');
const fs = require('fs')
const {getHour,sleep} = require('./util');

console.log("Server Started @ " + new Date().toUTCString());


const server = http.createServer((req, res) => {
    if(req.method == "POST"){
        var body = "";
        req.on("data", function (chunk) {
            body += chunk;
        });

        req.on("end", function(){
            //console.log(body);
            changeScoutMissed(body.name,1);
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(body);
        });
    }
    else{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');

        let str = "USERNAME : CREDIT VALUE @ " + (new Date().toLocaleTimeString("en-GB", { timeZone: "America/Chicago" })) + " CT.\n";
        Top().then((members) => {
            for(var i = 0; i < members.length; i++){
                var user = members[i];
                str += user.name + " : " + user.credit + "\n";
            }
            res.end(str);
        })
    }
});

// Read a token from the environment variables
const Client = new SlackBot(process.env.SLACK_TOKEN);
const TBA = new TBA_API(process.env.TBA_KEY,process.env.TEAM_KEY);

async function TopAndLowerFive(){
    //await Client.SendMessage(process.env.ScoutingChannelID,`All Hail Our Glorous Leader, ${process.env.Leader}!`)
    Top().then((data) => { Client.SendTop(process.env.ScoutingChannelID,data);});
}

async function onDriveTeam(){
    TBA.MatchesWonLost();
}

async function sendScoutingMatches() {
    let currentEvent = await TBA.getCurrentEvent();
    if(currentEvent != null){
        //Match for Today
        let cMatch = await TBA.getCurrentMatch(currentEvent.key);
        console.log(cMatch);
    }
}

didToday = false;
async function SixAMDaily(){
    var hrs = getHour();
    //console.log("Current Time: " + hrs);
    if(hrs == 11 && didToday == false){
        TopAndLowerFive();
        didToday = true;
    }
    else if(hrs != 11) didToday = false
}

async function main(){
    await onDriveTeam();
    while(true){
        await SixAMDaily();
        //await sendScoutingMatches();
        //Runs Every 15s
        await sleep(15000);
    }
}


async function init() {
    let members = await Client.getMembersInChannel(process.env.GeneralChannelID);
    for(let i = 0; i < members.length; i++){
        //console.log(user);
        let name = members[i].name;
        if(members[i].id == null || members[i].id == 0 || members[i].id == undefined) return;
        changeSocialCreditsID(name,0,members[i].id);
    }

    main();
}


server.listen(port, hostname, () => {
    console.log(`Server running at http://${process.env.SERVER_IP}:${port}/`);
});
init();