require("dotenv").config();
const SlackBot = require("./slackapi");
const {changeSocialCredits, Top} = require('./sql')

// Read a token from the environment variables
const token = process.env.SLACK_TOKEN;
const Client = new SlackBot(token);
//Client.SendMessage("C04SCDQEKS7",`All Hail Our Glorous Leader, ${process.env.Leader} !`)

//Top().then((data) => { Client.SendTop("C04SCDQEKS7",data);});

function init() {
    Client.getAllUsers().then((result) => {
        for(let i = 0; i < result.members.length; i++){
            let user = result.members[i];
            //console.log(user);
            let name = user.profile.real_name;
            if(user.deleted == false && user.is_bot == false){
                changeSocialCredits(name,0);
            }
        }
    });
}


function main(){
    
}