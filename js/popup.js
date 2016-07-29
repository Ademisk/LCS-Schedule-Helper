//eSports API breakdown: https://gist.github.com/levi/e7e5e808ac0119e154ce
//Fantasy API breakdown: https://gist.github.com/brcooley/8429583561c47b248f80


//var PROXY = 'https://us.hidester.com/proxy.php?u='
//var CORS_PROXY = "http://cors.io/?u=";
//var CORS_PROXY = "https://crossorigin.me/";
//var CORS_PROXY = "http://jsonp.afeld.me/?url=";
//var CORS_PROXY = "http://www.whateverorigin.org/get?url="
var CORS_PROXY = "http://anyorigin.com/get?url=";

var API_SCHEDULE_ITEMS = "http://api.lolesports.com/api/v1/scheduleItems";
var API_HIGHLANDER_MATCH_DETAILS = "http://api.lolesports.com/api/v2/highlanderMatchDetails";
var API_GAME_STATS = "https://acs.leagueoflegends.com/v1/stats/game/{realm}/{gameId}";

var NA_LEAGUE_ID = 2;
var EU_LEAGUE_ID = 3;

var WEEKS_IN_LCS = 9;

var NA_DAYS_PER_WEEK = 3;
var NA_DAY1_MATCHES = 2;
var NA_DAY2_MATCHES = 4;
var NA_DAY3_MATCHES = 4;
var NA_GAMES_PER_MATCH = 3;

var EU_DAYS_PER_WEEK = 2;
var EU_DAY1_MATCHES = 5;
var EU_DAY2_MATCHES = 5;
var NA_GAMES_PER_MATCH = 2;

var NA_LEAGUE_HASH = "472c44a9-49d3-4de4-912c-aa4151fd1b3b";
var NA_BRACKET_HASH = "2a6a824d-3009-4d23-9c83-859b7a9c2629";

var EU_LEAGUE_HASH = "f7afa181-4580-48c0-af26-4b3d70fe21eb";
var EU_BRACKET_HASH = "88a5aa52-4461-4a15-8fb5-83c8b5265f93";

var USE_CACHE = false;

function Week() {
  this.week_num = 0,
  this.days = []                //2 for EU, 3 for NA
};

function Day() {
  this.day_date = "",
  this.day_date_epoch = 0,
  this.matches = []             //2 and 4 for NA, 5 for EU
};

function Match() {
  this.match_day = 0,
  this.match_num = 0,
  this.match_id = 0,
  this.state = "",
  this.games = [],              //2 for EU, 3 for NA
  this.scheduled_time = "",
  this.load_status = "",
  this.team1 = null,
  this.team2 = null,
  this.team1_roster = null,     //These are the aggregated stats for first 2 games (for fantasy league purposes)
  this.team2_roster = null
};

function Game() {
  this.game_num = 0,
  this.game_length = 0,
  this.game_realm = "",
  this.game_id = 0,
  this.game_id_hash = "",
  this.game_hash = "",
  this.result = "",
  this.team1_stats = null,
  this.team2_stats = null,
  this.vod_link = ""
};

function Team() {
  this.name = "",
  this.name_stub = "",
  this.icon = "",
  this.fantasy_pts = 0.0
};

function TeamResults() {
  this.name_stub = "",
  this.result = "",
  this.roster = null,
  this.stats = null
};

function TeamStats() {
  this.got_first_blood = false,
  this.won_under_30 = false,
  this.barons_killed = 0,
  this.dragons_killed = 0,
  this.towers_destroyed = 0,
  this.fantasy_pts = 0.0
}

function Roster() {
  this.top = null,
  this.jg = null,
  this.mid = null,
  this.sup = null,
  this.adc = null
};

function Player() {
  this.name = "",
  this.champion = "",
  this.stats = null
};

function PlayerStats() {
  this.kills = 0,
  this.deaths = 0,
  this.assists = 0,
  this.triple_kills = 0,
  this.quadra_kills = 0,
  this.penta_kills = 0,
  this.minions_killed = 0,
  this.fantasy_pts = 0.0
}

var na_schedule;
var eu_schedule;

var curLeague = "";
var curWeek = -1;

