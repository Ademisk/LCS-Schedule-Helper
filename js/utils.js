var weekday = new Array(7);
weekday[0]=  "Sunday";
weekday[1] = "Monday";
weekday[2] = "Tuesday";
weekday[3] = "Wednesday";
weekday[4] = "Thursday";
weekday[5] = "Friday";
weekday[6] = "Saturday";

var month = new Array(12);
month[0]=  "January";
month[1] = "February";
month[2] = "March";
month[3] = "April";
month[4] = "May";
month[5] = "June";
month[6] = "July";
month[7] = "August";
month[8] = "September";
month[9] = "October";
month[10] = "November";
month[11] = "December";

var teamIcon = {
	//NA
	APX: "/teamIcons/NA/apx.png",
	C9: "/teamIcons/NA/c9.png",
	CLG: "/teamIcons/NA/clg.png",
	NV: "/teamIcons/NA/nv.png",
	FOX: "/teamIcons/NA/fox.png",
	IMT: "/teamIcons/NA/imt.png",
	NRG: "/teamIcons/NA/nrg.png",
	P1: "/teamIcons/NA/p1.png",
	TL: "/teamIcons/NA/tl.png",
	TSM: "/teamIcons/NA/tsm.png",

	//EU
	FNC: "/teamIcons/EU/fnc.png",
	G2: "/teamIcons/EU/g2.png",
	GIA: "/teamIcons/EU/gia.png",
	H2K: "/teamIcons/EU/h2k.png",
	OG: "/teamIcons/EU/og.png",
	ROC: "/teamIcons/EU/roc.png",
	S04: "/teamIcons/EU/s04.png",
	SPY: "/teamIcons/EU/spy.png",
	UOL: "/teamIcons/EU/uol.png",
	VIT: "/teamIcons/EU/vit.png"
};

var champIcon = {
	
}

var KILL_PTS = 2;
var DEATH_PTS = -.5;
var ASSIST_PTS = 1.5;
var MINION_PTS = .01;
var TRIPLE_KILL_PTS = 2;
var QUADRA_KILL_PTS = 5;
var PENTA_KILL_PTS = 10;
var KILL_ASSIST_PTS = 2;

var WIN_PTS = 2;
var BARON_KILLS_PTS = 2;
var DRAGON_KILLS_PTS = 1;
var FIRST_BLOOD_PTS = 2;
var TOWERS_DESTROYED_PTS = 1;
var WIN_UNDER_30_PTS = 2;


var SECS_IN_MIN = 60;
var SECS_IN_HOUR = 3600;
var SECS_IN_DAY = 86400;

