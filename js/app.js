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
      // q_artist: "eminem",
      f_artist_id: 426,
      q_track: "the real slim shady", // REPLACE THIS TO FIND OUT THE TRACK_ID
      // f_track_release_group_first_release_date_max: 20180101,
      page_size: 100
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
  difficultyLevel: $("input[name=difficulty]:checked").val()
};

game.startQuestion = () => {
  game.currTrackID = game.getRandomSong(questionLibrary);
  game.getAnswer();
}

// // Print current life to the DOM
// game.displayLife = () => {
//   $("#lives").empty();
//   app.printHTML("lives", "span", game.totalLives);
// }

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

//==-- METHOD: getRandomSong --==//
// Randomly select a song from the object passed in. Object passed in must consist of arrays.
// Called from game.startQuestion()
game.getRandomSong = objSongLibrary => {
  const keys = Object.keys(objSongLibrary);
  const randomIndex = Math.floor(Math.random() * keys.length);
  const artistSongList = objSongLibrary[keys[randomIndex]];
  return artistSongList[Math.floor(Math.random() * artistSongList.length)];
}

//==-- METHOD: getAnswer --==//
// Send AJAX request to musixmatch API with a track_id to obtain track information (i.e. song name and artist). When the request is completed, convert the response strings to regular expressions (performed in game.toRegEx()) and go get the question (performed in game.getQuestion()).
// Called from game.startQuestion()
game.getAnswer = () => {
  $.when(apiRequest.getTrack(game.currTrackID)).then(res => {
    // For debugging purposes
    console.log(`Artist: ${res.message.body.track.artist_name}, Song: ${res.message.body.track.track_name}`);
    
    // Convert the response strings to regular expressions
    game.currAnswerArtist = game.toRegEx(res.message.body.track.artist_name);
    game.currAnswerTrack = game.toRegEx(res.message.body.track.track_name);
    
    // Got answers? Good, go get the question now.
    game.getQuestion();
  });
}

//==-- METHOD: toRegEx --==//
// Converts a song name into a regular expression to allow for fuzzy check against user answers.
// Called from game.getAnswer()
game.toRegEx = strArtistOrSong => {
  // Normalize the string by converting to lowercase so char codes are simpler to work with
  const lowercaseString = strArtistOrSong.toLowerCase();
  
  // Character code constants
  const openBracket = 40;
  const lowercaseA = 97;
  const lowercaseZ = 122;

  // The accumulator variable
  let strRegEx = "";

  // First, edit the string so non-alphabet characters within the song/artist name are optional in the regex (i.e. ?)
  for (let i = 0; i < lowercaseString.length; i++) {
    if (lowercaseString.charCodeAt(i) === openBracket) {
      i = lowercaseString.length; // If the current character in the string is a smooth open boi, exit the loop by setting iterator to the string length.
    } else if (lowercaseString.charCodeAt(i) >= lowercaseA && lowercaseString.charCodeAt(i) <= lowercaseZ) {
      strRegEx += lowercaseString[i];
    } else {
      strRegEx += lowercaseString[i] + "?";
    }
  }

  // Second, trim the string for any instances of "ft." or "feat."
  const featIndex = strRegEx.indexOf("feat.");
  const ftIndex = strRegEx.indexOf("ft.");
  const nonExistent = -1;

  if (featIndex !== nonExistent) {
    strRegEx = strRegEx.substring(0, featIndex);
  } else if (ftIndex !== nonExistent) {
    strRegEx = strRegEx.substring(0, ftIndex);
  }

  // Lastly, return the string as a Regular Expression that is case insensitive.
  return new RegExp(`^${strRegEx}$`, "i");
}

//==-- METHOD: getQuestion --==//
// Make an AJAX request to get the lyrics for the track_id passed to the API. When that is completed, then clean the response string up (because we are using the API for free, it includes unwanted text in the response string, so we need to trim those out for the game).
// Called from game.getAnswer()
game.getQuestion = () => {
  $.when(apiRequest.getLyrics(game.currTrackID)).then(res => {
    // Select the lyrics within the response from the AJAX request, convert it into an array (by splitting the string up by new line characters), clean up the lyrics for API disclaimer text (performed in game.cleanLyrics()) and store it into the game object's currLyrics property.
    game.currLyrics = game.cleanLyrics(res.message.body.lyrics.lyrics_body.split("\n"));
    
    // Next step is to randomly pick three lines within the full currLyrics and store them into a separate array (performed in game.generateQuestion()).
    game.currQuestion = game.generateQuestion(game.currLyrics);
    
    // FOR DEBUGGING PURPOSES
    console.log(game.currLyrics);
    console.log(game.currQuestion);

    // Print one line of the question lyrics to the DOM.
    app.printHTML("lyrics", "p", game.currQuestion.shift());
  });
}

//==-- METHOD: startTimer --==//
// Start the game timer!
// Called from game.startGame()
game.startTimer = () => {
  // Set the game timer depending on the difficulty level. Default case should NEVER be run.
  switch (game.difficultyLevel) {
    case "easy":
      game.currTime = 90;
      break;
    case "normal":
      game.currTime = 60;
      break;
    case "hard":
      game.currTime = 30;
      break;
    default:
      alert("How did you manage to break the difficulty setting...");
      break;
  }
  
  game.displayTime();
  // Set the timer to a variable so that clearInterval() can be called when the time runs out or if the user exits the game.
  game.counter = setInterval(game.timer, 1000);
}

