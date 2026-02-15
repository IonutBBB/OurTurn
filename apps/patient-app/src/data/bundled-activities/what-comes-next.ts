export interface WhatComesNextRound {
  steps: { emoji: string; label: string }[];
  options: { emoji: string; label: string }[];
  correctIndex: number;
}

export interface WhatComesNextContent {
  rounds: WhatComesNextRound[];
}

export const WHAT_COMES_NEXT_CONTENT: WhatComesNextContent[] = [
  // Set 1
  {
    rounds: [
      {
        steps: [{ emoji: '🥚', label: 'Egg' }, { emoji: '🐛', label: 'Caterpillar' }, { emoji: '🦋', label: 'Chrysalis' }],
        options: [{ emoji: '🐝', label: 'Bee' }, { emoji: '🦋', label: 'Butterfly' }, { emoji: '🐞', label: 'Ladybird' }], correctIndex: 1,
      },
      {
        steps: [{ emoji: '🌱', label: 'Seed' }, { emoji: '🌿', label: 'Sprout' }, { emoji: '🌻', label: 'Bud' }],
        options: [{ emoji: '🌺', label: 'Flower' }, { emoji: '🍂', label: 'Leaf' }, { emoji: '🪵', label: 'Log' }], correctIndex: 0,
      },
      {
        steps: [{ emoji: '🧅', label: 'Chop vegetables' }, { emoji: '🍳', label: 'Cook in pan' }, { emoji: '🍽️', label: 'Serve on plate' }],
        options: [{ emoji: '🛒', label: 'Go shopping' }, { emoji: '😋', label: 'Eat dinner' }, { emoji: '🧹', label: 'Sweep floor' }], correctIndex: 1,
      },
      {
        steps: [{ emoji: '🛁', label: 'Run a bath' }, { emoji: '🧼', label: 'Wash with soap' }, { emoji: '🚿', label: 'Rinse off' }],
        options: [{ emoji: '🎸', label: 'Play guitar' }, { emoji: '🏃', label: 'Go running' }, { emoji: '🛏️', label: 'Dry off and get dressed' }], correctIndex: 2,
      },
    ],
  },
  // Set 2
  {
    rounds: [
      {
        steps: [{ emoji: '📝', label: 'Write a letter' }, { emoji: '✉️', label: 'Put in envelope' }, { emoji: '📮', label: 'Post it' }],
        options: [{ emoji: '📬', label: 'It gets delivered' }, { emoji: '🍕', label: 'Order pizza' }, { emoji: '🎸', label: 'Play music' }], correctIndex: 0,
      },
      {
        steps: [{ emoji: '🌅', label: 'Wake up' }, { emoji: '🪥', label: 'Brush teeth' }, { emoji: '👔', label: 'Get dressed' }],
        options: [{ emoji: '🛏️', label: 'Go to bed' }, { emoji: '🥣', label: 'Have breakfast' }, { emoji: '🌙', label: 'See the moon' }], correctIndex: 1,
      },
      {
        steps: [{ emoji: '🥛', label: 'Pour milk' }, { emoji: '🫖', label: 'Add tea bag' }, { emoji: '♨️', label: 'Pour hot water' }],
        options: [{ emoji: '☕', label: 'Stir and drink' }, { emoji: '🍕', label: 'Eat pizza' }, { emoji: '🎸', label: 'Play guitar' }], correctIndex: 0,
      },
      {
        steps: [{ emoji: '🧺', label: 'Collect washing' }, { emoji: '🫧', label: 'Put in machine' }, { emoji: '👕', label: 'Wash clothes' }],
        options: [{ emoji: '☀️', label: 'Hang out to dry' }, { emoji: '🍳', label: 'Cook dinner' }, { emoji: '🎮', label: 'Play a game' }], correctIndex: 0,
      },
    ],
  },
  // Set 3
  {
    rounds: [
      {
        steps: [{ emoji: '🥜', label: 'Mix ingredients' }, { emoji: '🥧', label: 'Shape the dough' }, { emoji: '🔥', label: 'Put in oven' }],
        options: [{ emoji: '🍞', label: 'Bread is ready' }, { emoji: '🎸', label: 'Play music' }, { emoji: '📚', label: 'Read a book' }], correctIndex: 0,
      },
      {
        steps: [{ emoji: '🌙', label: 'Evening comes' }, { emoji: '📺', label: 'Watch TV' }, { emoji: '🥱', label: 'Feel sleepy' }],
        options: [{ emoji: '🏊', label: 'Go swimming' }, { emoji: '🛏️', label: 'Go to bed' }, { emoji: '🏃', label: 'Go for a run' }], correctIndex: 1,
      },
      {
        steps: [{ emoji: '🛒', label: 'Go to shop' }, { emoji: '🥕', label: 'Choose food' }, { emoji: '💷', label: 'Pay at till' }],
        options: [{ emoji: '🎸', label: 'Play guitar' }, { emoji: '🏠', label: 'Take shopping home' }, { emoji: '✈️', label: 'Fly to Spain' }], correctIndex: 1,
      },
      {
        steps: [{ emoji: '📚', label: 'Open book' }, { emoji: '📖', label: 'Read pages' }, { emoji: '🥱', label: 'Eyes get heavy' }],
        options: [{ emoji: '😴', label: 'Fall asleep' }, { emoji: '🏃', label: 'Go running' }, { emoji: '🎤', label: 'Sing a song' }], correctIndex: 0,
      },
    ],
  },
  // Set 4
  {
    rounds: [
      {
        steps: [{ emoji: '🌧️', label: 'It starts raining' }, { emoji: '🌂', label: 'Grab umbrella' }, { emoji: '👢', label: 'Put on boots' }],
        options: [{ emoji: '🚶', label: 'Walk outside' }, { emoji: '☀️', label: 'Sunbathe' }, { emoji: '🏊', label: 'Go swimming' }], correctIndex: 0,
      },
      {
        steps: [{ emoji: '🎁', label: 'Wrap the gift' }, { emoji: '🎀', label: 'Tie a ribbon' }, { emoji: '🎂', label: 'Go to party' }],
        options: [{ emoji: '🎉', label: 'Give the present' }, { emoji: '🛏️', label: 'Go to sleep' }, { emoji: '🧹', label: 'Clean house' }], correctIndex: 0,
      },
      {
        steps: [{ emoji: '🪴', label: 'Dig a hole' }, { emoji: '🌱', label: 'Plant the seed' }, { emoji: '💧', label: 'Water it' }],
        options: [{ emoji: '🌸', label: 'Watch it grow' }, { emoji: '❄️', label: 'Build snowman' }, { emoji: '🍕', label: 'Order pizza' }], correctIndex: 0,
      },
      {
        steps: [{ emoji: '🪣', label: 'Fill bucket' }, { emoji: '🧽', label: 'Get sponge' }, { emoji: '🫧', label: 'Add soap' }],
        options: [{ emoji: '🎸', label: 'Play guitar' }, { emoji: '🚗', label: 'Wash the car' }, { emoji: '📚', label: 'Read a book' }], correctIndex: 1,
      },
    ],
  },
  // Set 5
  {
    rounds: [
      {
        steps: [{ emoji: '✈️', label: 'Arrive at airport' }, { emoji: '🎫', label: 'Show ticket' }, { emoji: '🛫', label: 'Board the plane' }],
        options: [{ emoji: '🏖️', label: 'Fly to holiday' }, { emoji: '🏠', label: 'Go home' }, { emoji: '🧹', label: 'Clean house' }], correctIndex: 0,
      },
      {
        steps: [{ emoji: '🫖', label: 'Boil the kettle' }, { emoji: '☕', label: 'Make tea' }, { emoji: '🍪', label: 'Get a biscuit' }],
        options: [{ emoji: '🍕', label: 'Order pizza' }, { emoji: '🛋️', label: 'Sit down and enjoy' }, { emoji: '🏃', label: 'Go running' }], correctIndex: 1,
      },
      {
        steps: [{ emoji: '🐕', label: 'Get the lead' }, { emoji: '👟', label: 'Put on shoes' }, { emoji: '🚪', label: 'Open door' }],
        options: [{ emoji: '🚶', label: 'Walk the dog' }, { emoji: '📺', label: 'Watch TV' }, { emoji: '🛏️', label: 'Go to bed' }], correctIndex: 0,
      },
      {
        steps: [{ emoji: '🥣', label: 'Pour cereal' }, { emoji: '🥛', label: 'Add milk' }, { emoji: '🥄', label: 'Get a spoon' }],
        options: [{ emoji: '😋', label: 'Eat breakfast' }, { emoji: '🎸', label: 'Play guitar' }, { emoji: '🧹', label: 'Sweep floor' }], correctIndex: 0,
      },
    ],
  },
  // Set 6
  {
    rounds: [
      {
        steps: [{ emoji: '📱', label: 'Phone rings' }, { emoji: '👋', label: 'Answer it' }, { emoji: '🗣️', label: 'Have a chat' }],
        options: [{ emoji: '👋', label: 'Say goodbye' }, { emoji: '🍕', label: 'Eat pizza' }, { emoji: '🎸', label: 'Play guitar' }], correctIndex: 0,
      },
      {
        steps: [{ emoji: '🌅', label: 'Morning comes' }, { emoji: '🐓', label: 'Rooster crows' }, { emoji: '😊', label: 'Wake up' }],
        options: [{ emoji: '🌙', label: 'Go to sleep' }, { emoji: '☕', label: 'Have morning tea' }, { emoji: '🍕', label: 'Order pizza' }], correctIndex: 1,
      },
      {
        steps: [{ emoji: '🪵', label: 'Get firewood' }, { emoji: '📰', label: 'Crumple paper' }, { emoji: '🔥', label: 'Light the fire' }],
        options: [{ emoji: '🏊', label: 'Go swimming' }, { emoji: '🎸', label: 'Play guitar' }, { emoji: '🛋️', label: 'Sit by the fire' }], correctIndex: 2,
      },
      {
        steps: [{ emoji: '🍎', label: 'Pick apples' }, { emoji: '🔪', label: 'Peel and chop' }, { emoji: '🥧', label: 'Make pie' }],
        options: [{ emoji: '🍽️', label: 'Serve and eat' }, { emoji: '🎸', label: 'Play guitar' }, { emoji: '📚', label: 'Read a book' }], correctIndex: 0,
      },
    ],
  },
  // Set 7
  {
    rounds: [
      {
        steps: [{ emoji: '🎣', label: 'Cast the line' }, { emoji: '⏳', label: 'Wait patiently' }, { emoji: '🐟', label: 'Feel a tug' }],
        options: [{ emoji: '🎣', label: 'Reel in the fish' }, { emoji: '🍕', label: 'Eat pizza' }, { emoji: '🎸', label: 'Play guitar' }], correctIndex: 0,
      },
      {
        steps: [{ emoji: '📦', label: 'Pack boxes' }, { emoji: '🚚', label: 'Load the van' }, { emoji: '🚗', label: 'Drive to new house' }],
        options: [{ emoji: '🎸', label: 'Play guitar' }, { emoji: '📦', label: 'Unpack boxes' }, { emoji: '🍕', label: 'Eat pizza' }], correctIndex: 1,
      },
      {
        steps: [{ emoji: '🎨', label: 'Get paints ready' }, { emoji: '🖌️', label: 'Pick up brush' }, { emoji: '🖼️', label: 'Paint a picture' }],
        options: [{ emoji: '🏃', label: 'Go running' }, { emoji: '📚', label: 'Read a book' }, { emoji: '🪟', label: 'Hang it on the wall' }], correctIndex: 2,
      },
      {
        steps: [{ emoji: '🛏️', label: 'Make the bed' }, { emoji: '🧹', label: 'Sweep the floor' }, { emoji: '🪣', label: 'Mop the floor' }],
        options: [{ emoji: '✨', label: 'Room is clean' }, { emoji: '🍕', label: 'Order pizza' }, { emoji: '🎸', label: 'Play guitar' }], correctIndex: 0,
      },
    ],
  },
  // Set 8
  {
    rounds: [
      {
        steps: [{ emoji: '📸', label: 'Take photos' }, { emoji: '🖨️', label: 'Print them' }, { emoji: '📒', label: 'Get an album' }],
        options: [{ emoji: '📔', label: 'Put photos in album' }, { emoji: '🎸', label: 'Play guitar' }, { emoji: '🍕', label: 'Eat pizza' }], correctIndex: 0,
      },
      {
        steps: [{ emoji: '🎄', label: 'Put up tree' }, { emoji: '🎁', label: 'Wrap presents' }, { emoji: '🧑‍🍳', label: 'Cook dinner' }],
        options: [{ emoji: '🏖️', label: 'Go to beach' }, { emoji: '🎅', label: 'Open presents' }, { emoji: '🏃', label: 'Go running' }], correctIndex: 1,
      },
      {
        steps: [{ emoji: '🌾', label: 'Harvest wheat' }, { emoji: '🫗', label: 'Grind into flour' }, { emoji: '🥣', label: 'Mix the dough' }],
        options: [{ emoji: '🍞', label: 'Bake bread' }, { emoji: '🎸', label: 'Play guitar' }, { emoji: '📚', label: 'Read a book' }], correctIndex: 0,
      },
      {
        steps: [{ emoji: '🚿', label: 'Have a shower' }, { emoji: '👔', label: 'Put on smart clothes' }, { emoji: '🪮', label: 'Comb hair' }],
        options: [{ emoji: '🛏️', label: 'Go to bed' }, { emoji: '🚗', label: 'Go out' }, { emoji: '🧹', label: 'Clean house' }], correctIndex: 1,
      },
    ],
  },
  // Set 9
  {
    rounds: [
      {
        steps: [{ emoji: '🎵', label: 'Choose a song' }, { emoji: '📻', label: 'Turn on radio' }, { emoji: '🎶', label: 'Music plays' }],
        options: [{ emoji: '💃', label: 'Dance along' }, { emoji: '🍕', label: 'Eat pizza' }, { emoji: '📚', label: 'Read a book' }], correctIndex: 0,
      },
      {
        steps: [{ emoji: '🥕', label: 'Peel carrots' }, { emoji: '🥔', label: 'Chop potatoes' }, { emoji: '🫕', label: 'Put in pot' }],
        options: [{ emoji: '🎸', label: 'Play guitar' }, { emoji: '🍲', label: 'Make soup' }, { emoji: '🏃', label: 'Go running' }], correctIndex: 1,
      },
      {
        steps: [{ emoji: '🌍', label: 'Choose destination' }, { emoji: '🎫', label: 'Book tickets' }, { emoji: '🧳', label: 'Pack suitcase' }],
        options: [{ emoji: '✈️', label: 'Go on holiday' }, { emoji: '🎸', label: 'Play guitar' }, { emoji: '🧹', label: 'Clean house' }], correctIndex: 0,
      },
      {
        steps: [{ emoji: '🧤', label: 'Put on gloves' }, { emoji: '🧣', label: 'Wrap up warm' }, { emoji: '❄️', label: 'Go outside' }],
        options: [{ emoji: '☀️', label: 'Sunbathe' }, { emoji: '⛄', label: 'Build a snowman' }, { emoji: '🏊', label: 'Go swimming' }], correctIndex: 1,
      },
    ],
  },
  // Set 10
  {
    rounds: [
      {
        steps: [{ emoji: '🐔', label: 'Hen sits on egg' }, { emoji: '🥚', label: 'Egg starts to crack' }, { emoji: '🐣', label: 'Chick hatches' }],
        options: [{ emoji: '🐥', label: 'Chick grows up' }, { emoji: '🐟', label: 'Fish swims' }, { emoji: '🍕', label: 'Eat pizza' }], correctIndex: 0,
      },
      {
        steps: [{ emoji: '🏫', label: 'Go to school' }, { emoji: '📚', label: 'Have lessons' }, { emoji: '🔔', label: 'Bell rings' }],
        options: [{ emoji: '🎸', label: 'Play guitar' }, { emoji: '🏠', label: 'Go home' }, { emoji: '🍕', label: 'Eat pizza' }], correctIndex: 1,
      },
      {
        steps: [{ emoji: '🧅', label: 'Chop onions' }, { emoji: '🧄', label: 'Add garlic' }, { emoji: '🍅', label: 'Add tomatoes' }],
        options: [{ emoji: '🍝', label: 'Serve pasta sauce' }, { emoji: '🎸', label: 'Play guitar' }, { emoji: '📚', label: 'Read a book' }], correctIndex: 0,
      },
      {
        steps: [{ emoji: '🎂', label: 'Cut the cake' }, { emoji: '🍽️', label: 'Put on plate' }, { emoji: '🍴', label: 'Pick up fork' }],
        options: [{ emoji: '🏃', label: 'Go running' }, { emoji: '🧹', label: 'Sweep floor' }, { emoji: '😋', label: 'Enjoy the cake' }], correctIndex: 2,
      },
    ],
  },
  // Set 11
  {
    rounds: [
      {
        steps: [{ emoji: '💈', label: 'Go to barber' }, { emoji: '🪑', label: 'Sit in chair' }, { emoji: '✂️', label: 'Get a haircut' }],
        options: [{ emoji: '🪞', label: 'Look in mirror' }, { emoji: '🍕', label: 'Eat pizza' }, { emoji: '🎸', label: 'Play guitar' }], correctIndex: 0,
      },
      {
        steps: [{ emoji: '🌧️', label: 'Rain stops' }, { emoji: '☀️', label: 'Sun comes out' }, { emoji: '💧', label: 'Puddles appear' }],
        options: [{ emoji: '🌈', label: 'See a rainbow' }, { emoji: '❄️', label: 'Snow falls' }, { emoji: '🌪️', label: 'Tornado' }], correctIndex: 0,
      },
      {
        steps: [{ emoji: '🫧', label: 'Fill the sink' }, { emoji: '🍽️', label: 'Put dishes in' }, { emoji: '🧽', label: 'Scrub them clean' }],
        options: [{ emoji: '🎸', label: 'Play guitar' }, { emoji: '🧹', label: 'Leave them to dry' }, { emoji: '🍕', label: 'Order pizza' }], correctIndex: 1,
      },
      {
        steps: [{ emoji: '🛍️', label: 'Buy new outfit' }, { emoji: '🏠', label: 'Take it home' }, { emoji: '👔', label: 'Try it on' }],
        options: [{ emoji: '🪞', label: 'Check in mirror' }, { emoji: '🎸', label: 'Play guitar' }, { emoji: '🍕', label: 'Eat pizza' }], correctIndex: 0,
      },
    ],
  },
  // Set 12
  {
    rounds: [
      {
        steps: [{ emoji: '🌱', label: 'Plant a tree' }, { emoji: '💧', label: 'Water it' }, { emoji: '☀️', label: 'Give it sun' }],
        options: [{ emoji: '🌳', label: 'Tree grows tall' }, { emoji: '❄️', label: 'Tree freezes' }, { emoji: '🎸', label: 'Play guitar' }], correctIndex: 0,
      },
      {
        steps: [{ emoji: '🔑', label: 'Get car keys' }, { emoji: '🚗', label: 'Start the car' }, { emoji: '🛣️', label: 'Drive to shops' }],
        options: [{ emoji: '🛒', label: 'Do the shopping' }, { emoji: '🎸', label: 'Play guitar' }, { emoji: '🛏️', label: 'Go to bed' }], correctIndex: 0,
      },
      {
        steps: [{ emoji: '🎤', label: 'Stand on stage' }, { emoji: '🎵', label: 'Music starts' }, { emoji: '🗣️', label: 'Start singing' }],
        options: [{ emoji: '🍕', label: 'Eat pizza' }, { emoji: '👏', label: 'Audience claps' }, { emoji: '🏃', label: 'Go running' }], correctIndex: 1,
      },
      {
        steps: [{ emoji: '📖', label: 'Read recipe' }, { emoji: '🥣', label: 'Gather ingredients' }, { emoji: '🍳', label: 'Start cooking' }],
        options: [{ emoji: '🍽️', label: 'Serve the meal' }, { emoji: '🎸', label: 'Play guitar' }, { emoji: '📚', label: 'Read more' }], correctIndex: 0,
      },
    ],
  },
  // Sets 13-20 follow the same pattern
  // Set 13
  {
    rounds: [
      {
        steps: [{ emoji: '📧', label: 'Write an email' }, { emoji: '📎', label: 'Attach a file' }, { emoji: '✅', label: 'Check spelling' }],
        options: [{ emoji: '📨', label: 'Press send' }, { emoji: '🎸', label: 'Play guitar' }, { emoji: '🍕', label: 'Order pizza' }], correctIndex: 0,
      },
      {
        steps: [{ emoji: '🏊', label: 'Go to pool' }, { emoji: '👙', label: 'Get changed' }, { emoji: '🚿', label: 'Have a shower' }],
        options: [{ emoji: '🍕', label: 'Eat pizza' }, { emoji: '🏊', label: 'Jump in the pool' }, { emoji: '🎸', label: 'Play guitar' }], correctIndex: 1,
      },
      {
        steps: [{ emoji: '📰', label: 'Read the paper' }, { emoji: '✂️', label: 'Cut out crossword' }, { emoji: '✏️', label: 'Get a pencil' }],
        options: [{ emoji: '🧩', label: 'Solve the puzzle' }, { emoji: '🎸', label: 'Play guitar' }, { emoji: '🍕', label: 'Eat pizza' }], correctIndex: 0,
      },
      {
        steps: [{ emoji: '🍫', label: 'Break chocolate' }, { emoji: '🫕', label: 'Melt it' }, { emoji: '🍓', label: 'Dip strawberries' }],
        options: [{ emoji: '🎸', label: 'Play guitar' }, { emoji: '🍕', label: 'Order pizza' }, { emoji: '😋', label: 'Enjoy the treat' }], correctIndex: 2,
      },
    ],
  },
  // Set 14
  {
    rounds: [
      {
        steps: [{ emoji: '🧊', label: 'Get ice cubes' }, { emoji: '🍋', label: 'Squeeze lemon' }, { emoji: '💧', label: 'Add water' }],
        options: [{ emoji: '🥤', label: 'Enjoy lemonade' }, { emoji: '🎸', label: 'Play guitar' }, { emoji: '🍕', label: 'Eat pizza' }], correctIndex: 0,
      },
      {
        steps: [{ emoji: '🧸', label: 'Choose a toy' }, { emoji: '🎁', label: 'Wrap it up' }, { emoji: '🎀', label: 'Add a bow' }],
        options: [{ emoji: '🎸', label: 'Play guitar' }, { emoji: '🎂', label: 'Give as gift' }, { emoji: '🍕', label: 'Eat pizza' }], correctIndex: 1,
      },
      {
        steps: [{ emoji: '🌙', label: 'Night time' }, { emoji: '🪥', label: 'Brush teeth' }, { emoji: '📖', label: 'Read a story' }],
        options: [{ emoji: '😴', label: 'Fall asleep' }, { emoji: '🏃', label: 'Go running' }, { emoji: '🎸', label: 'Play guitar' }], correctIndex: 0,
      },
      {
        steps: [{ emoji: '🐕', label: 'Dog is dirty' }, { emoji: '🛁', label: 'Fill the bath' }, { emoji: '🫧', label: 'Add shampoo' }],
        options: [{ emoji: '🎸', label: 'Play guitar' }, { emoji: '🍕', label: 'Eat pizza' }, { emoji: '🐕', label: 'Wash the dog' }], correctIndex: 2,
      },
    ],
  },
  // Set 15
  {
    rounds: [
      {
        steps: [{ emoji: '🪴', label: 'Get compost' }, { emoji: '🌱', label: 'Plant bulbs' }, { emoji: '💧', label: 'Water them' }],
        options: [{ emoji: '🌷', label: 'Flowers bloom' }, { emoji: '🎸', label: 'Play guitar' }, { emoji: '🍕', label: 'Eat pizza' }], correctIndex: 0,
      },
      {
        steps: [{ emoji: '📻', label: 'Hear the news' }, { emoji: '🌂', label: 'Rain forecast' }, { emoji: '🧥', label: 'Get your coat' }],
        options: [{ emoji: '🍕', label: 'Eat pizza' }, { emoji: '🚶', label: 'Head out prepared' }, { emoji: '🎸', label: 'Play guitar' }], correctIndex: 1,
      },
      {
        steps: [{ emoji: '🎂', label: 'Birthday party' }, { emoji: '🕯️', label: 'Light candles' }, { emoji: '🎵', label: 'Sing happy birthday' }],
        options: [{ emoji: '🎸', label: 'Play guitar' }, { emoji: '🍕', label: 'Eat pizza' }, { emoji: '🌬️', label: 'Blow out candles' }], correctIndex: 2,
      },
      {
        steps: [{ emoji: '🚿', label: 'Have a wash' }, { emoji: '🛏️', label: 'Put on pyjamas' }, { emoji: '🪥', label: 'Brush teeth' }],
        options: [{ emoji: '😴', label: 'Go to sleep' }, { emoji: '🏃', label: 'Go running' }, { emoji: '🎸', label: 'Play guitar' }], correctIndex: 0,
      },
    ],
  },
  // Set 16
  {
    rounds: [
      {
        steps: [{ emoji: '🫗', label: 'Pour batter' }, { emoji: '🍳', label: 'Flip pancake' }, { emoji: '🍯', label: 'Add honey' }],
        options: [{ emoji: '🥞', label: 'Enjoy pancakes' }, { emoji: '🎸', label: 'Play guitar' }, { emoji: '🍕', label: 'Eat pizza' }], correctIndex: 0,
      },
      {
        steps: [{ emoji: '🧶', label: 'Get wool' }, { emoji: '🪡', label: 'Get needles' }, { emoji: '🧣', label: 'Start knitting' }],
        options: [{ emoji: '🎸', label: 'Play guitar' }, { emoji: '🧤', label: 'Finish scarf' }, { emoji: '🍕', label: 'Eat pizza' }], correctIndex: 1,
      },
      {
        steps: [{ emoji: '🐕', label: 'Dog barks' }, { emoji: '🦴', label: 'Get a treat' }, { emoji: '🤲', label: 'Hold it out' }],
        options: [{ emoji: '🍕', label: 'Eat pizza' }, { emoji: '🎸', label: 'Play guitar' }, { emoji: '🐕', label: 'Dog sits and takes it' }], correctIndex: 2,
      },
      {
        steps: [{ emoji: '🚶', label: 'Go for a walk' }, { emoji: '🌧️', label: 'Rain starts' }, { emoji: '🏠', label: 'Hurry home' }],
        options: [{ emoji: '☕', label: 'Have a warm drink' }, { emoji: '🎸', label: 'Play guitar' }, { emoji: '🍕', label: 'Eat pizza' }], correctIndex: 0,
      },
    ],
  },
  // Set 17
  {
    rounds: [
      {
        steps: [{ emoji: '🎨', label: 'Get watercolours' }, { emoji: '💧', label: 'Wet the brush' }, { emoji: '🖌️', label: 'Paint the sky' }],
        options: [{ emoji: '🖼️', label: 'Beautiful painting' }, { emoji: '🎸', label: 'Play guitar' }, { emoji: '🍕', label: 'Eat pizza' }], correctIndex: 0,
      },
      {
        steps: [{ emoji: '🏡', label: 'Open the window' }, { emoji: '🐦', label: 'Hear birds' }, { emoji: '🌸', label: 'See blossom' }],
        options: [{ emoji: '🎸', label: 'Play guitar' }, { emoji: '😊', label: 'Enjoy the spring' }, { emoji: '❄️', label: 'Build snowman' }], correctIndex: 1,
      },
      {
        steps: [{ emoji: '📝', label: 'Make a list' }, { emoji: '🛒', label: 'Go to market' }, { emoji: '🥕', label: 'Buy vegetables' }],
        options: [{ emoji: '🎸', label: 'Play guitar' }, { emoji: '🍕', label: 'Eat pizza' }, { emoji: '🍲', label: 'Cook a lovely meal' }], correctIndex: 2,
      },
      {
        steps: [{ emoji: '📺', label: 'Turn on TV' }, { emoji: '🎬', label: 'Find a film' }, { emoji: '🍿', label: 'Make popcorn' }],
        options: [{ emoji: '🛋️', label: 'Sit back and enjoy' }, { emoji: '🎸', label: 'Play guitar' }, { emoji: '🏃', label: 'Go running' }], correctIndex: 0,
      },
    ],
  },
  // Set 18
  {
    rounds: [
      {
        steps: [{ emoji: '🌅', label: 'Sun is rising' }, { emoji: '☕', label: 'Make coffee' }, { emoji: '📰', label: 'Get the paper' }],
        options: [{ emoji: '🪑', label: 'Sit and read' }, { emoji: '🎸', label: 'Play guitar' }, { emoji: '🍕', label: 'Eat pizza' }], correctIndex: 0,
      },
      {
        steps: [{ emoji: '🏊', label: 'Go swimming' }, { emoji: '🚿', label: 'Have a shower' }, { emoji: '👕', label: 'Get dressed' }],
        options: [{ emoji: '☕', label: 'Have a warm drink' }, { emoji: '🎸', label: 'Play guitar' }, { emoji: '🍕', label: 'Eat pizza' }], correctIndex: 0,
      },
      {
        steps: [{ emoji: '🎁', label: 'Receive a gift' }, { emoji: '🎀', label: 'Unwrap it' }, { emoji: '📖', label: 'It is a book' }],
        options: [{ emoji: '📚', label: 'Start reading' }, { emoji: '🎸', label: 'Play guitar' }, { emoji: '🍕', label: 'Eat pizza' }], correctIndex: 0,
      },
      {
        steps: [{ emoji: '🌿', label: 'Pick herbs' }, { emoji: '🧅', label: 'Chop onion' }, { emoji: '🫕', label: 'Add to pot' }],
        options: [{ emoji: '🎸', label: 'Play guitar' }, { emoji: '🍲', label: 'Stew is ready' }, { emoji: '🏃', label: 'Go running' }], correctIndex: 1,
      },
    ],
  },
  // Set 19
  {
    rounds: [
      {
        steps: [{ emoji: '🧵', label: 'Thread needle' }, { emoji: '👔', label: 'Find the button' }, { emoji: '🪡', label: 'Start sewing' }],
        options: [{ emoji: '✅', label: 'Button is fixed' }, { emoji: '🎸', label: 'Play guitar' }, { emoji: '🍕', label: 'Eat pizza' }], correctIndex: 0,
      },
      {
        steps: [{ emoji: '🎄', label: 'December arrives' }, { emoji: '🛍️', label: 'Buy presents' }, { emoji: '🎁', label: 'Wrap them' }],
        options: [{ emoji: '🏖️', label: 'Go to beach' }, { emoji: '🎅', label: 'Christmas Day' }, { emoji: '🎸', label: 'Play guitar' }], correctIndex: 1,
      },
      {
        steps: [{ emoji: '🧺', label: 'Pick up basket' }, { emoji: '🍓', label: 'Pick strawberries' }, { emoji: '🏠', label: 'Take them home' }],
        options: [{ emoji: '🎸', label: 'Play guitar' }, { emoji: '🍕', label: 'Eat pizza' }, { emoji: '🍰', label: 'Make jam' }], correctIndex: 2,
      },
      {
        steps: [{ emoji: '🔑', label: 'Find the key' }, { emoji: '🚪', label: 'Open the door' }, { emoji: '💡', label: 'Turn on light' }],
        options: [{ emoji: '🏠', label: 'Step inside' }, { emoji: '🎸', label: 'Play guitar' }, { emoji: '🍕', label: 'Eat pizza' }], correctIndex: 0,
      },
    ],
  },
  // Set 20
  {
    rounds: [
      {
        steps: [{ emoji: '🌊', label: 'Tide goes out' }, { emoji: '🏖️', label: 'Walk on sand' }, { emoji: '🐚', label: 'Find shells' }],
        options: [{ emoji: '🪣', label: 'Fill the bucket' }, { emoji: '🎸', label: 'Play guitar' }, { emoji: '🍕', label: 'Eat pizza' }], correctIndex: 0,
      },
      {
        steps: [{ emoji: '🥚', label: 'Crack eggs' }, { emoji: '🥛', label: 'Add milk' }, { emoji: '🫗', label: 'Whisk together' }],
        options: [{ emoji: '🎸', label: 'Play guitar' }, { emoji: '🍳', label: 'Make scrambled eggs' }, { emoji: '🍕', label: 'Eat pizza' }], correctIndex: 1,
      },
      {
        steps: [{ emoji: '🌤️', label: 'Nice weather' }, { emoji: '🧺', label: 'Pack a picnic' }, { emoji: '🚗', label: 'Drive to park' }],
        options: [{ emoji: '🍕', label: 'Eat pizza' }, { emoji: '🎸', label: 'Play guitar' }, { emoji: '🧺', label: 'Enjoy the picnic' }], correctIndex: 2,
      },
      {
        steps: [{ emoji: '🛏️', label: 'Strip the bed' }, { emoji: '🧺', label: 'Wash sheets' }, { emoji: '☀️', label: 'Dry on line' }],
        options: [{ emoji: '🛏️', label: 'Make the bed fresh' }, { emoji: '🎸', label: 'Play guitar' }, { emoji: '🍕', label: 'Eat pizza' }], correctIndex: 0,
      },
    ],
  },
];
