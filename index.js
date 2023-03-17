require("dotenv").config();
const SlackBot = require("./slackapi");
const TBA_API = require("./TBAAPI")
const {changeSocialCredits, Top, changeSocialCreditsID} = require('./sql');
const cliProgress = require('cli-progress');

// Read a token from the environment variables
const Client = new SlackBot(process.env.SLACK_TOKEN);
const TBA = new TBA_API(process.env.TBA_KEY,process.env.TEAM_KEY);

async function TopAndLowerFive(){
    //await Client.SendMessage(process.env.ScoutingChannelID,`All Hail Our Glorous Leader, ${process.env.Leader}!`)
    Top().then((data) => { Client.SendTop(process.env.ScoutingChannelID,data);});
}

async function main(){
    let currentMatch = await TBA.getCurrentEvent(); 
}


async function init() {
    let members = await Client.getMembersInChannel(process.env.GeneralChannelID);
    const LoadingBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    LoadingBar.start(members.length, 0);
    for(let i = 0; i < members.length; i++){
        //console.log(user);
        let name = members[i].name;
        if(members[i].id == null || members[i].id == 0 || members[i].id == undefined) return;
        changeSocialCreditsID(name,0,members[i].id);
        LoadingBar.update(i);
    }
    
    LoadingBar.update(members.length);
    LoadingBar.stop();

    //TopAndLowerFive();
    main();
}


init();