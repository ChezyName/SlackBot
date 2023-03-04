require("dotenv").config();
const SlackBot = require("./slackapi");
const TBA = require('./TBAAPI')
const {changeSocialCredits, Top} = require('./sql')

// Read a token from the environment variables
const token = process.env.SLACK_TOKEN;
const Client = new SlackBot(token);

async function init() {
    let members = await Client.getMembersInChannel(process.env.GeneralChannelID);
    for(let i = 0; i < members.length; i++){
        //console.log(user);
        let name = members[i];
        changeSocialCredits(name,0);
    }

    main();
}

function TopAndLowerFive(){
    Client.SendMessage("C04SCDQEKS7",`All Hail Our Glorous Leader, ${process.env.Leader}!`)
    Top().then((data) => { Client.SendTop(process.env.GeneralChannelID,data);});
}

async function main(){
    
}


init();