//Calculate team and player fantasy pts
function calculateFantasyPts(match) {
	for (var i = 0; i < match.games.length && match.games[i].result == "resolved"; i++) {
		//Team 1
		//Team 1 fantasy pts per game
		var gameStats = match.games[i].team1_stats;
		gameStats.stats.fantasy_pts = (gameStats.result == "Win" ? WIN_PTS : 0) + gameStats.stats.barons_killed * BARON_KILLS_PTS 
			+ gameStats.stats.dragons_killed * DRAGON_KILLS_PTS + (gameStats.stats.first_blood ? FIRST_BLOOD_PTS : 0) 
			+ (gameStats.stats.won_under_30 ? WIN_UNDER_30_PTS : 0) + gameStats.stats.towers_destroyed * TOWERS_DESTROYED_PTS;

		//Team fantasy pts combined (first 2 games)
		if (i < 2) {
			match.team1.fantasy_pts += gameStats.stats.fantasy_pts;
		}

		//Team 1 player fantasy pts
		$.each(gameStats.roster, function(key) {
			//Player fantasy pts per game 
			var player = gameStats.roster[key];
			player.stats.fantasy_pts = player.stats.kills * KILL_PTS + player.stats.deaths * DEATH_PTS + player.stats.assists * ASSIST_PTS 
				+ player.stats.minions_killed * MINION_PTS + player.stats.triple_kills * TRIPLE_KILL_PTS 
				+ player.stats.quadra_kills * QUADRA_KILL_PTS + player.stats.penta_kills * PENTA_KILL_PTS;

			//Player fantasy pts combined (first 2 games)
			if (i < 2) {
				var matchPlayer = match.team1_roster[key];
				if (matchPlayer.name == "") {
					matchPlayer.name = player.name;
					matchPlayer.champion = player.champion;
				}
				matchPlayer.stats.kills += player.stats.kills;
				matchPlayer.stats.deaths += player.stats.deaths;
				matchPlayer.stats.assists += player.stats.assists;
				matchPlayer.stats.triple_kills += player.stats.triple_kills;
				matchPlayer.stats.quadra_kills += player.stats.quadra_kills;
				matchPlayer.stats.penta_kills += player.stats.penta_kills;
				matchPlayer.stats.minions_killed += player.stats.minions_killed;
				matchPlayer.stats.fantasy_pts += player.stats.fantasy_pts;
			}
		});

		//Team 2
		//Team 2 fantasy pts per game
		var gameStats2 = match.games[i].team2_stats;
		gameStats2.stats.fantasy_pts = (gameStats2.result == "Win" ? WIN_PTS : 0) + gameStats2.stats.barons_killed * BARON_KILLS_PTS 
			+ gameStats2.stats.dragons_killed * DRAGON_KILLS_PTS + (gameStats2.stats.first_blood ? FIRST_BLOOD_PTS : 0) 
			+ (gameStats2.stats.won_under_30 ? WIN_UNDER_30_PTS : 0) + gameStats2.stats.towers_destroyed * TOWERS_DESTROYED_PTS;

		//Team fantasy pts combined (first 2 games)
		if (i < 2) {
			match.team2.fantasy_pts += gameStats2.stats.fantasy_pts;
		}

		//Team 2 players
		$.each(gameStats2.roster, function(key) {
			//Player fantasy pts per game 
			var player2 = gameStats2.roster[key];
			player2.stats.fantasy_pts = player2.stats.kills * KILL_PTS + player2.stats.deaths * DEATH_PTS + player2.stats.assists * ASSIST_PTS 
				+ player2.stats.minions_killed * MINION_PTS + player2.stats.triple_kills * TRIPLE_KILL_PTS 
				+ player2.stats.quadra_kills * QUADRA_KILL_PTS + player2.stats.penta_kills * PENTA_KILL_PTS;

			//Player fantasy pts combined (first 2 games)
			if (i < 2) {
				var matchPlayer2 = match.team2_roster[key];
				if (matchPlayer2.name == "") {
					matchPlayer2.name = player2.name;
					matchPlayer2.champion = player2.champion;
				}
				matchPlayer2.stats.kills += player2.stats.kills;
				matchPlayer2.stats.deaths += player2.stats.deaths;
				matchPlayer2.stats.assists += player2.stats.assists;
				matchPlayer2.stats.triple_kills += player2.stats.triple_kills;
				matchPlayer2.stats.quadra_kills += player2.stats.quadra_kills;
				matchPlayer2.stats.penta_kills += player2.stats.penta_kills;
				matchPlayer2.stats.minions_killed += player2.stats.minions_killed;
				matchPlayer2.stats.fantasy_pts += player2.stats.fantasy_pts;
			}
		});
	}
}

function sortMatches(a, b) {
	return (new Date(a['scheduledTime'])).getTime() - (new Date(b['scheduledTime'])).getTime();
}

function sortGames(a, b) {
	return a.game_num - b.game_num;
}

function padZeros(num, size) {
	var n = num.toString();
	while (n.length < size)
		n = "0" + n;

	return n;
}

//========================================================================
// Match Timer
//========================================================================

//Counts down the timers in queue
function timerCount()
{
	$.each(timerObjects, function(key) {
		var o = timerObjects[key];

		var secSub = 1
		var minSub = 0;
		var hourSub = 0;
		var daySub = 0;
		if (o.seconds - secSub < 0) {
			o.seconds = 59;
			minSub = 1;
		} else
			o.seconds--;

		if (o.minutes - minSub < 0) {
			o.minutes = 59;
			hourSub = 1;
		} else
			o.minutes -= minSub;

		if (o.hours - hourSub < 0) {
			o.hours = 23;
			daySub = 1;
		} else
			o.hours -= hourSub;

		if (o.days - daySub < 0) {
			//timer expired
			timerObjects.split(key, 1);
		} else {
			o.days -= daySub;
			showTimeUntilMatch(o);
		}
			
	});

	//If all timers expired, stop counter interval
	if (timerObjects.length == 0) {
		clearInterval(intervalId);
		intervalId = 0;
	}
}

