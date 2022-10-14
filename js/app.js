//==-- OBJECT NAMESPACE: apiRequest --==//
// Namespace for all logic related to requesting information from APIs.
const apiRequest = {};

apiRequest.apiKey = "4f71dc3a502c751a4c0164871f365fde"; // musixmatch account is under Vincent
apiRequest.apiURL = "https://api.musixmatch.com/ws/1.1/";

//==-- THIS IS USED TO SEARCH FOR SONG NAMES TO GET OUR TRACK IDS TO IMPLEMENT INTO THE GAME BECAUSE I HAVE GOOD AT GRAMMAR... ENGRISH --==//
apiRequest.getLyricsIDList = () => {
  $.ajax({
    url: `${apiRequest.apiURL}track.search`,
    type: "GET",
    dataType: "jsonp",
    jsonpCallback: "jsonp_callback",
    contentType: "application/json",
    data: {
      apikey: apiRequest.apiKey,
      format: "jsonp",
      callback: "jsonp_callback",
      f_has_lyrics: 1,
      f_is_instrumental: 0,
      // q_artist: "eminem",
      f_artist_id: 426,
      q_track: "the real slim shady", // REPLACE THIS TO FIND OUT THE TRACK_ID
      // f_track_release_group_first_release_date_max: 20180101,
      page_size: 100,
    },
  }).then((res) => {
    apiRequest.lyricsIDList = res.message.body.track_list;
    console.log(apiRequest.lyricsIDList); // RESULT OF THIS CONSOLE LOG GETS ADDED INTO compatibleSongs object in data.js
  });
};

apiRequest.getLyrics = (trackID) => {
  return $.ajax({
    url: `${apiRequest.apiURL}track.lyrics.get`,
    type: "GET",
    dataType: "jsonp",
    jsonpCallback: "jsonp_callback",
    contentType: "application/json",
    data: {
      apikey: apiRequest.apiKey,
      format: "jsonp",
      callback: "jsonp_callback",
      track_id: trackID,
    },
  });
};

apiRequest.getTrack = (trackID) => {
  return $.ajax({
    url: `${apiRequest.apiURL}track.get`,
    type: "GET",
    dataType: "jsonp",
    jsonpCallback: "jsonp_callback2",
    contentType: "application/json",
    data: {
      apikey: apiRequest.apiKey,
      format: "jsonp",
      callback: "jsonp_callback2",
      track_id: trackID,
    },
  });
};

//==-- OBJECT NAMESPACE: app --==//
// Stores logic behind behaviour of the entire app
const app = {};

app.printHTML = (id, tag, text) =>
  $(`#${id}`).append(`<${tag}>${text}</${tag}>`);

app.init = () => {
  $("form").on("submit", (event) => {
    event.preventDefault();
    game.answerCheck();
  });

  $("#startButton").on("click", () => {
    $("#splashPage").toggleClass("hide");
    $("#gamePage").toggleClass("hide");
    game.difficultyLevel = $("input[name=difficulty]:checked").val();
    game.startQuestion();
    game.startTimer();
  });

  $("#settingsButton").on("click", () => {
    $("#settingsPage").toggleClass("hide");
    $("#exitSettings").focus();
  });

  $("#exitSettings").on("click", () => {
    $("#settingsPage").toggleClass("hide");
    $("#settingsButton").focus();
  });

  $("#leaderboardButton").on("click", () => {
    $("#leaderboardPopup").toggleClass("hide");
    $("#exitLeaderboard").focus();

    const topFivePlayers = leaderboard.getTopFive();

    // console.log(topFivePlayers);

    topFivePlayers.forEach((entry, index) => {
      app.printHTML(
        "popup-entries",
        'p class="popup-entry"',
        `${index + 1}) ${entry[0]} (Score: ${entry[1]})`
      );
    });
  });

  $("#exitLeaderboard").on("click", () => {
    $("#popup-entries").empty();
    $("#leaderboardPopup").toggleClass("hide");
    $("#leaderboardButton").focus();
  });

  $("#hintButton").on("click", () => {
    if (game.currQuestion.length !== 0) {
      app.printHTML("lyrics", "p", game.currQuestion.shift());
    }
  });

  $("#passButton").on("click", () => {
    game.resetQuestion();
    game.startQuestion();
  });

  $("#exitButton").on("click", () => {
    game.endGame();
  });
};

$(() => {
  app.init();

  // Save the leaderboard on value updates
  leaderboard.db.on("value", (dbSnapshot) => {
    leaderboard.snapshot = dbSnapshot.val();
    // console.log(leaderboard.snapshot);
  });

  // For Development Purposes ONLY
  // apiRequest.getLyricsIDList();
});

// sound effect
function PlaySound(soundobj) {
  var thissound = document.getElementById(soundobj);
  thissound.play();
}

function StopSound(soundobj) {
  var thissound = document.getElementById(soundobj);
  thissound.pause();
  thissound.currentTime = 0;
}
