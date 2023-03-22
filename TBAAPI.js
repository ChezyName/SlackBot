const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { BetweenDates } = require('./util')
const {changeSocialCredits} = require('./sql')

const DriveTeamMembers = process.env.DriveTeamMembers.split(':');


function gainPointsDrive(Points){
    for(var i = 0; i < DriveTeamMembers.length; i++){
        console.log(DriveTeamMembers[i] + " : " + Points)
        changeSocialCredits(DriveTeamMembers[i],Points);
    }
}

class TBA_API{
    constructor(TBAKEY,TeamKey){
        this.key = TBAKEY;
        this.team = 'frc'+TeamKey;
    }

    async getData(path=""){
        const response = await await fetch('https://www.thebluealliance.com/api/v3'+path, {
            method: 'get',
            headers: {'X-TBA-Auth-Key': this.key}
        });
        return await response.json();
    }

    async getCurrentEvent(){
        let year = new Date().getFullYear();
        //console.log("Current Year is " + year);
        let events = await this.getData("/team/"+'frc'+this.team+"/events/"+year+"/simple");
        //console.log("EVENTS: ")
        //console.log(events);
        for(let i = 0; i < events.length; i++){
            let event = events[i]
            let startingDate = new Date(event.start_date)
            let endingDate = new Date(event.end_date)
            if(BetweenDates(startingDate,endingDate)){
                return event;
            }
        }
        console.log("No Events Found For Date");
        return null;
    }

    async getYearEvents(){
        let year = new Date().getFullYear();
        let nextYear = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).getFullYear();
        //console.log("Current Year is " + year);
        let events = await this.getData("/team/"+this.team+"/events/"+year+"/simple");
        let nextEvents = await this.getData("/team/"+this.team+"/events/"+nextYear+"/simple");
        //console.log("\n our current events for "+year+" are:")
        console.log(nextEvents);
        //console.log("\n");
        return events.concat(nextEvents);
    }

    async getMatches(eventKey){
        let allMatches = await this.getData("/event/"+eventKey+"/matches/simple");
        return allMatches;
    }

    async getOurMatches(eventKey){
        let matches = await this.getData("/team/"+this.team+"/event/"+eventKey+"/matches/simple");
        return matches;
    }

    async getTeamInfo(teamKey){
        let teamData = await this.getData("/team/" + teamKey + "/simple");
        return teamData;
    }

    async getTeamDataFromMatch(matchData){
        let blue = matchData["alliances"]["blue"]["team_keys"];
        let red = matchData["alliances"]["red"]["team_keys"];

        let nBlue = [];
        let nRed = [];

        for(var i = 0; i < blue.length; i++){
            let b = await this.getTeamInfo(blue[i]);
            let r = await this.getTeamInfo(red[i]);

            nBlue.push(b);
            nRed.push(r);
        }

        return {blue: nBlue, red: nRed};
    }

    async getTeamFromMatch(matchData){
        let nBlue = matchData["alliances"]["blue"]["team_keys"];
        let nRed = matchData["alliances"]["red"]["team_keys"];

        return {blue: nBlue, red: nRed};
    }

    async MatchesWonLost(){
        let eventKey = await this.getCurrentEvent();
        let matches = await this.getOurMatches('2022mndu2');
        let totalPoints = 0;
        for(var i = 0; i < matches.length; i++){
            let match = matches[i];
            if(!(match['winning_alliance'] == 'red' || match['winning_alliance'] == 'blue')) return;
            let teams = await this.getTeamFromMatch(match);
            if(match['winning_alliance'] == 'red'){
                if(teams.blue[0] == this.team || teams.blue[1] == this.team || teams.blue[2] == this.team) totalPoints += parseInt(process.env.LOSS);
                else if(teams.red[0] == this.team || teams.red[1] == this.team || teams.red[2] == this.team) totalPoints += parseInt(process.env.WIN);
            }
            else if(match['winning_alliance'] == 'blue'){
                if(teams.blue[0] == this.team || teams.blue[1] == this.team || teams.blue[2] == this.team) totalPoints += parseInt(process.env.WIN);
                else if(teams.red[0] == this.team || teams.red[1] == this.team || teams.red[2] == this.team) totalPoints += parseInt(process.env.LOSS);
            }
        }
        gainPointsDrive(totalPoints);
    }

    async getCurrentMatch(eventKey){
        let matches = await this.getMatches(eventKey);
        let lastMatch = matches[0];
        let timeMS = Date.now();

        for(let i = 0; i < matches.length; i++){
            let matchTime = matches[i].predicted_time;
            if((matchTime-15000) < timeMS && timeMS < (matchTime+15000)){
                return lastMatch;
            }
        }
    }
}

module.exports = TBA_API