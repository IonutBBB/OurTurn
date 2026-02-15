export interface TuneRound {
  lyricSnippet: string;
  melodicHint: string;
  options: string[];
  correctIndex: number;
  funFact: string;
}

export interface NameThatTuneContent {
  rounds: TuneRound[];
}

export const NAME_THAT_TUNE_CONTENT: NameThatTuneContent[] = [
  // Set 1 — Classic Nursery & Folk
  {
    rounds: [
      {
        lyricSnippet: 'Twinkle, twinkle, little...',
        melodicHint: 'Da da da da da da daaa...',
        options: ['Star', 'Moon', 'Light'],
        correctIndex: 0,
        funFact: 'This song was first published as a poem by Jane Taylor in 1806.',
      },
      {
        lyricSnippet: 'Happy birthday to you, happy birthday to...',
        melodicHint: 'Da da da daaaa, da da da daaaa...',
        options: ['You', 'Me', 'Us'],
        correctIndex: 0,
        funFact: 'Happy Birthday is one of the most recognised songs in the world.',
      },
      {
        lyricSnippet: 'Row, row, row your boat, gently down the...',
        melodicHint: 'Da da da da daaaa, da da da da daaaa...',
        options: ['Stream', 'River', 'Lake'],
        correctIndex: 0,
        funFact: 'This song is often sung as a round, with groups starting at different times.',
      },
    ],
  },
  // Set 2 — Timeless Classics
  {
    rounds: [
      {
        lyricSnippet: 'I see trees of green, red roses too...',
        melodicHint: 'Da da daaa da da, da da da daaa...',
        options: ['What a Wonderful World', 'Over the Rainbow', 'Moon River'],
        correctIndex: 0,
        funFact: 'Louis Armstrong recorded this classic in 1967.',
      },
      {
        lyricSnippet: 'Somewhere over the rainbow, way up...',
        melodicHint: 'Da da daaaa da da da da, da da...',
        options: ['High', 'There', 'Blue'],
        correctIndex: 0,
        funFact: 'Judy Garland sang this in The Wizard of Oz in 1939.',
      },
      {
        lyricSnippet: 'Yesterday, all my troubles seemed so far...',
        melodicHint: 'Da da daaaa, da da da da da da da...',
        options: ['Away', 'Gone', 'Behind'],
        correctIndex: 0,
        funFact: 'Paul McCartney wrote this Beatles song — one of the most covered songs ever.',
      },
    ],
  },
  // Set 3 — Sing-Along Favourites
  {
    rounds: [
      {
        lyricSnippet: 'You are my sunshine, my only...',
        melodicHint: 'Da da da da daaa, da da da...',
        options: ['Sunshine', 'Darling', 'Treasure'],
        correctIndex: 0,
        funFact: 'This song was first recorded in 1939 and has been a favourite ever since.',
      },
      {
        lyricSnippet: 'Daisy, Daisy, give me your answer...',
        melodicHint: 'Da da, da da, da da da da da...',
        options: ['Do', 'True', 'Now'],
        correctIndex: 0,
        funFact: 'Written in 1892, this was one of the first songs played by a computer.',
      },
      {
        lyricSnippet: 'Pack up your troubles in your old kit...',
        melodicHint: 'Da da da da da da da da da...',
        options: ['Bag', 'Box', 'Case'],
        correctIndex: 0,
        funFact: 'This cheerful song became popular during the First World War.',
      },
    ],
  },
  // Set 4 — Christmas Songs
  {
    rounds: [
      {
        lyricSnippet: 'Jingle bells, jingle bells, jingle all the...',
        melodicHint: 'Da da da, da da da, da da da da daaa...',
        options: ['Way', 'Day', 'Night'],
        correctIndex: 0,
        funFact: 'Jingle Bells was originally written for Thanksgiving in 1857.',
      },
      {
        lyricSnippet: 'Silent night, holy night, all is calm, all is...',
        melodicHint: 'Da da daaa, da da daaa, da da da, da da...',
        options: ['Bright', 'Right', 'Light'],
        correctIndex: 0,
        funFact: 'Silent Night was first performed in Austria in 1818.',
      },
      {
        lyricSnippet: 'We wish you a merry Christmas, we wish you a merry...',
        melodicHint: 'Da da da da da da da, da da da da da da...',
        options: ['Christmas', 'New Year', 'Holiday'],
        correctIndex: 0,
        funFact: 'This English carol dates back to the 16th century.',
      },
    ],
  },
  // Set 5 — 1950s & 60s Hits
  {
    rounds: [
      {
        lyricSnippet: 'Rock around the clock tonight...',
        melodicHint: 'Da da da da da da daaaa...',
        options: ['Rock Around the Clock', 'Jailhouse Rock', 'Blue Suede Shoes'],
        correctIndex: 0,
        funFact: 'Bill Haley & His Comets made this a worldwide hit in 1955.',
      },
      {
        lyricSnippet: 'Love me tender, love me...',
        melodicHint: 'Da da da da, da da...',
        options: ['Sweet', 'True', 'Dear'],
        correctIndex: 1,
        funFact: 'Elvis Presley released this song in 1956.',
      },
      {
        lyricSnippet: 'Moon river, wider than a...',
        melodicHint: 'Da da daaa, da da da da...',
        options: ['Mile', 'River', 'Dream'],
        correctIndex: 0,
        funFact: 'Audrey Hepburn sang this in Breakfast at Tiffany\'s (1961).',
      },
    ],
  },
  // Set 6 — British Classics
  {
    rounds: [
      {
        lyricSnippet: 'Land of hope and glory, mother of the...',
        melodicHint: 'Da da da da da da da, da da da da...',
        options: ['Free', 'Brave', 'Sea'],
        correctIndex: 0,
        funFact: 'This patriotic song is a favourite at the Last Night of the Proms.',
      },
      {
        lyricSnippet: 'Rule, Britannia! Britannia, rule the...',
        melodicHint: 'Da, da da da! Da da da, da da da...',
        options: ['Waves', 'Seas', 'World'],
        correctIndex: 0,
        funFact: 'Written in 1740, it became one of Britain\'s best-known songs.',
      },
      {
        lyricSnippet: 'It\'s a long way to Tipperary, it\'s a long way to...',
        melodicHint: 'Da da da da da da da da, da da da da da...',
        options: ['Go', 'Know', 'Home'],
        correctIndex: 0,
        funFact: 'British soldiers sang this marching song during World War I.',
      },
    ],
  },
  // Set 7 — Musical Theatre
  {
    rounds: [
      {
        lyricSnippet: 'The hills are alive with the sound of...',
        melodicHint: 'Da da da da da da da da da da...',
        options: ['Music', 'Singing', 'Nature'],
        correctIndex: 0,
        funFact: 'Julie Andrews sang this in The Sound of Music (1965).',
      },
      {
        lyricSnippet: 'Raindrops on roses and whiskers on...',
        melodicHint: 'Da da da da da da da da da da...',
        options: ['Kittens', 'Mittens', 'Children'],
        correctIndex: 0,
        funFact: 'My Favourite Things is also from The Sound of Music.',
      },
      {
        lyricSnippet: 'Supercalifragilisticexpiali...',
        melodicHint: 'Da da da da da da da da da da da da...',
        options: ['Docious', 'Gotious', 'Locious'],
        correctIndex: 0,
        funFact: 'This tongue-twister comes from Mary Poppins (1964).',
      },
    ],
  },
  // Set 8 — Wartime Songs
  {
    rounds: [
      {
        lyricSnippet: 'We\'ll meet again, don\'t know where, don\'t know...',
        melodicHint: 'Da da da da daaa, da da da, da da...',
        options: ['When', 'How', 'Why'],
        correctIndex: 0,
        funFact: 'Vera Lynn became the Forces\' Sweetheart with this song in 1939.',
      },
      {
        lyricSnippet: 'There\'ll be bluebirds over the white cliffs of...',
        melodicHint: 'Da da da da da da da da da da da...',
        options: ['Dover', 'England', 'Home'],
        correctIndex: 0,
        funFact: 'Another Vera Lynn classic that brought hope during wartime.',
      },
      {
        lyricSnippet: 'Run, rabbit, run, rabbit, run, run...',
        melodicHint: 'Da, da da, da, da da, da, da...',
        options: ['Run', 'Go', 'Fast'],
        correctIndex: 0,
        funFact: 'This cheerful wartime song helped keep spirits high.',
      },
    ],
  },
  // Set 9 — Hymns & Spirituals
  {
    rounds: [
      {
        lyricSnippet: 'Amazing grace, how sweet the...',
        melodicHint: 'Da da da daaa, da da da...',
        options: ['Sound', 'Song', 'Word'],
        correctIndex: 0,
        funFact: 'Written by John Newton in 1772, this remains one of the most beloved hymns.',
      },
      {
        lyricSnippet: 'All things bright and beautiful, all creatures great and...',
        melodicHint: 'Da da da da da da da, da da da da da da...',
        options: ['Small', 'Tall', 'All'],
        correctIndex: 0,
        funFact: 'This hymn was written by Cecil Frances Alexander in 1848.',
      },
      {
        lyricSnippet: 'He\'s got the whole world in His...',
        melodicHint: 'Da da da da da da da da da...',
        options: ['Hands', 'Arms', 'Heart'],
        correctIndex: 0,
        funFact: 'This spiritual became popular worldwide in the 1950s.',
      },
    ],
  },
  // Set 10 — Dance Hall
  {
    rounds: [
      {
        lyricSnippet: 'Que sera, sera, whatever will be, will...',
        melodicHint: 'Da da da, da da, da da da da, da...',
        options: ['Be', 'See', 'Free'],
        correctIndex: 0,
        funFact: 'Doris Day sang this in the 1956 Alfred Hitchcock film The Man Who Knew Too Much.',
      },
      {
        lyricSnippet: 'Fly me to the moon, let me play among the...',
        melodicHint: 'Da da da da da, da da da da da da...',
        options: ['Stars', 'Clouds', 'Trees'],
        correctIndex: 0,
        funFact: 'Frank Sinatra\'s version became linked to the Apollo space missions.',
      },
      {
        lyricSnippet: 'Cheek to cheek, I\'m in heaven...',
        melodicHint: 'Da da da daaa, da da da da...',
        options: ['Heaven', 'Love', 'Peace'],
        correctIndex: 0,
        funFact: 'Irving Berlin wrote this classic, famously performed by Fred Astaire.',
      },
    ],
  },
  // Set 11 — 1970s Sing-Alongs
  {
    rounds: [
      {
        lyricSnippet: 'You\'ll never walk...',
        melodicHint: 'Da da da da...',
        options: ['Alone', 'Away', 'Home'],
        correctIndex: 0,
        funFact: 'Originally from the musical Carousel, it became a football anthem.',
      },
      {
        lyricSnippet: 'Dancing queen, young and sweet, only...',
        melodicHint: 'Da da da, da da da, da da...',
        options: ['Seventeen', 'Fifteen', 'Nineteen'],
        correctIndex: 0,
        funFact: 'ABBA released this worldwide hit in 1976.',
      },
      {
        lyricSnippet: 'Bohemian Rhapsody... is this the real life? Is this just...',
        melodicHint: 'Da da da da da da? Da da da...',
        options: ['Fantasy', 'A dream', 'Make-believe'],
        correctIndex: 0,
        funFact: 'Queen\'s epic song was number one for nine weeks in 1975.',
      },
    ],
  },
  // Set 12 — Love Songs
  {
    rounds: [
      {
        lyricSnippet: 'When I fall in love, it will be...',
        melodicHint: 'Da da da da da, da da da...',
        options: ['Forever', 'Always', 'True'],
        correctIndex: 0,
        funFact: 'Nat King Cole made this romantic ballad famous in 1957.',
      },
      {
        lyricSnippet: 'Unforgettable, that\'s what you...',
        melodicHint: 'Da da da da da, da da da da...',
        options: ['Are', 'Were', 'Do'],
        correctIndex: 0,
        funFact: 'Another Nat King Cole classic — his daughter Natalie later recorded a duet version.',
      },
      {
        lyricSnippet: 'Can\'t help falling in love with...',
        melodicHint: 'Da da da da da da da da...',
        options: ['You', 'Her', 'Me'],
        correctIndex: 0,
        funFact: 'Elvis Presley sang this gentle ballad in the 1961 film Blue Hawaii.',
      },
    ],
  },
  // Set 13 — Children's Favourites
  {
    rounds: [
      {
        lyricSnippet: 'Old MacDonald had a...',
        melodicHint: 'Da da da da da da...',
        options: ['Farm', 'House', 'Dog'],
        correctIndex: 0,
        funFact: 'This song has been popular with children since the early 1700s.',
      },
      {
        lyricSnippet: 'Baa, baa, black sheep, have you any...',
        melodicHint: 'Da, da, da da, da da da da...',
        options: ['Wool', 'Milk', 'Hay'],
        correctIndex: 0,
        funFact: 'This nursery rhyme dates back to at least 1731.',
      },
      {
        lyricSnippet: 'London Bridge is falling...',
        melodicHint: 'Da da da da da da...',
        options: ['Down', 'Apart', 'Over'],
        correctIndex: 0,
        funFact: 'This rhyme may date back to medieval times.',
      },
    ],
  },
  // Set 14 — Crooners
  {
    rounds: [
      {
        lyricSnippet: 'Strangers in the night, exchanging...',
        melodicHint: 'Da da da da da, da da da...',
        options: ['Glances', 'Dances', 'Chances'],
        correctIndex: 0,
        funFact: 'Frank Sinatra won a Grammy for this 1966 hit.',
      },
      {
        lyricSnippet: 'My way... and now, the end is...',
        melodicHint: 'Da da... da da, da da da...',
        options: ['Near', 'Here', 'Clear'],
        correctIndex: 0,
        funFact: 'Sinatra\'s My Way became one of the most popular songs of all time.',
      },
      {
        lyricSnippet: 'Mack the knife... oh, the shark, babe, has such...',
        melodicHint: 'Da da da da... da, da da, da, da da...',
        options: ['Teeth', 'Eyes', 'Charm'],
        correctIndex: 0,
        funFact: 'Bobby Darin\'s 1959 version was a massive hit.',
      },
    ],
  },
  // Set 15 — Sea Shanties & Folk
  {
    rounds: [
      {
        lyricSnippet: 'What shall we do with the drunken...',
        melodicHint: 'Da da da da da da da da da...',
        options: ['Sailor', 'Captain', 'Pirate'],
        correctIndex: 0,
        funFact: 'This traditional sea shanty has been sung for hundreds of years.',
      },
      {
        lyricSnippet: 'Greensleeves was all my joy, Greensleeves was my...',
        melodicHint: 'Da da da da da da da, da da da da da...',
        options: ['Delight', 'Heart', 'Love'],
        correctIndex: 0,
        funFact: 'This beautiful melody dates back to the 16th century.',
      },
      {
        lyricSnippet: 'My bonnie lies over the ocean, my bonnie lies over the...',
        melodicHint: 'Da da da da da da da da, da da da da da da da...',
        options: ['Sea', 'Shore', 'Land'],
        correctIndex: 0,
        funFact: 'This Scottish folk song has been popular since the 1800s.',
      },
    ],
  },
  // Set 16 — Motown
  {
    rounds: [
      {
        lyricSnippet: 'Ain\'t no mountain high enough, ain\'t no valley...',
        melodicHint: 'Da da da da da da da, da da da da...',
        options: ['Low enough', 'Deep enough', 'Wide enough'],
        correctIndex: 0,
        funFact: 'Marvin Gaye and Tammi Terrell recorded this Motown classic in 1967.',
      },
      {
        lyricSnippet: 'I heard it through the...',
        melodicHint: 'Da da da da da da...',
        options: ['Grapevine', 'Telephone', 'Window'],
        correctIndex: 0,
        funFact: 'Marvin Gaye\'s version topped the charts for seven weeks in 1968.',
      },
      {
        lyricSnippet: 'My girl, my girl, talking \'bout my...',
        melodicHint: 'Da da, da da, da da da da...',
        options: ['Girl', 'Love', 'Heart'],
        correctIndex: 0,
        funFact: 'The Temptations released this feel-good Motown hit in 1964.',
      },
    ],
  },
  // Set 17 — Swing Era
  {
    rounds: [
      {
        lyricSnippet: 'In the mood... ba da da da da...',
        melodicHint: 'Da da daaa... da da da da da...',
        options: ['In the Mood', 'Sing Sing Sing', 'Take Five'],
        correctIndex: 0,
        funFact: 'Glenn Miller\'s 1939 hit is one of the most famous swing tunes.',
      },
      {
        lyricSnippet: 'Don\'t sit under the apple tree with anyone else but...',
        melodicHint: 'Da da da da da da da da da da da da da...',
        options: ['Me', 'You', 'Him'],
        correctIndex: 0,
        funFact: 'The Andrews Sisters made this a wartime classic.',
      },
      {
        lyricSnippet: 'Chattanooga Choo Choo, won\'t you choo-choo me...',
        melodicHint: 'Da da da da da da, da da da da da...',
        options: ['Home', 'Away', 'There'],
        correctIndex: 0,
        funFact: 'Glenn Miller\'s band played this in the 1941 film Sun Valley Serenade.',
      },
    ],
  },
  // Set 18 — Pop Classics
  {
    rounds: [
      {
        lyricSnippet: 'Let it be, let it be, let it be, let it...',
        melodicHint: 'Da da da, da da da, da da da, da da...',
        options: ['Be', 'Go', 'Shine'],
        correctIndex: 0,
        funFact: 'The Beatles released this in 1970 as one of their final singles.',
      },
      {
        lyricSnippet: 'Hey Jude, don\'t make it...',
        melodicHint: 'Da da, da da da da...',
        options: ['Bad', 'Sad', 'Hard'],
        correctIndex: 0,
        funFact: 'Paul McCartney wrote this for John Lennon\'s son Julian.',
      },
      {
        lyricSnippet: 'Imagine all the people living life in...',
        melodicHint: 'Da da da da da da da da da da...',
        options: ['Peace', 'Love', 'Joy'],
        correctIndex: 0,
        funFact: 'John Lennon released Imagine in 1971.',
      },
    ],
  },
  // Set 19 — Scottish & Irish
  {
    rounds: [
      {
        lyricSnippet: 'Should auld acquaintance be forgot and never brought to...',
        melodicHint: 'Da da da da da da da da da da da da da...',
        options: ['Mind', 'Heart', 'Light'],
        correctIndex: 0,
        funFact: 'Auld Lang Syne is traditionally sung at New Year — words by Robert Burns.',
      },
      {
        lyricSnippet: 'Danny Boy, oh Danny Boy, the pipes, the pipes are...',
        melodicHint: 'Da da da, da da da, da da, da da da...',
        options: ['Calling', 'Playing', 'Singing'],
        correctIndex: 0,
        funFact: 'This beloved Irish song uses the melody of Londonderry Air.',
      },
      {
        lyricSnippet: 'Loch Lomond... you take the high road and I\'ll take the...',
        melodicHint: 'Da da da da da da da da da da da da...',
        options: ['Low road', 'Back road', 'Long road'],
        correctIndex: 0,
        funFact: 'This traditional Scottish song dates back to the 18th century.',
      },
    ],
  },
  // Set 20 — Show Stoppers
  {
    rounds: [
      {
        lyricSnippet: 'Singin\' in the rain, just singin\' in the...',
        melodicHint: 'Da da da da da, da da da da da...',
        options: ['Rain', 'Sun', 'Wind'],
        correctIndex: 0,
        funFact: 'Gene Kelly\'s famous dance scene in the 1952 film is unforgettable.',
      },
      {
        lyricSnippet: 'I could have danced all...',
        melodicHint: 'Da da da da da...',
        options: ['Night', 'Day', 'Week'],
        correctIndex: 0,
        funFact: 'From My Fair Lady (1956), this song captures pure joy.',
      },
      {
        lyricSnippet: 'Getting to know you, getting to know all about...',
        melodicHint: 'Da da da da da, da da da da da da da...',
        options: ['You', 'Me', 'Love'],
        correctIndex: 0,
        funFact: 'From The King and I (1951), written by Rodgers and Hammerstein.',
      },
    ],
  },
];