//Fill in the schedule with dates
function getAndpopulateSchedule(scheduleData, matchData, league) {
  var leagueID = "";
  var bracketID = "";
  var schedule = null;
  if (league == "na") {
    leagueID = NA_LEAGUE_HASH;
    bracketID = NA_BRACKET_HASH;
    schedule = na_schedule;
  }
  else if (league == "eu") {
    leagueID = EU_LEAGUE_HASH;
    bracketID = EU_BRACKET_HASH;
    schedule = eu_schedule;
  }
  else
    alert('error populating schedule');

  //filter out all times for Summer 2016 LCS, NA or EU
  var newScheduleData = jQuery.grep(scheduleData, function(k) {
    //For EU league, remove the 'panel' scheduled match by looking for imageUrl. In NA it's not present
    if (k['tournament'] == leagueID && k['content'].indexOf('imageUrl') == -1)
      return k;
  });

  newScheduleData.sort(sortMatches);

  var tournamentData;
  for (var i = 0; i < matchData.length; i++) {
    if (matchData[i].id == leagueID)
      tournamentData = matchData[i];
  }

  var gameHashDeferred = [];
  var matchNum = 0;
  var day = 0;
  var oldDay = 0;
  $.each(newScheduleData, function(key) {
    var week = newScheduleData[key].tags["blockLabel"];
    oldDay = day;
    day = newScheduleData[key].tags["subBlockLabel"];
    if (oldDay != day)
      matchNum = 0;
    else
      matchNum++;

    var dt = new Date(newScheduleData[key].scheduledTime);
    var hours = dt.getHours();
    var amPmString;
    if (hours == 12) {
      amPmString = "PM";
    }
    else if (hours > 12) {
      amPmString = "PM";
      hours -= 12;
    }
    else
      amPmString = "AM";

    var dayDate = weekday[dt.getDay()] + ', ' + month[dt.getMonth()] + ' ' + dt.getDate() + ' - Day ' + day;

    if (schedule[week - 1].days[day - 1] == null)
      schedule[week - 1].days[day - 1] = new Day();
    if (schedule[week - 1].days[day - 1].day_date == "") {
      schedule[week - 1].days[day - 1].day_date = dayDate;
      schedule[week - 1].days[day - 1].day_date_epoch = newScheduleData[key].scheduledTime;
    }

    m = new Match();
    m.match_day = parseInt(day - 1);
    m.match_num = matchNum;
    m.match_id = newScheduleData[key].match;
    m.load_status = "not started";
    m.team1 = new Team();
    m.team2 = new Team();
    m.team1.name_stub = tournamentData.brackets[bracketID].matches[m.match_id].name.split("-vs-")[0];
    m.team1.icon = teamIcon[m.team1.name_stub];
    m.team2.name_stub = tournamentData.brackets[bracketID].matches[m.match_id].name.split("-vs-")[1];
    m.team2.icon = teamIcon[m.team2.name_stub];
    m.scheduled_time = hours + ':00' + amPmString;
    m.state = tournamentData.brackets[bracketID].matches[m.match_id].state;

    //Get the limited game data (gameId, and gameRealm)
    //If 3rd game for NA doesn't exist, game_id will be undefined
    var matchGames = tournamentData.brackets[bracketID].matches[m.match_id].games;
    m.games = new Array();
    for (g in matchGames) {
      var game = new Game();
      game.game_num = parseInt(matchGames[g].name.replace("G", ""));
      game.game_realm = matchGames[g].gameRealm;
      game.game_id = matchGames[g].gameId;
      game.game_id_hash = matchGames[g].id;
      game.result = "not played";
      m.games.push(game);
    }

    m.games.sort(sortGames);

    schedule[week - 1].days[day - 1].matches.push(m);
  });
}

