# **Firebears Slack Bot v3.4.23**

The Firebears Slack Bot was invented to force people to scout without telling them, and if they are unable to complete thir scouting duties, they lose points.

## **How It Works?**
-----
At the start, it gets all the names form the `.env` file's *General Channel ID*s members list.

## **How You Can Use It?**
-----
Firstly download all the code and open up or create a `.env` file in the root directory IE `/slackbot/.env` and copy all below and just insert your API keys.

``` .env
SLACK_TOKEN= Slack API Token
GeneralChannelID= The Channel ID For The Main Chat / General Chat
ScoutingChannelID= The Channel ID For The Secondary Chat / The Scouting Only Chat

TBA_KEY= The Key For The Blue Allience
TEAM_KEY= Your Team Number IE 2846

SITELINK= The Link For The Site IE https://google.com
SERVER_IP= The IP For The Server Hosting This BOT IE: 0.0.0.0

BAD_BEHAVIOR= Points Lost On Scouting
GOOD_BEHAVIOR= Points Gained On Scouting

WIN= Points Lost To Drive Team When Losing A Match
LOSS= Points Gained To Drive Team When Losing A Match 

DriveTeamMembers="DRIVE MEMBER A:DRIVE MEMBER B:DRIVE MEMBER C"
```
> For each Drive Team Member add a `:` for the program to split / indicate the persons name

# **Using GCP (Google Cloud Platform)**
## Init
Open The GoogleCloudTerminal or SSH into it.
Then Download and install NodeJS and NPM by running
`sudo apt install nodejs npm`

## Uploading Files
> You Need GoogleCloud Installed. You Can Download [Here](https://cloud.google.com/sdk/docs/install)

> When Uploading Code, Delete `./node_modules` as the files are too big and is better to run
> `npm install` on the server later

> **ALSO MAKE SURE THAT YOUR COMPUTE ENGINE IS RUNNING!**

When You Have Fully Working Code and Created A Valid Google Compute Engine, You can run
`gcloud compute scp --recurse ./ USERNAME@VM_INSTANCE:`
To Send All Files In The Current Folder `./*` To The Base Folder Of GCP
> Change USERNAME to your login name
> Change VM_INSTANCE to the name of the Virtual Machine 

## Firewall Settings
In order for the Server to be enabled and to send data over to the server *(GCP Compute)*. We need to enable specific Firewall Settings.
1. Open The Firewall Settings In GCP Console
   1. Open GCP [Here](https://console.cloud.google.com/networking/firewalls)
   2. Open VPC Network In GCP
   3. Go To The Firewall Settings
2. In The Firewalls Add New Rule
3. Enter A Name And Desc
4. For Target Enter 'Specified target tags'
5. Enable TCP & UDP and type port `3000`

## Running The Server
## 1. Running Manually
Once in the server console just run `npm run dev` and it will start the server
Once you see a progress bar you know it will work
> Problem is when restarting / when the server crashes the file wont re-start
## 2. Running Automatically [PM2]
using PM2 will mitigate the problem where if the server crashes
PM2 will restart it for us.
On the server run `npm install pm2`
Then run `npx pm2 index.js`