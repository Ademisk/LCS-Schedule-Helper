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
		gameStats.stats.f_pts = round((gameStats.result == "Win" ? WIN_PTS : 0) + gameStats.stats.barons_killed * BARON_KILLS_PTS 
			+ gameStats.stats.dragons_killed * DRAGON_KILLS_PTS + (gameStats.stats.first_blood ? FIRST_BLOOD_PTS : 0) 
			+ (gameStats.stats.won_under_30 ? WIN_UNDER_30_PTS : 0) + gameStats.stats.towers_destroyed * TOWERS_DESTROYED_PTS);

		//Team fantasy pts combined (first 2 games)
		if (i < 2) {
			match.team1.f_pts = round(match.team1.f_pts + gameStats.stats.f_pts);
		}

		//Team 1 player fantasy pts
		$.each(gameStats.roster, function(key) {
			//Player fantasy pts per game 
			var player = gameStats.roster[key];
			player.stats.f_pts = round(player.stats.k * KILL_PTS + player.stats.d * DEATH_PTS + player.stats.a * ASSIST_PTS 
				+ player.stats.m * MINION_PTS + player.stats.tk * TRIPLE_KILL_PTS 
				+ player.stats.qk * QUADRA_KILL_PTS + player.stats.pk * PENTA_KILL_PTS);

			//Player fantasy pts combined (first 2 games)
			if (i < 2) {
				var matchPlayer = match.team1_roster[key];
				if (matchPlayer.name == "") {
					matchPlayer.name = player.name;
					matchPlayer.champion = player.champion;
				}
				matchPlayer.stats.k += player.stats.k;
				matchPlayer.stats.d += player.stats.d;
				matchPlayer.stats.a += player.stats.a;
				matchPlayer.stats.tk += player.stats.tk;
				matchPlayer.stats.qk += player.stats.qk;
				matchPlayer.stats.pk += player.stats.pk;
				matchPlayer.stats.m += player.stats.m;
				matchPlayer.stats.f_pts = round(matchPlayer.stats.f_pts + player.stats.f_pts);
			}
		});

		//Team 2
		//Team 2 fantasy pts per game
		var gameStats2 = match.games[i].team2_stats;
		gameStats2.stats.f_pts = round((gameStats2.result == "Win" ? WIN_PTS : 0) + gameStats2.stats.barons_killed * BARON_KILLS_PTS 
			+ gameStats2.stats.dragons_killed * DRAGON_KILLS_PTS + (gameStats2.stats.first_blood ? FIRST_BLOOD_PTS : 0) 
			+ (gameStats2.stats.won_under_30 ? WIN_UNDER_30_PTS : 0) + gameStats2.stats.towers_destroyed * TOWERS_DESTROYED_PTS);

		//Team fantasy pts combined (first 2 games)
		if (i < 2) {
			match.team2.f_pts = round(match.team2.f_pts + gameStats2.stats.f_pts);
		}

		//Team 2 players
		$.each(gameStats2.roster, function(key) {
			//Player fantasy pts per game 
			var player2 = gameStats2.roster[key];
			player2.stats.f_pts = round(player2.stats.k * KILL_PTS + player2.stats.d * DEATH_PTS + player2.stats.a * ASSIST_PTS 
				+ player2.stats.m * MINION_PTS + player2.stats.tk * TRIPLE_KILL_PTS 
				+ player2.stats.qk * QUADRA_KILL_PTS + player2.stats.pk * PENTA_KILL_PTS);

			//Player fantasy pts combined (first 2 games)
			if (i < 2) {
				var matchPlayer2 = match.team2_roster[key];
				if (matchPlayer2.name == "") {
					matchPlayer2.name = player2.name;
					matchPlayer2.champion = player2.champion;
				}
				matchPlayer2.stats.k += player2.stats.k;
				matchPlayer2.stats.d += player2.stats.d;
				matchPlayer2.stats.a += player2.stats.a;
				matchPlayer2.stats.tk += player2.stats.tk;
				matchPlayer2.stats.qk += player2.stats.qk;
				matchPlayer2.stats.pk += player2.stats.pk;
				matchPlayer2.stats.m += player2.stats.m;
				matchPlayer2.stats.f_pts = round(matchPlayer2.stats.f_pts + player2.stats.f_pts);
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

function round(p) {
	return parseFloat(parseFloat(p).toFixed(2));
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
// Schedule Caching
//========================================================================

//Retrieves the schedules for leagues
function loadCachedSchedule() {
	o = [];

	o.push('na_schedule');
	o.push('eu_schedule');

	chrome.storage.local.get(o, function(items){
		na_schedule = items['na_schedule'];
		eu_schedule = items['eu_schedule'];

		loadAndUseData();
	});
}

//Saves just the week and day data. And matchID. Basically, everything retrieved from the first API call
function saveScheduleIntoCache(schedule, league) {
	var o = {};

	if (league == "na")
		o["na_schedule"] = schedule;
	else
		o["eu_schedule"] = schedule;

	chrome.storage.local.set(o);
}

//========================================================================
// Match Caching
//========================================================================
function loadCachedMatches() {
	var o = [];
	var bKeyNA;
	var bKeyEU;

	//Create the keys
	//Get all NA data
	for (var i = 0; i < WEEKS_IN_LCS; i++) {
		for (var j = 0; j < NA_DAYS_PER_WEEK; j++) {
			for (var k = 0; k < na_schedule[i].days[j].matches.length; k++) {
				bKeyNA = "na-" + (i + 1) + "-" + (j + 1) + "-" + (k + 1);
				//o.push(bKeyNA + "-match_id");
				o.push(bKeyNA + "-state");
				o.push(bKeyNA + "-scheduled_time");
				o.push(bKeyNA + "-scheduled_time_milliseconds");
				o.push(bKeyNA + "-load_status");

				var gamesPerMatch = NA_GAMES_PER_MATCH;

				for (var l = 0; l < gamesPerMatch; l++) {
					o.push(bKeyNA + "-game" + (l + 1));
				}

				o.push(bKeyNA + "-team1");
				o.push(bKeyNA + "-team2");
				o.push(bKeyNA + "-team1_roster");
				o.push(bKeyNA + "-team2_roster");
			}
		}
	}

	//Get all EU data
	for (var i = 0; i < WEEKS_IN_LCS; i++) {
		for (var j = 0; j < EU_DAYS_PER_WEEK; j++) {
			for (var k = 0; k < eu_schedule[i].days[j].matches.length; k++) {
				bKeyEU = "eu-" + (i + 1) + "-" + (j + 1) + "-" + (k + 1);
				//o.push(bKeyEU + "-match_id");
				o.push(bKeyEU + "-state");
				o.push(bKeyEU + "-scheduled_time");
				o.push(bKeyEU + "-scheduled_time_milliseconds");
				o.push(bKeyEU + "-load_status");

				var gamesPerMatch = EU_GAMES_PER_MATCH;

				for (var l = 0; l < gamesPerMatch; l++) {
					o.push(bKeyEU + "-game" + (l + 1));
				}

				o.push(bKeyEU + "-team1");
				o.push(bKeyEU + "-team2");
				o.push(bKeyEU + "-team1_roster");
				o.push(bKeyEU + "-team2_roster");
			}
		}
	}

	chrome.storage.local.get(o, function(items) {
		var league;
		var week;
		var day;
		var match;
		var elem;
		var game;

		//weeks, days, matches, games assumed in order, since keys were added to o[] in order
		$.each(items, function(key) {
			league = key.replace(/([a-z]{2}).*/, "$1");
			week = key.replace(/[a-z]{2}-(\d{1}).*/, "$1") - 1;
			day = key.replace(/[a-z]{2}-\d{1}-(\d{1}).*/, "$1") - 1;
			match = key.replace(/[a-z]{2}-\d{1}-\d{1}-(\d{1}).*/, "$1") - 1;
			elem = key.replace(/[a-z]{2}-\d{1}-\d{1}-\d{1}-([a-z0-9_]+).*/, "$1");

			var schedule;
			if (league == "na")
				schedule = na_schedule;
			else
				schedule = eu_schedule;

			if (elem.match(/game[\d]+/)) {
				game = elem.replace(/game/, '') - 1;
				schedule[week].days[day].matches[match].games[game] = items[key];
			} else {
				schedule[week].days[day].matches[match][elem] = items[key];
			}
		});

		showTab(curLeague, curWeek);
	});
}

//Break up a match and cache it
function saveMatchIntoCache(match, league, weekNum) {
	var baseKey = league + "-" + weekNum + "-" + (match.match_day + 1) + "-" + (match.match_num + 1);
	//console.log('baseKey: ' + baseKey);

	var o = {};
	//o[baseKey + "-match_id"] = match.match_id;
	o[baseKey + "-state"] = match.state;
	o[baseKey + "-scheduled_time"] = match.scheduled_time;
	o[baseKey + "-scheduled_time_milliseconds"] = match.scheduled_time_milliseconds;
	o[baseKey + "-load_status"] = match.load_status;
	chrome.storage.local.set(o);

	$.each(match.games, function(key) {
		o = {};
		o[baseKey + "-game" + (key + 1)] = match.games[key];
		chrome.storage.local.set(o);
	});

	o = {};
	o[baseKey + "-team1"] = match.team1
	chrome.storage.local.set(o);

	o = {};
	o[baseKey + "-team2"] = match.team2
	chrome.storage.local.set(o);

	o = {};
	o[baseKey + "-team1_roster"] = match.team1_roster
	chrome.storage.local.set(o);

	o = {};
	o[baseKey + "-team2_roster"] = match.team2_roster
	chrome.storage.local.set(o);
}

//===============================
// Settings
//===============================

//Attempt to load user settings. Fail or succeed, load schedule data.
function loadAllFromCache() {
  extSettings = new Settings();
  extSettings.usability = new UsabilitySettings();
  extSettings.leagues = new LeagueSettings();
  extSettings.fantasy = new FantasySettings();

  var o = [];
  o.push("usabilitySettings");
  o.push("leagueSettings");
  o.push("fantasySettings");
  
  chrome.storage.local.get(o, function(items) {
    setSettings(items);
    loadCachedSchedule();
  });
}

//Set settings to object, and push up to the form
function setSettings(items) {
	if (typeof items["usabilitySettings"] !== "undefined") {
		extSettings.usability = items["usabilitySettings"];
		$('#view_mode #' + extSettings.usability.view_mode).prop('checked', true);
		$('#hide_results').prop('checked', extSettings.usability.hide_results);
	}

	if (typeof items["leagueSettings"] !== "undefined") {
		extSettings.leagues = items["leagueSettings"];
		$('#na_lcs_league').prop('checked', extSettings.leagues.na_lcs_league);
		$('#eu_lcs_league').prop('checked', extSettings.leagues.eu_lcs_league);
	}

	if (typeof items["fantasySettings"] !== "undefined") {
		extSettings.fantasy = items["fantasySettings"];
		$('#show_fantasy_pts').prop('checked', extSettings.fantasy.show_fantasy_pts);
		$('#fantasy_mode #' + extSettings.fantasy.fantasy_mode).prop('checked', true);
	}
}