//NA is assumed default
function getWeekMatchResults(league, week) {
  var req = [];
  var leagueHash = league == "na" ? NA_LEAGUE_HASH : EU_LEAGUE_HASH;


  for (var i = 0; i < week.days.length; i++) {
    for (var j = 0; j < week.days[i].matches.length; j++) {
      if (week.days[i].matches[j].state == "unresolved") {
        showMatch(week.days[i].matches[j])
      } else {
        var proxyApiUrl = API_HIGHLANDER_MATCH_DETAILS + '?tournamentId=' + leagueHash 
          + '&matchId=' + week.days[i].matches[j].match_id;
        (function(match) {
          req.push($.ajax({
            url: proxyApiUrl,
            dataType: 'json',
            method: 'GET'
          }).then(function (resp) {
            var req2 = [];

            initMatchRosters(match);

            for (var k = 0; k < resp.gameIdMappings.length; k++) {
              for (var l = 0; l < match.games.length; l++) {
                if (match.games[l].game_id_hash == resp.gameIdMappings[k].id) {
                  match.games[l].game_hash = resp.gameIdMappings[k].gameHash;
                  match.games[l].vod_link = resp.videos.source;

                  addPlayersAndRoles(match, l, resp);   //Initializes players and positions

                  req2.push(getGameData(match, l));     //match, gameNum
                }
              }
            }
            return $.when.apply($, req2).done(function() {
              console.log("Games for day #" + (i + 1) + " match #" + (j + 1) + " resolved");
              calculateFantasyPts(match);

              //Show match only if it's on the current league and week
              if (league == curLeague && week.week_num == curWeek) {
                showMatch(match);
              }
            });
          }));
        })(week.days[i].matches[j]);
      }
    }
  }

  return $.when.apply($, req).done(function() {
    console.log("Matches for week resolved");
  });
}

//Create elements to hold aggregated player data
function initMatchRosters(match) {
  match.team1_roster = new Roster();
  match.team1_roster.top = new Player();
  match.team1_roster.top.stats = new PlayerStats();
  match.team1_roster.jg = new Player();
  match.team1_roster.jg.stats = new PlayerStats();
  match.team1_roster.mid = new Player();
  match.team1_roster.mid.stats = new PlayerStats();
  match.team1_roster.sup = new Player();
  match.team1_roster.sup.stats = new PlayerStats();
  match.team1_roster.adc = new Player();
  match.team1_roster.adc.stats = new PlayerStats();

  match.team2_roster = new Roster();
  match.team2_roster.top = new Player();
  match.team2_roster.top.stats = new PlayerStats();
  match.team2_roster.jg = new Player();
  match.team2_roster.jg.stats = new PlayerStats();
  match.team2_roster.mid = new Player();
  match.team2_roster.mid.stats = new PlayerStats();
  match.team2_roster.sup = new Player();
  match.team2_roster.sup.stats = new PlayerStats();
  match.team2_roster.adc = new Player();
  match.team2_roster.adc.stats = new PlayerStats();
}

//Populates roster with player names and positions
function addPlayersAndRoles(match, gameNum, data) {
  var team1;
  var team2;
  var game = match.games[gameNum];

  //Teams aren't guaranteed an order, so we need to match them before filling our the roster
  if (match.team1.name_stub == data.teams[0].acronym) {
    team1 = data.teams[0];
    team2 = data.teams[1];
  } else {
    team1 = data.teams[1];
    team2 = data.teams[0];
  }

  game.team1_stats = new TeamResults();
  game.team1_stats.stats = new TeamStats();
  game.team1_stats.roster = new Roster();
  game.team1_stats.roster.top = new Player();
  game.team1_stats.roster.top.stats = new PlayerStats();
  game.team1_stats.roster.jg = new Player();
  game.team1_stats.roster.jg.stats = new PlayerStats();
  game.team1_stats.roster.mid = new Player();
  game.team1_stats.roster.mid.stats = new PlayerStats();
  game.team1_stats.roster.sup = new Player();
  game.team1_stats.roster.sup.stats = new PlayerStats();
  game.team1_stats.roster.adc = new Player();
  game.team1_stats.roster.adc.stats = new PlayerStats();

  game.team2_stats = new TeamResults();
  game.team2_stats.stats = new TeamStats();
  game.team2_stats.roster = new Roster();
  game.team2_stats.roster.top = new Player();
  game.team2_stats.roster.top.stats = new PlayerStats();
  game.team2_stats.roster.jg = new Player();
  game.team2_stats.roster.jg.stats = new PlayerStats();
  game.team2_stats.roster.mid = new Player();
  game.team2_stats.roster.mid.stats = new PlayerStats();
  game.team2_stats.roster.sup = new Player();
  game.team2_stats.roster.sup.stats = new PlayerStats();
  game.team2_stats.roster.adc = new Player();
  game.team2_stats.roster.adc.stats = new PlayerStats();

  for (var k = 0; k < 5; k++) {
    for (var l = 0; l < data.players.length; l++) {
      if (team1.starters[k] == data.players[l].id) {
        switch (data.players[l].roleSlug) {
          case "toplane":
            game.team1_stats.roster.top.name = data.players[l].name;
            break;
          case "jungle":
            game.team1_stats.roster.jg.name = data.players[l].name;
            break;
          case "midlane":
            game.team1_stats.roster.mid.name = data.players[l].name;
            break;
          case "support":
            game.team1_stats.roster.sup.name = data.players[l].name;
            break;
          case "adcarry":
            game.team1_stats.roster.adc.name = data.players[l].name;
            break;
        }
      }
      if (team2.starters[k] == data.players[l].id) {
        switch (data.players[l].roleSlug) {
          case "toplane":
            game.team2_stats.roster.top.name = data.players[l].name;
            break;
          case "jungle":
            game.team2_stats.roster.jg.name = data.players[l].name;
            break;
          case "midlane":
            game.team2_stats.roster.mid.name = data.players[l].name;
            break;
          case "support":
            game.team2_stats.roster.sup.name = data.players[l].name;
            break;
          case "adcarry":
            game.team2_stats.roster.adc.name = data.players[l].name;
            break;
        }
      }
    }
  }
}

