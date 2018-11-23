//==-- INITIALIZE FIREBASE --==//
const config = {
  apiKey: "AIzaSyAhF6Jss9-4LtZV3xmGodqeJEPR9woumVA",
  authDomain: "guess-that-song-74bf9.firebaseapp.com",
  databaseURL: "https://guess-that-song-74bf9.firebaseio.com",
  projectId: "guess-that-song-74bf9",
  storageBucket: "guess-that-song-74bf9.appspot.com",
  messagingSenderId: "206951474105"
};

firebase.initializeApp(config);

//==-- OBJECT NAMESPACE: Leaderboard --==//
// Leaderboard related things!
const leaderboard = {
  db: firebase.database().ref(),
  snapshot: [],
  topFive: []
};

leaderboard.getTopFive = () => {
  // Make a new array 
  let arrSnapshot = [];

  for (let entry in leaderboard.snapshot) {
    arrSnapshot.push([leaderboard.snapshot[entry].name, leaderboard.snapshot[entry].score]);
  }

  // Sort the array in descending order
  arrSnapshot.sort((a, b) => b[1] - a[1]);
  
  // Return the top 5 scores and their player names
  return arrSnapshot.slice(0, 5);
}

