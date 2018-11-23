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

//== METHOD: startQuestion ==//
// Obtains a random track_id from questionLibrary object (which stores songs that are compatible with this game) and fires off the question logic
game.startQuestion = () => {
  game.currTrackID = game.getRandomSong(questionLibrary);
  game.getAnswer();
}

//== METHOD: getRandomSong ==//
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

//== METHOD: getQuestion ==//
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

//== METHOD: generateQuestion ==//
// Receives an array with elements made up of lyric lines and returns 3 lines of lyrics selected at random (not 3 random lines, but randomly select a line and return that line and 2 following lines)
game.generateQuestion = arrCleanLyrics => {
  const randomIndex = Math.floor(Math.random() * (arrCleanLyrics.length - 3));
  return arrCleanLyrics.slice(randomIndex, (randomIndex + 3));
}

//==-- METHOD: startTimer --==//
// Start the game timer!
// Called from #startButton on click event
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
      hintScoreReducer = -25;
      incorrectReducer = -10;
      break;
    case "normal":
      baseScore = 500;
      hintScoreReducer = -50;
      incorrectReducer = -20;
      break;
    case "hard":
      baseScore = 700;
      hintScoreReducer = -75;
      incorrectReducer = -30;
      break;
    default:
      alert("You managed to break the difficulty level AGAIN??? (updateScore)");
      break;
  }

  // For debugging purposes
  console.log(`Base Score: ${baseScore}`);
  console.log(`Revealed Hints: ${(game.currQuestion.length - 2)} x ${hintScoreReducer} = ${(hintScoreReducer * Math.abs(game.currQuestion.length - 2))}`);
  console.log(`Incorrect Attempts: ${game.currAttemptCount} x ${incorrectReducer} = ${(incorrectReducer * game.currAttemptCount)}`);
  console.log(`Current Question Score: ${baseScore + (hintScoreReducer * Math.abs(game.currQuestion.length - 2)) + (incorrectReducer * game.currAttemptCount)}`);

  // Update the total score
  game.totalScore += Math.max((baseScore + (hintScoreReducer * Math.abs(game.currQuestion.length - 2)) + (incorrectReducer * game.currAttemptCount)),0);

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
  // Reset values and clock
  game.resetQuestion();
  game.totalScore = 0;
  game.currTime = 0;
  game.displayTime();
}

game.endGame = () => {
  // Clear the interval
  clearInterval(game.counter);

  const playerName = prompt("Enter your name, you magical lyricist:") || "Wild Jigglypuff";

  // For debugging purposes
  console.log(`${playerName}'s total score is: ${game.totalScore}`);
  
  // FIREBASE STORAGE OF PLAYER SCORE
  const scoreEntry = {
    name: playerName,
    score: game.totalScore
  }
  
  leaderboard.db.push(scoreEntry);
  
  // Reset the game and then go back to the home page
  game.resetGame();

  $("#gamePage").toggleClass("hide");
  $("#splashPage").toggleClass("hide");
}