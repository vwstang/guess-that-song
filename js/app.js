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
    jsonpCallback: 'jsonp_callback',
    contentType: 'application/json',
    data: {
      apikey: apiRequest.apiKey,
      format: "jsonp",
      callback: "jsonp_callback",
      f_has_lyrics: 1,
      f_is_instrumental: 0,
      // q_artist: "Adele",
      f_artist_id: 346898,
      q_track: "Someone Like You" // REPLACE THIS TO FIND OUT THE TRACK_ID
    }
  }).then(res => {
    apiRequest.lyricsIDList = res.message.body.track_list;
    console.log(apiRequest.lyricsIDList); // RESULT OF THIS CONSOLE LOG GETS ADDED INTO compatibleSongs object in data.js
  });
}


apiRequest.getLyrics = trackID => {
  return $.ajax({
    url: `${apiRequest.apiURL}track.lyrics.get`,
    type: "GET",
    dataType: "jsonp",
    jsonpCallback: 'jsonp_callback',
    contentType: 'application/json',
    data: {
      apikey: apiRequest.apiKey,
      format: "jsonp",
      callback: "jsonp_callback",
      track_id: trackID
    }
  });
}

apiRequest.getTrack = trackID => {
  return $.ajax({
    url: `${apiRequest.apiURL}track.get`,
    type: "GET",
    dataType: "jsonp",
    jsonpCallback: 'jsonp_callback2',
    contentType: 'application/json',
    data: {
      apikey: apiRequest.apiKey,
      format: "jsonp",
      callback: "jsonp_callback2",
      track_id: trackID
    }
  });
}

//==--  --==//
const app = {};

app.printHTML = (id, tag, text) => $(`#${id}`).append(`<${tag}>${text}</${tag}>`);

//==-- OBJECT NAMESPACE: app --==//
// Namespace for all logic related to the "Finish the Lyrics" app itself.
const game = {
  currTrackID: 0,
  currLyrics: [],
  currQuestion: [],
  currAnswerArtist: "",
  currAnswerTrack: "",
  currAttemptCount: 0,
  currTime: 0,
  totalScore: 0,
  totalLives: 3
};

// Print current life to the DOM
game.displayLife = () => {
  $("#lives").empty();
  app.printHTML("lives", "span", game.totalLives);
}

//== METHOD: cleanLyrics ==//
// Iterates through the lyrics result array and removes unnecessary elements like blank spaces and the "NON COMMERICIAL USE DISCLAIMER" and returns the cleaned array
game.cleanLyrics = arrLyrics => {
  let tempArray = [];
  for (let i = 0; i < arrLyrics.length; i++) {
    if (arrLyrics[i] === "...") {
      i = arrLyrics.length;
    } else if (arrLyrics[i] === "") {
      i = i;
    } else {
      tempArray.push(arrLyrics[i]);
    }
  }
  return tempArray;
}

// LYRIC RANDOMIZER
game.generateQuestion = arrCleanLyrics => {
  const randomIndex = Math.floor(Math.random() * (arrCleanLyrics.length - 3));
  return arrCleanLyrics.slice(randomIndex, (randomIndex + 3));
}

// SONG RANDOMIZER
game.getRandomSong = objSongLibrary => {
  const keys = Object.keys(objSongLibrary);
  const randomIndex = Math.floor(Math.random() * keys.length);
  const artistSongList = objSongLibrary[keys[randomIndex]];
  return artistSongList[Math.floor(Math.random() * artistSongList.length)];
}

game.getAnswer = () => {
  $.when(apiRequest.getTrack(game.currTrackID)).then(res => {
    console.log(`Artist: ${res.message.body.track.artist_name}, Song: ${res.message.body.track.track_name}`);
    game.currAnswerArtist = game.toRegEx(res.message.body.track.artist_name);
    game.currAnswerTrack = game.toRegEx(res.message.body.track.track_name);
    game.getQuestion();
  });
}

//==-- METHOD: toRegEx --==//
// Converts a song name into a regular expression to allow for fuzzy check against user answers.
game.toRegEx = songName => {
  const normalizeName = songName.toLowerCase();
  let strRegEx = "";

  // First, edit the string so non-alphabet characters within the song/artist name are optional in the regex (i.e. ?)
  for (let i = 0; i < normalizeName.length; i++) {
    if (normalizeName.charCodeAt(i) === 40) {
      i = normalizeName.length; // If the current character in the string is a smooth open boi, exit the loop by setting iterator to the string length.
    } else if (normalizeName.charCodeAt(i) >= 97 && normalizeName.charCodeAt(i) <= 122) {
      strRegEx += normalizeName[i];
    } else {
      strRegEx += normalizeName[i] + "?";
    }
  }

  // Second, trim the string for any instances of "ft." or "feat."
  const featIndex = strRegEx.indexOf("feat.");
  const ftIndex = strRegEx.indexOf("ft.");

  if (featIndex !== -1) {
    strRegEx = strRegEx.substring(0, featIndex);
  } else if (ftIndex !== -1) {
    strRegEx = strRegEx.substring(0, ftIndex);
  }

  // Lastly, return the string as a Regular Expression that is case insensitive
  return new RegExp(`^${strRegEx}$`, "i");
}

