require("dotenv").config();
const SlackBot = require("./slackapi");
const TBA_API = require("./TBAAPI")
const {changeSocialCredits, Top, changeSocialCreditsID} = require('./sql');
const cliProgress = require('cli-progress');
const fs = require('fs')

// Read a token from the environment variables
const Client = new SlackBot(process.env.SLACK_TOKEN);
const TBA = new TBA_API(process.env.TBA_KEY,process.env.TEAM_KEY);

async function TopAndLowerFive(){
    //await Client.SendMessage(process.env.ScoutingChannelID,`All Hail Our Glorous Leader, ${process.env.Leader}!`)
    Top().then((data) => { Client.SendTop(process.env.ScoutingChannelID,data);});
}

async function main(){
    /*
    let currentEvent = await TBA.getCurrentEvent();
    if(currentEvent != null){
        //Match for Today
        let cMatch = await TBA.getCurrentMatch(currentEvent.key.replace('2023','2022'));
        console.log(cMatch);
    }
    */

    let json = JSON.parse(fs.readFileSync('./scouters.json'));
    for(let i = 0; i < json.length; i++){
        let person = json[i]
        Client.DMPerson(person,"Oi Mate, You Best Be On Your Best Behavior! Mate!")
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

    //TopAndLowerFive();
    main();
}


init();