//Stop timer countdown, and clear out all timers
function stopAndClearTimers() {
	clearInterval(intervalId);
	intervalId = 0;

	timerObjects = [];
}

//Add a match to have it's timer shown
function setAndStartTimers(match) {
	var newTimer = true;

	$.each(timerObjects, function(key) {
		if (timerObjects[key].match_day == match.match_day && timerObjects[key].match_num == match.match_num)
			newTimer = false;
	});

	if (newTimer) {
		var o = new MatchTimer();
		o.match_day = match.match_day;
		o.match_num = match.match_num;


		var curDate = new Date();
		seconds = Math.floor((match.scheduled_time_milliseconds - curDate.getTime()) / 1000);
		o.days = Math.floor(seconds / SECS_IN_DAY);
		seconds -= (o.days * SECS_IN_DAY);
		o.hours = Math.floor(seconds / SECS_IN_HOUR);
		seconds -= (o.hours * SECS_IN_HOUR);
		o.minutes = Math.floor(seconds / SECS_IN_MIN);
		o.seconds = seconds - (o.minutes * SECS_IN_MIN);
		timerObjects.push(o);

		//start timer if not started
		if (intervalId == 0)
			intervalId = setInterval(timerCount, 1000);
	}
}

//========================================================================
// Match Caching
//========================================================================

//Break up a match and cache it
function setMatchIntoCache(match, league, weekNum) {
	var baseKey = league + "-" + weekNum + "-" + (match.match_day + 1) + "-" + (match.match_num + 1);

	var o = {};
	o[baseKey + "-match_id"] = match.match_id;
	o[baseKey + "-state"] = match.state;
	o[baseKey + "-scheduled_time"] = match.scheduled_time;
	o[baseKey + "-scheduled_time_milliseconds"] = match.scheduled_time_milliseconds;
	o[baseKey + "-load_status"] = match.load_status;
	chrome.storage.sync.set(o);

	o = {};
	$.each(match.games, function(key) {
		o[baseKey + "-game" + (key + 1)] = match.games[key];
		chrome.storage.sync.set(o);
	});

	o = {};
	o[baseKey + "-team1"] = match.team1
	chrome.storage.sync.set(o);

	o = {};
	o[baseKey + "-team2"] = match.team2
	chrome.storage.sync.set(o);

	o = {};
	o[baseKey + "-team1_roster"] = match.team1_roster
	chrome.storage.sync.set(o);

	o = {};
	o[baseKey + "-team2_roster"] = match.team2_roster
	chrome.storage.sync.set(o);
}

//Retrieve cached match data
function getMatchFromCache(match, league, weekNum) {
	var baseKey = league + "-" + weekNum + "-" + (match.match_day + 1) + "-" + (match.match_num + 1);

	var o = [];
	o.push(baseKey + "-match_id");
	o.push(baseKey + "-state");
	o.push(baseKey + "-scheduled_time");
	o.push(baseKey + "-scheduled_time_milliseconds");
	o.push(baseKey + "-load_status");

	//Get 3 games for na, 2 for eu
	var limit = 0;
	if (league == "na")
		limit = NA_GAMES_PER_MATCH;
	else
		limit = EU_GAMES_PER_MATCH;

	for (var i = 0; i < limit; i++) {
		o.push(baseKey + "-game" + (i + 1));
	}

	o.push(baseKey + "-team1");
	o.push(baseKey + "-team2");
	o.push(baseKey + "-team1_roster");
	o.push(baseKey + "-team2_roster");

	chrome.storage.sync.get(o, function(items) {
		match.match_id = items[baseKey + "-match_id"];
		match.state = items[baseKey + "-state"];
		match.scheduled_time = items[baseKey + "-scheduled_time"];
		match.scheduled_time_milliseconds = items[baseKey + "-scheduled_time_milliseconds"];
		match.load_status = items[baseKey + "-load_status"];

		for (var i = 0; i < limit; i++) {
			match.games.push(items[baseKey + "-game" + (i + 1)]);
		}

		match.team1 = items[baseKey + "-team1"];
		match.team2 = items[baseKey + "-team2"];
		match.team1_roster = items[baseKey + "-team1_roster"];
		match.team2_roster = items[baseKey + "-team2_roster"];
	})
}