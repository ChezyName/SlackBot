const { WebClient } = require('@slack/web-api');


class SlackBot {
    constructor(AppID) {
        // Initialize
        this.web = new WebClient(AppID);
    }

    async SendMessage(ChannelID,Text){
        const result = await this.web.chat.postMessage({
            text: Text,
            channel: ChannelID,
        });
        return result;
    }

    async sendScoutingMessage(){

    }

    async getMembersInChannel(ChannelID){
        let totalMembers = [];
        let data = await this.web.conversations.members({channel: ChannelID});
        let members = data.members;
        for(let i = 0; i < members.length; i++){
            let info = await this.web.users.info({user: members[i]});
            //console.log(i +".) " + info.user.profile.real_name);
            if(!info.user.is_bot) totalMembers.push(info.user.real_name);
        }
        return totalMembers;
    }

    async getAllUsers(){
        return this.web.users.list();
    }

    async SendTop(ChannelID,Top){
        //Top 5 Users
        let msg = "Daily Most Compliant\n";

        if(Top[0].credit == 0){
            msg += "DATA N/A\n"
        }
        else{
            for(let i = 0; i < 5; i++){
                msg += (i+1) + ".) " + Top[i].name + " : " + Top[i].credit + "\n";
            }
        }

        //console.log(msg);

        //await this.SendMessage(ChannelID,msg);

        //Lower 5 Users
        msg += "\n\nDaily Least Compliant\n";

        if(Top[Top.length - 1].credit == 0){
            msg += "DATA N/A\n"
        }
        else{
            for(let i = Top.length - 1; i > Top.length - 6; i++){
                msg += (i+1) + ".) " + Top[i].name + " : " + Top[i].credit + "\n";
            }
        }

        await this.SendMessage(ChannelID,msg);
    }
}


module.exports = SlackBot