//==-- METHOD: displayTime --==//
// Display the time on the DOM.
// Called from game.startTimer()
game.displayTime = () => {
  let strTime;

  if (game.currTime >= 60) {
    if (game.currTime % 60 < 10) {
      strTime = `${Math.floor(game.currTime / 60)}:0${game.currTime % 60}`;
    } else {
      strTime = `${Math.floor(game.currTime / 60)}:${game.currTime % 60}`;
    }
  } else if (game.currTime < 10) {
    strTime = `0:0${game.currTime}`
  } else {
    strTime = `0:${game.currTime}`
  }

  $("#timer").empty();
  app.printHTML("timer", "span", strTime);
  
  // For debugging purposes
  console.log(game.currTime);
}

//==-- METHOD: timer --==//
// Actual timer function itself.
// Set to game.counter
game.timer = () => {
  if (game.currTime <= 0) {
    game.endGame();
  } else {
    game.currTime--;
  }
  game.displayTime();
}

//==-- METHOD: answerCheck --==//

game.answerCheck = () => {
  const userArtist = $("#artistName").val();
  const userTrack = $("#songTitle").val();
  if (game.currAnswerArtist.test(userArtist) && game.currAnswerTrack.test(userTrack)) {
    console.log("Correct!"); // 
    // RUN UPDATE SCORE METHOD
    game.updateScore();
    game.resetQuestion();
    game.startQuestion();
  } else {
    console.log("WRONG!");
    game.currAttemptCount++;
    console.log(game.currAttemptCount);
    game.updateStatus();
  }
}

game.updateStatus = () => {
  $("#status").empty();
  app.printHTML("status", "p", "Wrong, try again!");
}

game.updateScore = () => {
  let baseScore, timeScoreBonus, hintScoreReducer, incorrectReducer;
  
  switch (game.difficultyLevel) {
    case "easy":
      baseScore = 300;
      timeScoreBonus = 5;
      hintScoreReducer = -25;
      incorrectReducer = -10;
      break;
    case "normal":
      baseScore = 500;
      timeScoreBonus = 10;
      hintScoreReducer = -50;
      incorrectReducer = -20;
      break;
    case "hard":
      baseScore = 700;
      timeScoreBonus = 15;
      hintScoreReducer = -75;
      incorrectReducer = -30;
      break;
    default:
      alert("You managed to break the difficulty level AGAIN??? (updateScore)");
      break;
  }

  // For debugging purposes
  console.log(`Base Score: ${baseScore}`);
  console.log(`Time Bonus: ${game.currTime} x ${timeScoreBonus} = ${(timeScoreBonus * game.currTime)}`);
  console.log(`Revealed Hints: ${(game.currQuestion.length - 2)} x ${hintScoreReducer} = ${(hintScoreReducer * Math.abs(game.currQuestion.length - 2))}`);
  console.log(`Incorrect Attempts: ${game.currAttemptCount} x ${incorrectReducer} = ${(incorrectReducer * game.currAttemptCount)}`);
  console.log(`Current Question Score: ${baseScore + (timeScoreBonus * game.currTime) + (hintScoreReducer * Math.abs(game.currQuestion.length - 2)) + (incorrectReducer * game.currAttemptCount)}`);

  // Update the total score
  game.totalScore += baseScore + (timeScoreBonus * game.currTime) + (hintScoreReducer * Math.abs(game.currQuestion.length - 2)) + (incorrectReducer * game.currAttemptCount);

  // Debugging purposes
  console.log(`Current total score: ${game.totalScore}`);
}

game.resetQuestion = () => {
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
}

game.resetGame = () => {
  // Clear the interval
  clearInterval(game.counter);
  
  // Reset values and clock
  game.resetQuestion();
  game.totalScore = 0;
  game.currTime = 0;
  game.displayTime();
}

game.endGame = () => {
  alert("DING DING DING! Time's up!");
  const playerName = prompt("Great job! What's your name?");
  alert(`${playerName}'s total score is: ${game.totalScore}`); // FIREBASE STORAGE OF PLAYER SCORE
  game.resetGame();
  $("#gamePage").toggleClass("hide");
  $("#splashPage").toggleClass("hide");
}

//==-- OBJECT NAMESPACE: app --==//
// Stores logic behind behaviour of the entire app
const app = {};

app.printHTML = (id, tag, text) => $(`#${id}`).append(`<${tag}>${text}</${tag}>`);


app.init = () => {
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
    game.difficultyLevel = $("input[name=difficulty]:checked").val();
    game.startQuestion();
    game.startTimer();
  });

  $("#passButton").on("click", () => {
    game.resetQuestion();
    game.startQuestion();
  });

  $("#exitButton").on("click", () => {
    game.endGame();
  });
}

$(() => {
  app.init();
  // apiRequest.getLyricsIDList(); // FOR CREATING THE QUESTIONLIBRARY
});

