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

    async InteractiveMessage(ChannelID,Text){
        
    }
}

module.exports = SlackBot;