game.getQuestion = () => {
  $.when(apiRequest.getLyrics(game.currTrackID)).then(res => {
    game.currLyrics = game.cleanLyrics(res.message.body.lyrics.lyrics_body.split("\n")); // Selects the lyrics_body property within the result from getLyrics, converts it into an array, and stores the array into game.currLyrics.
    console.log(game.currLyrics); // THIS WORKS
    // console.log(game.genQuestion(game.currLyrics)); // THIS ALSO WORKS
    game.currQuestion = game.generateQuestion(game.currLyrics);
    console.log(game.currQuestion);
    // Next step is to randomly pick three lines within the full currLyrics and store them into a separate array OR the same array
    app.printHTML("lyrics", "p", game.currQuestion.shift());
    // START THE TIMER
    game.startTimer();
  });
}

game.startTimer = () => {
  game.currTime = 30; // This can be changed based on difficulty
  game.counter = setInterval(game.timer, 1000);
}

game.timer = function () {
  let displayTime;
  game.currTime < 10 ? displayTime = `0:0${game.currTime}` : displayTime = `0:${game.currTime}`;
  $("#timer").empty();
  app.printHTML("timer", "span", displayTime);
  console.log(game.currTime);
  if (game.currTime <= 0) {
    game.totalLives--;
    game.reset();
    alert("Chill out. Keep on truckin\'"); // This is where we will show a pop up of whether they got the answer correct or then show the correct answer
    game.start();
  } else {
    game.currTime--;
  }
};

game.answerCheck = () => {
  const userArtist = $("#artistName").val();
  const userTrack = $("#songTitle").val();
  if (game.currAnswerArtist.test(userArtist) && game.currAnswerTrack.test(userTrack)) {
    console.log("Correct!"); // 
    // RUN UPDATE SCORE METHOD
    game.updateScore();
    game.reset();
    game.start();
  } else {
    console.log("WRONG!"); // 
    game.currAttemptCount++;
    console.log(game.currAttemptCount);
    // Want to display something on the page that says "Wrong sucka"
    app.printHTML("status", "p", "Wrong, try again!");
  }
}

game.updateScore = () => {
  const baseScore = 500;
  const timeScoreBonus = 10; // +10 points for every second left on the clock
  const hintScoreReducer = -50; // -50 points for every hint revealed
  const incorrectReducer = -25; // -25 points for ever incorrect attempt made

  // Update the total score
  game.totalScore += baseScore + (hintScoreReducer * Math.abs(game.currQuestion.length - 2)) + (incorrectReducer * game.currAttemptCount) + (timeScoreBonus * game.currTime);

  // Debugging purposes
  console.log(game.totalScore);
}

game.reset = () => {
  // Clear the interval
  clearInterval(game.counter);

  // Empty the HTML tags that show user input values, status and hints!
  $("#lyrics").empty();
  $("#status").empty();
  $("#artistName").val("");
  $("#songTitle").val("");

  // Reset values
  game.currTrackID = 0;
  game.currLyrics = [];
  game.currQuestion = [];
  game.currAnswerArtist = "";
  game.currAnswerTrack = "";
  game.currAttemptCount = 0;
  game.currTime = 0;
}

game.start = () => {
  game.currTrackID = game.getRandomSong(questionLibrary);
  game.getAnswer();
}

game.init = () => {
  $("#hintButton").on("click", () => {
    if (game.currQuestion.length !== 0) {
      app.printHTML("lyrics", "p", game.currQuestion.shift());
    }
  });

  $("form").on("submit", event => {
    event.preventDefault();
    game.answerCheck();
  });

  $("#startButton").on("click", () => {
    $("#splashPage").toggleClass("hide");
    $("#gamePage").toggleClass("hide");
    game.start();
  });

  $("#exitButton").on("click", () => {
    game.reset();
    $("#gamePage").toggleClass("hide");
    $("#splashPage").toggleClass("hide");
  });
}

$(() => {
  game.init();
});

