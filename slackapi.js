const { WebClient } = require('@slack/web-api');
const cliProgress = require('cli-progress');
const { getIDfromName } = require('./sql')

class SlackBot {
    constructor(AppID) {
        // Initialize
        this.web = new WebClient(AppID);
    }

    async SendMessage(ChannelID,Text){
        //console.log("Sending MSG To " + ChannelID + " : " + Text);
        const result = await this.web.chat.postMessage({
            text: Text,
            channel: ChannelID,
        });
        return result;
    }

    async DMPerson(Name,MSG){
        let ID = await getIDfromName(Name);
        this.SendMessage(ID,MSG);
    }

    async getMembersInChannel(ChannelID){
        let totalMembers = [];
        let data = await this.web.conversations.members({channel: ChannelID});
        let members = data.members;
        const LoadingBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
        LoadingBar.start(members.length, 0);
        for(let i = 0; i < members.length; i++){
            let info = await this.web.users.info({user: members[i]});
            let id = info.user.id;
            LoadingBar.update(i);
            //console.log(id);
            //console.log(i +".) " + info.user.profile.real_name);
            if(!info.user.is_bot) totalMembers.push({name: info.user.real_name, id: id});
        }
        LoadingBar.update(members.length);
        LoadingBar.stop();
        return totalMembers;
    }

    async getAllUsers(){
        return this.web.users.list();
    }

    async SendTop(ChannelID,Top){
        //Top 5 Users
        let msg = "Daily Most Compliant\n";

        for(let i = 0; i < 5; i++){
            msg += (i+1) + ".) " + Top[i].name + " : " + Top[i].credit + "\n";
        }

        //console.log(msg);

        //await this.SendMessage(ChannelID,msg);

        //Lower 5 Users
        msg += "\n\nDaily Least Compliant\n";

        for(let i = Top.length - 1; i > Top.length - 6; i--){
            msg += (i+1) + ".) " + Top[i].name + " : " + Top[i].credit + "\n";
        }

        console.log("Printed MSG")
        

        await this.SendMessage(ChannelID,msg);
    }
}


module.exports = SlackBot