//Returns data specific to a game, then populates it
function getGameData(match, gameNum) {
  var apiUrl = API_GAME_STATS.replace("{realm}", match.games[gameNum].game_realm).replace("{gameId}", match.games[gameNum].game_id) 
    + "?gameHash=" + match.games[gameNum].game_hash;
  var proxiedApiUrl = CORS_PROXY + apiUrl;
  console.log(proxiedApiUrl);

  match.load_status = "pending";

  return $.ajax({
    url: proxiedApiUrl,
      dataType: 'json',
      method: 'GET'
  }).then(function(data) {
    console.log("Game #" + (gameNum + 1) + " done");
    match.load_status = "done";
    parseGameResults(match, gameNum, data);
  });
}

//Filter and set game results per player
function parseGameResults(match, gameNum, data) {
  var team1Name = "";
  var team2Name = "";

  match.games[gameNum].result = "resolved";

  //Player results
  for (var i = 0; i < 10; i++) {
    var pTeam = data.participantIdentities[i].player.summonerName.split(" ")[0];
    var pName = data.participantIdentities[i].player.summonerName.split(" ")[1];
    var pId = data.participantIdentities[i].participantId;
    var pTeamId = data.participants[i].teamId;

    if (team1Name == "" && pTeamId == 100) {
      team1Name = pTeam;
    }

    if (team2Name == "" && pTeamId == 200) {
      team2Name = pTeam;
    }

    var roster;
    if (match.team1.name_stub == pTeam) {
      roster = match.games[gameNum].team1_stats.roster;
    } else {
      roster = match.games[gameNum].team2_stats.roster;
    }

    $.each(roster, function(key) {
      if (roster[key].name == pName) {
        roster[key].stats.kills = data.participants[i].stats.kills;
        roster[key].stats.assists = data.participants[i].stats.assists;
        roster[key].stats.deaths = data.participants[i].stats.deaths;
        roster[key].stats.triple_kills = data.participants[i].stats.tripleKills;
        roster[key].stats.quadra_kills = data.participants[i].stats.quadraKills;
        roster[key].stats.penta_kills = data.participants[i].stats.pentaKills;
        roster[key].stats.minions_killed = data.participants[i].stats.totalMinionsKilled;

        roster[key].champion = data.participants[i].championId;
      }
    })
  }

  //Team results
  var team1 = null;
  var team2 = null;

  if (match.team1.name_stub == team1Name) {
    team1 = match.games[gameNum].team1_stats;
    team2 = match.games[gameNum].team2_stats;
  } else {
    team2 = match.games[gameNum].team1_stats;
    team1 = match.games[gameNum].team2_stats;
  }

  team1.name_stub = team1Name;
  team1.result = data.teams[0].win == "Win" ? "Win" : "Lose";
  team1.stats.got_first_blood = data.teams[0].firstBlood;
  team1.stats.won_under_30 = data.teams[0].win == "Win" && (data.gameDuration / 60) < 30;
  team1.stats.dragons_killed = data.teams[0].dragonKills;
  team1.stats.barons_killed = data.teams[0].baronKills;
  team1.stats.towers_destroyed = data.teams[0].towerKills;

  team2.name_stub = team2Name;
  team2.result = data.teams[1].win == "Win" ? "Win" : "Lose";
  team2.stats.got_first_blood = data.teams[1].firstBlood;
  team2.stats.won_under_30 = data.teams[1].win == "Win" && (data.gameDuration / 60) < 30;
  team2.stats.dragons_killed = data.teams[1].dragonKills;
  team2.stats.barons_killed = data.teams[1].baronKills;
  team2.stats.towers_destroyed = data.teams[1].towerKills;
}

