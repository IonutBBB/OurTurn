export interface TrueOrFalseRound {
  statement: string;
  isTrue: boolean;
  explanation: string;
}

export interface TrueOrFalseContent {
  rounds: TrueOrFalseRound[];
}

export const TRUE_OR_FALSE_CONTENT: TrueOrFalseContent[] = [
  // Set 1
  {
    rounds: [
      { statement: 'The Sun rises in the east.', isTrue: true, explanation: 'The Sun always rises in the east and sets in the west.' },
      { statement: 'Cats can fly.', isTrue: false, explanation: 'Cats cannot fly — but they are great climbers!' },
      { statement: 'Water freezes at 0°C.', isTrue: true, explanation: 'Water turns to ice at 0 degrees Celsius.' },
      { statement: 'Bananas are blue.', isTrue: false, explanation: 'Bananas are yellow when ripe.' },
      { statement: 'There are 7 days in a week.', isTrue: true, explanation: 'A week has 7 days, from Monday to Sunday.' },
    ],
  },
  // Set 2
  {
    rounds: [
      { statement: 'Fish live in water.', isTrue: true, explanation: 'Fish breathe through gills and live in water.' },
      { statement: 'The Moon is made of cheese.', isTrue: false, explanation: 'The Moon is made of rock — the cheese idea is a fun old tale!' },
      { statement: 'Dogs can bark.', isTrue: true, explanation: 'Barking is how dogs communicate.' },
      { statement: 'Snow is hot.', isTrue: false, explanation: 'Snow is cold — it is frozen water.' },
      { statement: 'A year has 12 months.', isTrue: true, explanation: 'There are 12 months from January to December.' },
    ],
  },
  // Set 3
  {
    rounds: [
      { statement: 'Elephants are the largest land animals.', isTrue: true, explanation: 'African elephants are the biggest animals on land.' },
      { statement: 'Spiders have 6 legs.', isTrue: false, explanation: 'Spiders have 8 legs — insects have 6.' },
      { statement: 'Oranges are a type of fruit.', isTrue: true, explanation: 'Oranges are citrus fruits, full of vitamin C.' },
      { statement: 'Birds lay eggs.', isTrue: true, explanation: 'All birds lay eggs to have their young.' },
      { statement: 'Cows can climb trees.', isTrue: false, explanation: 'Cows are too heavy to climb trees!' },
    ],
  },
  // Set 4
  {
    rounds: [
      { statement: 'London is the capital of England.', isTrue: true, explanation: 'London has been England\'s capital for centuries.' },
      { statement: 'A triangle has 4 sides.', isTrue: false, explanation: 'A triangle has 3 sides — "tri" means three.' },
      { statement: 'Bees make honey.', isTrue: true, explanation: 'Bees collect nectar from flowers and turn it into honey.' },
      { statement: 'The Earth is flat.', isTrue: false, explanation: 'The Earth is round, like a ball.' },
      { statement: 'Roses are flowers.', isTrue: true, explanation: 'Roses are one of the most popular flowers in the world.' },
    ],
  },
  // Set 5
  {
    rounds: [
      { statement: 'Ice cream is served cold.', isTrue: true, explanation: 'Ice cream melts if it gets warm, so it is always cold.' },
      { statement: 'Penguins can fly.', isTrue: false, explanation: 'Penguins are birds, but they swim instead of fly.' },
      { statement: 'A piano has black and white keys.', isTrue: true, explanation: 'A standard piano has both black and white keys.' },
      { statement: 'Carrots are a type of meat.', isTrue: false, explanation: 'Carrots are vegetables that grow in the ground.' },
      { statement: 'Horses can gallop.', isTrue: true, explanation: 'Galloping is the fastest way a horse can run.' },
    ],
  },
  // Set 6
  {
    rounds: [
      { statement: 'The sky is usually blue on a clear day.', isTrue: true, explanation: 'Sunlight scattering in the atmosphere makes the sky look blue.' },
      { statement: 'Whales are fish.', isTrue: false, explanation: 'Whales are mammals — they breathe air and feed milk to their young.' },
      { statement: 'Tea is a popular drink in Britain.', isTrue: true, explanation: 'The British drink about 100 million cups of tea every day!' },
      { statement: 'Tomatoes are always purple.', isTrue: false, explanation: 'Most tomatoes are red, though some varieties can be yellow or green.' },
      { statement: 'Paris is in France.', isTrue: true, explanation: 'Paris is the capital city of France.' },
    ],
  },
  // Set 7
  {
    rounds: [
      { statement: 'A spider is an insect.', isTrue: false, explanation: 'Spiders are arachnids, not insects — they have 8 legs, not 6.' },
      { statement: 'Apples grow on trees.', isTrue: true, explanation: 'Apple trees produce fruit every autumn.' },
      { statement: 'The number after 9 is 10.', isTrue: true, explanation: '9 plus 1 equals 10.' },
      { statement: 'Owls sleep during the day.', isTrue: true, explanation: 'Most owls are nocturnal — active at night and sleeping by day.' },
      { statement: 'A bicycle has 3 wheels.', isTrue: false, explanation: 'A bicycle has 2 wheels — "bi" means two.' },
    ],
  },
  // Set 8
  {
    rounds: [
      { statement: 'Chocolate is made from cocoa beans.', isTrue: true, explanation: 'Cocoa beans are the main ingredient in chocolate.' },
      { statement: 'Goldfish have a memory of only 3 seconds.', isTrue: false, explanation: 'Goldfish can actually remember things for months!' },
      { statement: 'The heart pumps blood around the body.', isTrue: true, explanation: 'Your heart beats about 100,000 times a day to pump blood.' },
      { statement: 'Lemons are sweet.', isTrue: false, explanation: 'Lemons are sour because they contain citric acid.' },
      { statement: 'Summer is warmer than winter.', isTrue: true, explanation: 'In summer, the Sun is higher and days are longer, making it warmer.' },
    ],
  },
  // Set 9
  {
    rounds: [
      { statement: 'Dolphins live in the ocean.', isTrue: true, explanation: 'Dolphins are found in oceans and seas around the world.' },
      { statement: 'Strawberries are vegetables.', isTrue: false, explanation: 'Strawberries are fruits — sweet and delicious!' },
      { statement: 'A rainbow has 7 colours.', isTrue: true, explanation: 'Red, orange, yellow, green, blue, indigo, and violet.' },
      { statement: 'Snakes have legs.', isTrue: false, explanation: 'Snakes slither on their bellies — they have no legs.' },
      { statement: 'Bread is baked in an oven.', isTrue: true, explanation: 'Dough is shaped and baked in an oven to make bread.' },
    ],
  },
  // Set 10
  {
    rounds: [
      { statement: 'Australia is a country and a continent.', isTrue: true, explanation: 'Australia is the only place that is both a country and a continent.' },
      { statement: 'Giraffes are short animals.', isTrue: false, explanation: 'Giraffes are the tallest animals on Earth!' },
      { statement: 'Milk comes from cows.', isTrue: true, explanation: 'Most of the milk we drink comes from dairy cows.' },
      { statement: 'December comes before November.', isTrue: false, explanation: 'November is the 11th month and December is the 12th.' },
      { statement: 'The Queen lives in Buckingham Palace.', isTrue: true, explanation: 'Buckingham Palace in London is the official royal residence.' },
    ],
  },
  // Set 11
  {
    rounds: [
      { statement: 'Potatoes grow underground.', isTrue: true, explanation: 'Potatoes are tubers that grow beneath the soil.' },
      { statement: 'A square has 5 sides.', isTrue: false, explanation: 'A square has 4 equal sides.' },
      { statement: 'Chickens lay eggs.', isTrue: true, explanation: 'Hens lay eggs, which is where our breakfast eggs come from.' },
      { statement: 'Mars is the closest planet to the Sun.', isTrue: false, explanation: 'Mercury is the closest planet to the Sun, not Mars.' },
      { statement: 'Big Ben is in London.', isTrue: true, explanation: 'Big Ben is the famous bell inside the Elizabeth Tower at the Houses of Parliament.' },
    ],
  },
  // Set 12
  {
    rounds: [
      { statement: 'A caterpillar turns into a butterfly.', isTrue: true, explanation: 'Caterpillars go through metamorphosis to become butterflies.' },
      { statement: 'Humans have 3 arms.', isTrue: false, explanation: 'Humans have 2 arms.' },
      { statement: 'Rain falls from clouds.', isTrue: true, explanation: 'When clouds get heavy with water, rain falls to the ground.' },
      { statement: 'The colour red means "go" in traffic lights.', isTrue: false, explanation: 'Red means stop — green means go.' },
      { statement: 'Sheep give us wool.', isTrue: true, explanation: 'Sheep are sheared once a year and their wool is made into clothing.' },
    ],
  },
  // Set 13
  {
    rounds: [
      { statement: 'An octopus has 8 arms.', isTrue: true, explanation: 'The word "octo" means eight.' },
      { statement: 'The Sahara Desert is in Europe.', isTrue: false, explanation: 'The Sahara Desert is in Africa — it is the largest hot desert in the world.' },
      { statement: 'Carrots are good for your eyesight.', isTrue: true, explanation: 'Carrots contain vitamin A, which helps keep your eyes healthy.' },
      { statement: 'Frogs are mammals.', isTrue: false, explanation: 'Frogs are amphibians — they live in water and on land.' },
      { statement: 'Christmas Day is on the 25th of December.', isTrue: true, explanation: 'Christmas is celebrated on December 25th each year.' },
    ],
  },
  // Set 14
  {
    rounds: [
      { statement: 'A clock has 12 hours on its face.', isTrue: true, explanation: 'A standard clock face shows numbers 1 through 12.' },
      { statement: 'Bananas grow on trees.', isTrue: false, explanation: 'Banana plants look like trees but are actually giant herbs!' },
      { statement: 'Dogs wag their tails when happy.', isTrue: true, explanation: 'A wagging tail usually means a dog is feeling happy or excited.' },
      { statement: 'The Eiffel Tower is in Spain.', isTrue: false, explanation: 'The Eiffel Tower is in Paris, France.' },
      { statement: 'Ice is frozen water.', isTrue: true, explanation: 'When water gets cold enough (0°C), it freezes into ice.' },
    ],
  },
  // Set 15
  {
    rounds: [
      { statement: 'Butterflies start life as caterpillars.', isTrue: true, explanation: 'A butterfly begins as a tiny egg, then a caterpillar, then a chrysalis.' },
      { statement: 'The Great Wall of China is in Japan.', isTrue: false, explanation: 'The Great Wall is in China — it stretches over 13,000 miles.' },
      { statement: 'Sugar is sweet.', isTrue: true, explanation: 'Sugar is one of the sweetest-tasting things we eat.' },
      { statement: 'Ostriches can fly long distances.', isTrue: false, explanation: 'Ostriches cannot fly, but they can run very fast!' },
      { statement: 'A dozen means 12.', isTrue: true, explanation: 'A dozen always means twelve of something.' },
    ],
  },
  // Set 16
  {
    rounds: [
      { statement: 'Sunflowers turn to face the Sun.', isTrue: true, explanation: 'Young sunflowers follow the Sun across the sky during the day.' },
      { statement: 'Elephants are smaller than mice.', isTrue: false, explanation: 'Elephants are much, much bigger than mice!' },
      { statement: 'A violin is a musical instrument.', isTrue: true, explanation: 'The violin is a stringed instrument played with a bow.' },
      { statement: 'Pineapples grow on pine trees.', isTrue: false, explanation: 'Pineapples grow on low plants close to the ground.' },
      { statement: 'The Atlantic Ocean is between Europe and America.', isTrue: true, explanation: 'The Atlantic Ocean separates the continents of Europe/Africa and the Americas.' },
    ],
  },
  // Set 17
  {
    rounds: [
      { statement: 'Vegetables are good for your health.', isTrue: true, explanation: 'Vegetables provide essential vitamins and minerals.' },
      { statement: 'Koalas are bears.', isTrue: false, explanation: 'Koalas are marsupials, not bears, despite being called "koala bears".' },
      { statement: 'A guitar has strings.', isTrue: true, explanation: 'Most guitars have 6 strings.' },
      { statement: 'The River Thames flows through Manchester.', isTrue: false, explanation: 'The River Thames flows through London.' },
      { statement: 'Autumn leaves often turn orange and red.', isTrue: true, explanation: 'As chlorophyll fades in autumn, leaves turn beautiful warm colours.' },
    ],
  },
  // Set 18
  {
    rounds: [
      { statement: 'Penguins live at the North Pole.', isTrue: false, explanation: 'Most penguins live in the Southern Hemisphere, near the South Pole.' },
      { statement: 'A football pitch is rectangular.', isTrue: true, explanation: 'Football pitches are always rectangular in shape.' },
      { statement: 'Honey never goes bad.', isTrue: true, explanation: 'Archaeologists have found 3,000-year-old honey that was still edible!' },
      { statement: 'Crocodiles are herbivores.', isTrue: false, explanation: 'Crocodiles are carnivores — they eat meat.' },
      { statement: 'Shakespeare was an English playwright.', isTrue: true, explanation: 'William Shakespeare was born in Stratford-upon-Avon, England.' },
    ],
  },
  // Set 19
  {
    rounds: [
      { statement: 'An hour has 60 minutes.', isTrue: true, explanation: 'One hour equals 60 minutes.' },
      { statement: 'Polar bears live in the jungle.', isTrue: false, explanation: 'Polar bears live in the Arctic, where it is very cold.' },
      { statement: 'Robins have a red breast.', isTrue: true, explanation: 'The European robin is famous for its bright red-orange breast.' },
      { statement: 'Italy is shaped like a boot.', isTrue: true, explanation: 'If you look at Italy on a map, it really does look like a boot!' },
      { statement: 'Diamonds are soft.', isTrue: false, explanation: 'Diamonds are the hardest natural material on Earth.' },
    ],
  },
  // Set 20
  {
    rounds: [
      { statement: 'Breakfast is the first meal of the day.', isTrue: true, explanation: 'The word "breakfast" literally means "breaking the fast" of the night.' },
      { statement: 'Bats are blind.', isTrue: false, explanation: 'Bats can actually see — they also use echolocation to navigate.' },
      { statement: 'The Olympic rings have 5 colours.', isTrue: true, explanation: 'The five rings are blue, yellow, black, green, and red.' },
      { statement: 'Camels store water in their humps.', isTrue: false, explanation: 'Camel humps actually store fat, not water.' },
      { statement: 'A postbox in Britain is red.', isTrue: true, explanation: 'The iconic red postbox has been a British symbol since the 1870s.' },
    ],
  },
];
