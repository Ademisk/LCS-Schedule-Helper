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