//Determines current week. League defaults to NA
function setCurWeek() {
  var dt = new Date();
  var curWeekMonday = new Date();
  curWeekMonday.setDate(dt.getDate() - (dt.getDay() - 1));
  var curWeekSunday = new Date();
  curWeekSunday.setDate(dt.getDate() + (7 - dt.getDay()));

  for (var i = 0; i < WEEKS_IN_LCS && curWeek == -1; i++) {
    var tempDate = new Date(na_schedule[i].days[0].day_date_epoch);
    if (curWeekMonday <= tempDate && tempDate <= curWeekSunday)
      curWeek = i + 1;
  }
}

//Shows specific week of a league
function showTab(league, week) {
  curLeague = league == null ? curLeague : league;
  curWeek = week == null ? curWeek : week;

  var schedule;
  if (curLeague == "na")
    schedule = na_schedule;
  else
    schedule = eu_schedule;

  //Prioritize data for initial league/week, to show content faster
  //Get the gameHash, then get the rest of data
  getWeekMatchResults(curLeague, schedule[curWeek - 1]).then(function() {
    console.log("curWeek data returned");
  });


  //Add styles to league and week tab
  $('#' + curLeague).removeClass('unselected').addClass('selected');
  if (curLeague == "na")
    $('#eu').removeClass('selected').addClass('unselected');
  else
    $('#na').removeClass('selected').addClass('unselected');

  for (var i = 0; i < WEEKS_IN_LCS; i++) {
    if (i + 1 == curWeek)
      $('#week' + (i + 1) + '_select').removeClass('unselected').addClass('selected');
    else
      $('#week' + (i + 1) + '_select').removeClass('selected').addClass('unselected');
  }

  if (curLeague == "na") {
    $('.euDay').hide();
    $('.euMatch').hide();
    $('.euGame').hide();

    $('.naDay').show();
    $('.naMatch').show();
    $('.naGame').show();
  }
  else if (curLeague == "eu") {
    $('.naDay').hide();
    $('.naMatch').hide();
    $('.naGame').hide();

    $('.euDay').show();
    $('.euMatch').show();
    $('.euGame').show();
  }

  $('.weekContainer').hide();
  populateTab(curLeague, curWeek);  
  $('#week').show();
}

//Selects match and shows specific game num
function getAndShowMatch(dayNum, matchNum, gameNum) {
  var match;
  if (curLeague == "na")
    match = na_schedule[curWeek - 1].days[dayNum].matches[matchNum];
  else
    match = eu_schedule[curWeek - 1].days[dayNum].matches[matchNum];

  showMatch(match, gameNum);
}

//Gets called after ajax call returns data, or when tabs change. Always loads aggregated match data (and not specific game)
function showMatch(match, gameNum) {
  clearDisplayedGame(match.match_day, match.match_num);

  var gNum = 0;
  if (typeof gameNum !== "undefined") {
    gNum = gameNum
  }

  updateGameTabHighlight(match, gNum)

  if (match.state == "unresolved") {
    $('#day' + (match.match_day + 1) + ' #match' + (match.match_num + 1) + ' #team1_roster' + ' #mid #player_name').html('TBD');
  }
  else if (match.load_status != "done") {
    //show loading spinner
    $('#day' + (match.match_day + 1) + ' #match' + (match.match_num + 1) + ' #team1_roster' + ' #mid #player_name').html('Loading...');
  } else {
    //show match data


    //show game data
    showGame(match, gNum);
  }
}

function clearDisplayedGame(dayNum, matchNum) {
  for (var i = 0; i < 5; i++) {
    var pData = $('#day' + (dayNum + 1) + ' #match' + (matchNum + 1) + ' #team1_roster').children().eq(i);
    //pData.find('#champion_icon').src('');
    pData.find('#player_name').html('');
    pData.find('#kda').html('');
    pData.find('#fantasy_pts').html('');

    var pData2 = $('#day' + (dayNum + 1) + ' #match' + (matchNum + 1) + ' #team2_roster').children().eq(i);
    //pData2.find('#champion_icon').src('');
    pData2.find('#player_name').html('');
    pData2.find('#kda').html('');
    pData2.find('#fantasy_pts').html('');
  }

  $('#day' + (dayNum + 1) + ' #match' + (matchNum + 1) + ' #matchHeader #game_stream').hide();
}

