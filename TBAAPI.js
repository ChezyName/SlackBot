const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { BetweenDates } = require('./util')
const {changeSocialCredits} = require('./sql')

const DriveTeamMembers = process.env.DriveTeamMembers.split(':');


function gainPointsDrive(Points){
    for(var i = 0; i < DriveTeamMembers.length; i++){
        //console.log(DriveTeamMembers[i] + " : " + Points)
        changeSocialCredits(DriveTeamMembers[i],Points);
    }
}

class TBA_API{
    constructor(TBAKEY,TeamKey){
        this.key = TBAKEY;
        this.team = 'frc'+TeamKey;
    }

    async getData(path=""){
        const response = await fetch('https://www.thebluealliance.com/api/v3'+path, {
            method: 'get',
            headers: {'X-TBA-Auth-Key': this.key}
        });
        return response.json();
    }

    async getCurrentEvent(){
        let year = new Date().getFullYear();
        //console.log("Current Year is " + year);
        let events = await this.getData("/team/"+this.team+"/events/"+year+"/simple");
        //console.log("EVENTS: ")
        //console.log(events);
        for(let i = 0; i < events.length; i++){
            let event = events[i]
            let startingDate = new Date(event.start_date).getDay();
            let endingDate = new Date(event.end_date).getDay();
            let currentDate = new Date().getDay();
            if(new Date(event.start_date).getMonth() != new Date().getMonth()) return;
            //console.log(startingDate + " : " + currentDate + " : " + endingDate);
            if(startingDate <= currentDate && currentDate <= endingDate){
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
        //console.log(nextEvents);
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
        if(this.matchesWL == undefined) this.matchesWL = 0;
        let eventKey = await this.getCurrentEvent();
        if(eventKey == null || eventKey == undefined) return;

        let matches = await this.getOurMatches(eventKey.key);
        
        if(matches == null || matches == undefined) return;
        //console.log(matches);

        matches.sort(
            (m1, m2) => (m1['match_number'] < m2['match_number']) ? -1 : 0
        );

        let totalPoints = 0;
        let finalMatch = 0;
        for(var i = 0; i < matches.length; i++){
            let match = matches[i];
            //console.log(match['match_number'])
            if(match['comp_level'] == 'qf') return;
            if(!(match['winning_alliance'] == 'red' || match['winning_alliance'] == 'blue')) return;
            let matchTime = matches[i].predicted_time;
            let timeMS = Date.now();
            if (!((matchTime-80000) < timeMS && timeMS < (matchTime+35000))) return;
            let teams = await this.getTeamFromMatch(match);
            if(match['winning_alliance'] == 'red'){
                if(teams.blue[0] == this.team || teams.blue[1] == this.team || teams.blue[2] == this.team) totalPoints += parseInt(process.env.LOSS);
                else if(teams.red[0] == this.team || teams.red[1] == this.team || teams.red[2] == this.team) totalPoints += parseInt(process.env.WIN);
            }
            else if(match['winning_alliance'] == 'blue'){
                if(teams.blue[0] == this.team || teams.blue[1] == this.team || teams.blue[2] == this.team) totalPoints += parseInt(process.env.WIN);
                else if(teams.red[0] == this.team || teams.red[1] == this.team || teams.red[2] == this.team) totalPoints += parseInt(process.env.LOSS);
            }
            this.matchesWL = match.match_number;
        }
        gainPointsDrive(totalPoints);
    }

    async getCurrentMatchFromLast(eventKey,lastUsableMatch){
        let matches = await this.getMatches(eventKey);
        let timeMS = new Date().getTime() / 1000;

        matches.sort(
            (m1, m2) => (m1['match_number'] < m2['match_number']) ? -1 : 0
        );

        for(let i = 0; i < matches.length; i++){
            let match = matches[i];
            let matchTime = parseInt(match.predicted_time);

            let RT = matchTime - timeMS
            if(RT > -150 && RT < 800) console.log(parseInt(RT) + ": " + match.match_number);
            //console.log(((matchTime-60000) < timeMS && timeMS < (matchTime+60000) ? "Y " : "X ") + (timeMS - matchTime) + " - " + match.match_number + "/" + lastUsableMatch)
            if(RT > 0 && RT < 150 && match.match_number > lastUsableMatch){
                return match;
            }
        }

        return null;
    }
}

module.exports = TBA_API
module.exports.gainPointsDrive = gainPointsDrive;