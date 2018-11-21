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
      q_track: "thank u next" // REPLACE THIS TO FIND OUT THE TRACK_ID
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

//==--  --==//
const app = {};

app.printHTML = (id, tag, text) => $(`#${id}`).append(`<${tag}>${text}</${tag}>`);


//==-- OBJECT NAMESPACE: app --==//
// Namespace for all logic related to the "Finish the Lyrics" app itself.
const game = {};

// Default values set for debugging purposes because asynchronous
game.currLyrics = ["I HAVEN'T LOADED YET"];
game.currQuestion = ["I ALSO HAVEN'T LOADED YET"];

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

// RANDOMIZER
game.generateQuestion = arrCleanLyrics => {
  const randomIndex = Math.floor(Math.random() * (arrCleanLyrics.length - 3));
  return arrCleanLyrics.slice(randomIndex, (randomIndex + 3));
}

game.getQuestion = () => {
  // This should be replaced with a function that randomly gets a track ID from data.js compatibleSongs
  const getRandomTrackID = 160369747;
  
  $.when(apiRequest.getLyrics(getRandomTrackID)).then(res => {
    game.currLyrics = game.cleanLyrics(res.message.body.lyrics.lyrics_body.split("\n")); // Selects the lyrics_body property within the result from getLyrics, converts it into an array, and stores the array into game.currLyrics.
    console.log(game.currLyrics); // THIS WORKS
    // console.log(game.genQuestion(game.currLyrics)); // THIS ALSO WORKS
    game.currQuestion = game.generateQuestion(game.currLyrics);
    console.log(game.currQuestion);
    // Next step is to randomly pick three lines within the full currLyrics and store them into a separate array OR the same array
    app.printHTML("lyrics", "p", game.currQuestion.shift());
  });
}

game.init = () => {
  $("#hintButton").on("click", () => {
    if (game.currQuestion.length !== 0) {
      app.printHTML("lyrics", "p", game.currQuestion.shift());
    }
  });
  
  game.getQuestion();
}

$(() => {
  game.init();
});