//Updates the highlight when switching leagues/weeks/games
function updateGameTabHighlight(match, gameNum) {
  var gameTabId;
  if (gameNum == 0)
    gameTabId = "#matchOverview";
  else
    gameTabId = "#game" + gameNum;

  $.each($('#day' + (match.match_day + 1) + ' #match' + (match.match_num + 1) + ' #gamesTab').children(), function(key) {
    $('#day' + (match.match_day + 1) + ' #match' + (match.match_num + 1) + ' #gamesTab').children().eq(key).addClass('unselected').removeClass('selected');
  });

  $('#day' + (match.match_day + 1) + ' #match' + (match.match_num + 1) + ' #gamesTab ' + gameTabId).addClass('selected').removeClass('unselected')
}

//Show game results of specific game
function showGame(match, game) {
  var pos = [];
  pos["top"] = "top";
  pos["jungle"] = "jg";
  pos["mid"] = "mid";
  pos["ad"] = "adc";
  pos["support"] = "sup";

  //The elements
  var day = match.match_day;
  var team1Roster = $('#day' + (day + 1) + ' #match' + (match.match_num + 1) + ' #team1_roster .playerRow')
  var team2Roster = $('#day' + (day + 1) + ' #match' + (match.match_num + 1) + ' #team2_roster .playerRow')

  if (game == 0) {    //Display data aggregated from all games in match
    $('#day' + (match.match_day + 1) + ' #match' + (match.match_num + 1) + ' #matchHeader #game_stream').hide();
    //The data
    var matchRoster;
    var matchRoster2;
    if (curLeague == "na") {
      matchRoster = na_schedule[curWeek - 1].days[day].matches[match.match_num].team1_roster;
      matchRoster2 = na_schedule[curWeek - 1].days[day].matches[match.match_num].team2_roster;
    } else {
      matchRoster = eu_schedule[curWeek - 1].days[day].matches[match.match_num].team1_roster;
      matchRoster2 = eu_schedule[curWeek - 1].days[day].matches[match.match_num].team2_roster;
    }

    for (var i = 0; i < team1Roster.length; i++) {
      var pData = matchRoster[pos[team1Roster[i].id]];
      $(team1Roster[i]).find('#player_name').html(pData.name);
      $(team1Roster[i]).find('#kda').html(pData.stats.kills + "/" + pData.stats.deaths + "/" + pData.stats.assists);
      $(team1Roster[i]).find('#fantasy_pts').html(parseFloat(pData.stats.fantasy_pts).toFixed(2));

      var pData2 = matchRoster2[pos[team2Roster[i].id]];
      $(team2Roster[i]).find('#player_name').html(pData2.name);
      $(team2Roster[i]).find('#kda').html(pData2.stats.kills + "/" + pData2.stats.deaths + "/" + pData2.stats.assists);
      $(team2Roster[i]).find('#fantasy_pts').html(parseFloat(pData2.stats.fantasy_pts).toFixed(2));
    }
  } else {
    //The data
    var curGame;  
    if (curLeague == "na") {
      curGame = na_schedule[curWeek - 1].days[day].matches[match.match_num].games[game - 1];    //Subtract 1 from game because 0 is reserved for the 'All' tab
    } else {
      curGame = eu_schedule[curWeek - 1].days[day].matches[match.match_num].games[game - 1];    //Subtract 1 from game because 0 is reserved for the 'All' tab
    }

    if (curGame.result == "not played") {
      $('#day' + (match.match_day + 1) + ' #match' + (match.match_num + 1) + ' #team1_roster' + ' #mid #player_name').html('Not Played');
    } else {
      $('#day' + (match.match_day + 1) + ' #match' + (match.match_num + 1) + ' #matchHeader #game_stream').show();
      $('#day' + (match.match_day + 1) + ' #match' + (match.match_num + 1) + ' #matchHeader #game_stream').html('Watch Game');
      $('#day' + (match.match_day + 1) + ' #match' + (match.match_num + 1) + ' #matchHeader #game_stream').attr('href', curGame.vod_link);

      //Set the data
      for (var i = 0; i < team1Roster.length; i++) {
        var pData = curGame.team1_stats.roster[pos[team1Roster[i].id]];

        $(team1Roster[i]).find('#player_name').html(pData.name);
        $(team1Roster[i]).find('#kda').html(pData.stats.kills + "/" + pData.stats.deaths + "/" + pData.stats.assists);
        $(team1Roster[i]).find('#fantasy_pts').html(parseFloat(pData.stats.fantasy_pts).toFixed(2));

        var pData2 = curGame.team2_stats.roster[pos[team2Roster[i].id]];

        $(team2Roster[i]).find('#player_name').html(pData2.name);
        $(team2Roster[i]).find('#kda').html(pData2.stats.kills + "/" + pData2.stats.deaths + "/" + pData2.stats.assists);
        $(team2Roster[i]).find('#fantasy_pts').html(parseFloat(pData2.stats.fantasy_pts).toFixed(2));
      }
    }
  }
}

