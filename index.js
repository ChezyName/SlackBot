const hostname = '0.0.0.0';
const port = process.env.PORT || 3000;

require("dotenv").config();
const http = require('http');
const SlackBot = require("./slackapi");
const TBA_API = require("./TBAAPI")
const {changeScoutMissed, Top, changeSocialCreditsID, changeSocialCredits} = require('./sql');
const cliProgress = require('cli-progress');
const fs = require('fs')
const path = require('path')
const {getHour,sleep} = require('./util');

console.log("Server Started @ " + new Date().toUTCString());

let ScoutGroupA = []
let ScoutGroupB = []
if(fs.existsSync('./scouters.json')){
    let data = JSON.parse(fs.readFileSync('./scouters.json'));
    ScoutGroupA = data['A'];
    ScoutGroupB = data['B'];
}

async function getMatch(){
    if(fs.existsSync('./match.data')){
        let data = fs.readFileSync('./match.data');
        console.log(data);
        return parseInt(data);
    }
    else{
        fs.writeFileSync('./match.data','0');
        return 0;
    }
}

async function UpdateMatch(number){
    fs.writeFileSync('./match.data',toString(number));
}

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
    Top().then((data) => { Client.SendTop(process.env.GeneralChannelID,data);});
}

async function onDriveTeam(){
    let m = await getMatch();
    console.log("LFF:",m);
    let nm = await TBA.MatchesWonLost(m);
    console.log("NMAHC:",nm);
    UpdateMatch(nm);
}

async function sendScoutingMatches() {
    let currentEvent = await TBA.getCurrentEvent();
    if(currentEvent != null){
        //Match for Today
        let cMatch = await TBA.getCurrentMatch(currentEvent.key);
        if(getHour() <= 12){
            //Morning Shift
        }
        else{
            //Afternoon Shift
        }
    }
}

didToday = false;
async function SixAMDaily(){
    var hrs = getHour();
    //console.log("Current Time: " + hrs);
    if(hrs == 6 && didToday == false){
        TopAndLowerFive();
        didToday = true;
    }
    else if(hrs != 6 ) didToday = false
}

const prompt = require('prompt-sync')({sigint: true})
async function practiceModeCommands(){
    //BASIC COMMANDS
    //SCOUT R1 R2 R3 B1 B2 B3:MATCHNUM
    //A 2846 2107 1924 2389 8237 7239:25
    let cmd = prompt('>');
    console.log("running {"+cmd+"}.");
    let scoutnum = cmd.charAt(0);
    cmd = cmd.substring(2,cmd.length);
    let splited = cmd.split(":");
    //console.log(splited)
    let teams = splited[0].split(" ");
    //console.log(teams)
    let matchNum = splited[1];
    //console.log(matchNum)
    
    let AorB = (scoutnum == "A" || scoutnum == "a");
    for(var i = 0; i < teams.length; i++){
        let team = teams[i];
        let scouter = (AorB ? ScoutGroupA[i] : ScoutGroupB[i]);
        //console.log("Choose "+scouter+" For Team #" + team);
        Client.GiveLink(scouter,team,matchNum);
    }
}

async function main(){
    //practiceModeCommands();

    /*
    while(true){
        await SixAMDaily();
        await sendScoutingMatches();
    }
    */
}


async function init() {
    let members = await Client.getMembersInChannel(process.env.GeneralChannelID);
    for(let i = 0; i < members.length; i++){
        //console.log(user);
        let name = members[i].name;
        if(members[i].id == null || members[i].id == 0 || members[i].id == undefined) return;
        changeSocialCreditsID(name,0,members[i].id);
    }

    //await changeSocialCredits("Sadiq Ahmed",999);
    //await changeSocialCredits("Abdilaahi Muse",1250);
    //await changeSocialCredits("Elinor Schense",1250);
    //TBA_API.gainPointsDrive(-250)

    main();
}


server.listen(port, hostname, () => {
    console.log(`Server running at http://${process.env.SERVER_IP}:${port}/`);
});
init();