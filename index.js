require("dotenv").config();
const SlackBot = require("./slackapi");
const {changeSocialCredits, Top} = require('./sql')

// Read a token from the environment variables
const token = process.env.SLACK_TOKEN;
const Client = new SlackBot(token);
//Client.SendMessage("C04SCDQEKS7",`All Hail Our Glorous Leader, ${process.env.Leader} !`)

//Top().then((data) => { Client.SendTop("C04SCDQEKS7",data);});

async function init() {
    let members = await Client.getMembersInChannel(process.env.GeneralChannelID);
    for(let i = 0; i < members.length; i++){
        //console.log(user);
        let name = members[i];
        changeSocialCredits(name,0);
    }
}


async function main(){
    
}


init();
main();