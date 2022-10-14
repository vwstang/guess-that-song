//==-- OBJECT NAMESPACE: compatibleSongs  --==//
// This object stores artist names as keys with values of arrays, which consist of track_ids used for musixmatch API call to get lyrics.
// This is required because the musixmatch API has data on live versions, covers, remixes, etc, which we don't want to pick up in the game, but no readily available way of filtering these out according to their API
const questionLibrary = {
  // Gotye: [
  //   15953433 // Somebody That I Used To Know
  // ],
  // 13958599
  "Ariana Grande": [
    160369747, // Thank u, next
    155480782, // God is a woman
    155480787, // No Tears Left To Cry
    // 124488135, // Side To Side
    155480786, // Breathin
  ],
  // 33491453
  Drake: [
    111790601, // Hotling Bling
    153434470, // God's Plan
    114292344, // One Dance
    152383631, // In My Feelings
    111790600, // Views
  ],
  // 259675
  // "Taylor Swift": [
  //   // 74443483, // Style
  //   // 74443482, // Blank Space
  //   // 17170438, // Fifteen
  //   // 74274886, // Shake It Off
  //   // 31326753 // I Knew You Were Trouble
  // ],
  // 118
  Queen: [
    // 33389569, // Somebody to Love
    159561884, // Bohemian Rhapsody
    // 85219179, // We Will Rock You
    // 77061562, // We Are The Champions
    31508972, // Another One Bites The Dust
  ],
  // 33491916
  "Justin Bieber": [
    // 99575547, // Sorry
    17957946, // Boyfriend
    // 99575546, // What do you mean?
    // 16103716, // Mistletoe
    // 32184425 // Baby
  ],
  // 346898
  Adele: [
    // 18470707, // Rolling in the Deep
    84213309, // Hello
    // 18470717, // Someone Like You
    // 18470711, // Set Fire To The Rain
    84213314, // Water Under The Bridge
  ],
  // 33111847
  "Ed Sheeran": [
    // 73109263, // Thinking Out Loud
    124985078, // Perfect
    124985077, // Shape Of You
    // 73109257, // Photograph
    124985075, // Castle On The Hill
  ],
  // 378462
  "Lady Gaga": [
    158988975, // Lady Gaga
    // 30971160, // Born This Way
    // 15288003, // Bad Romance
    115127174, // Perfect Illusion
    115073692, // Million Reasons
  ],
  // 18927
  Beyoncé: [
    // 31279093, // Halo
    32158732, // Crazy In Love
    // 30202781, // Irreplaceable
    35773884, // Drunk In Love
    // 53579779 // Single Ladies
  ],
  // 426
  Eminem: [
    // 31301158, // Not Afraid
    // 1809819, // Lose Yourself
    // 17141769, // Mockingbird
    157739274, // Killshot
    // 16916074 // The Real Slim Shady
  ],
};
