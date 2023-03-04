require("dotenv").config();
const SlackBot = require("./slackapi");
const {changeSocialCredits} = require('./sql')

// Read a token from the environment variables
const token = process.env.SLACK_TOKEN;
const Client = new SlackBot(token);
Client.SendMessage("C04SCDQEKS7",`All Hail Our Glorous Leader, ${process.env.Leader} !`)

changeSocialCredits("SadiqAhmed",999);