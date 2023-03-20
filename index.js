const hostname = '0.0.0.0';
const port = process.env.PORT || 3000;

require("dotenv").config();
const http = require('http');
const SlackBot = require("./slackapi");
const TBA_API = require("./TBAAPI")
const {changeSocialCredits, Top, changeSocialCreditsID} = require('./sql');
const cliProgress = require('cli-progress');
const fs = require('fs')

const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('SLACK SERVER');
});

// Read a token from the environment variables
const Client = new SlackBot(process.env.SLACK_TOKEN);
const TBA = new TBA_API(process.env.TBA_KEY,process.env.TEAM_KEY);

async function TopAndLowerFive(){
    //await Client.SendMessage(process.env.ScoutingChannelID,`All Hail Our Glorous Leader, ${process.env.Leader}!`)
    Top().then((data) => { Client.SendTop(process.env.ScoutingChannelID,data);});
}

async function sendScoutingMatches() {
    let currentEvent = await TBA.getCurrentEvent();
    if(currentEvent != null){
        //Match for Today
        let cMatch = await TBA.getCurrentMatch(currentEvent.key);
        console.log(cMatch);
    }
}

async function SixAMDaily(){
    var hrs = new Date().getHours();
    if(hrs == 6){
        TopAndLowerFive();
    }
}

async function main(times){
    //SixAMDaily();
    //sendScoutingMatches();
    Client.DMPerson("Sadiq Ahmed","Hello From GCP!");
    setTimeout(main(times++),1500);
}


async function init() {
    let members = await Client.getMembersInChannel(process.env.GeneralChannelID);
    for(let i = 0; i < members.length; i++){
        //console.log(user);
        let name = members[i].name;
        if(members[i].id == null || members[i].id == 0 || members[i].id == undefined) return;
        changeSocialCreditsID(name,0,members[i].id);
    }

    main(0);
}


server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
init();