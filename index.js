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

        let str = "USERNAME : CREDIT VALUE @ " + (Date.now()) + ".\n";
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
    await TBA.MatchesWonLost();
}

function getXRandomFromArray(count,arr){
    let answer = [], counter = 0;

    while(counter < count){
        let rand = arr[Math.floor(Math.random() * arr.length)];
        if(!answer.some(an => an === rand)){
            answer.push(rand);
            counter++;
        }
    }

    return answer;
}

let matchCounter = 0;
async function sendScoutingMatches() {
    let currentEvent = await TBA.getCurrentEvent();
    if(currentEvent != null){
        //Match for Today
        let cMatch = await TBA.getCurrentMatchFromLast(currentEvent.key,matchCounter);
        console.log(cMatch);
        if(cMatch == null || cMatch == undefined) return
        
        let scouts = getXRandomFromArray(6,getHour() <= 12 ? ScoutGroupA : ScoutGroupB)
        let teams = await TBA.getTeamFromMatch(cMatch);
        
        console.log("Giving Links Over For #"+cMatch['match_number'])

        Client.GiveLink(scouts[0],teams.red[0],cMatch['match_number']);
        Client.GiveLink(scouts[1],teams.red[1],cMatch['match_number']);
        Client.GiveLink(scouts[2],teams.red[2],cMatch['match_number']);

        Client.GiveLink(scouts[3],teams.blue[0],cMatch['match_number']);
        Client.GiveLink(scouts[4],teams.blue[1],cMatch['match_number']);
        Client.GiveLink(scouts[5],teams.blue[2],cMatch['match_number']);
        matchCounter = parseInt(cMatch.match_number);
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
    else if(hrs != 6) didToday = false
}

async function main(){
    while(true){
        await SixAMDaily();
        await sendScoutingMatches();
        await onDriveTeam();
        //Runs Every 5s
        await sleep(5000);
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

    //BRUH
    changeSocialCredits("Abdilaahi Muse",250);
    changeSocialCredits("Elinor Schense",250);
    TBA_API.gainPointsDrive(300);

    main();
}


server.listen(port, hostname, () => {
    console.log(`Server running at http://${process.env.SERVER_IP}:${port}/`);
});
init();