//Populates a week with match result data
function populateTab(league, week) {
  var schedule;
  if (league == "na") 
    schedule = na_schedule;
  else
    schedule = eu_schedule;

  for (var i = 0; i < schedule[week - 1].days.length; i++) {
    $('#day' + (i + 1) + ' #date').html(schedule[week - 1].days[i].day_date)

    //Populate matches
    for (var j = 0; j < schedule[week - 1].days[i].matches.length; j++) {
      $('#day' + (i + 1) + ' #match' + (j + 1) + ' #matchTime').html(schedule[week - 1].days[i].matches[i].scheduled_time)
      $('#day' + (i + 1) + ' #match' + (j + 1) + ' #team1_icon').attr('src', teamIcon[schedule[week - 1].days[i].matches[j].team1.name_stub]);
      $('#day' + (i + 1) + ' #match' + (j + 1) + ' #team2_icon').attr('src', teamIcon[schedule[week - 1].days[i].matches[j].team2.name_stub]);

      showMatch(schedule[week - 1].days[i].matches[j]);
    }
  }
}

//Populate base elements
function init() {
  curLeague = "na";
  na_schedule = new Array(9);
  eu_schedule = new Array(9);

  for (var i = 0; i < WEEKS_IN_LCS; i++) {
    na_schedule[i] = new Week();
    na_schedule[i].week_num = i + 1;
    eu_schedule[i] = new Week();
    eu_schedule[i].week_num = i + 1;
  }
}

//Attaches events to DOM elements
function initListeners() {
  //League Select
  $('#eu').click(function() {
    showTab("eu", null);
  });

  $('#na').click(function() {
    showTab("na", null);
  });

  //Week Select
  for (var i = 1; i <= WEEKS_IN_LCS; i++) {
    (function(i) {
      $('#week' + i + '_select').click(function() {
        showTab(null, i);
      })
    })(i);
  }

  //Game Select
  //Assumes elements all in order
  days = $('.naDay,.euDay');
  for (var i = 0; i < days.length; i++) {
    matches = $(days[i]).find('.naMatch,.euMatch');
    for (var j = 0; j < matches.length; j++) {
      games = $(matches[j]).find('.naGame,.euGame');
      for (var k = 0; k < games.length; k++) {
        (function(dayNum, matchNum, gameNum) {
          $(games[gameNum]).click(function() {
            getAndShowMatch(dayNum, matchNum, gameNum);
          })
        })(i, j, k);
      }
    }
  }
}

//Start Here
document.addEventListener('DOMContentLoaded', function() {
  initListeners();
  init();

  $.when(
    //NA Data
    $.ajax({
      url: API_SCHEDULE_ITEMS,
      data: {
        leagueId: NA_LEAGUE_ID
      },
      dataType: 'json',
      method: 'GET'
    }),

    //EU Data
    $.ajax({
      url: API_SCHEDULE_ITEMS,
      data: {
        leagueId: EU_LEAGUE_ID
      },
      dataType: 'json',
      method: 'GET'
    })).then(
      function (resp1, resp2) {
        //Show the schedule times and what teams play
        getAndpopulateSchedule(resp1[0].scheduleItems, resp1[0].highlanderTournaments, "na");
        getAndpopulateSchedule(resp2[0].scheduleItems, resp2[0].highlanderTournaments, "eu");

        setCurWeek();

        showTab(curLeague, curWeek);
      },
      function(resp1, resp2) {
        alert('failure');
      }
    );
});