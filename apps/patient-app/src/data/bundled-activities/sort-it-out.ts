export interface SortItem {
  emoji: string;
  label: string;
  group: 0 | 1;
}

export interface SortItOutContent {
  scenarioKey: string;
  groupA: string;
  groupAEmoji: string;
  groupB: string;
  groupBEmoji: string;
  items: SortItem[];
}

export const SORT_IT_OUT_CONTENT: SortItOutContent[] = [
  // 1 — Shopping: Fridge vs Cupboard
  {
    scenarioKey: 'patientApp.stim.sortItOut.scenarios.shopping',
    groupA: 'Fridge', groupAEmoji: '\uD83E\uDDCA',
    groupB: 'Cupboard', groupBEmoji: '\uD83D\uDECF\uFE0F',
    items: [
      { emoji: '\uD83E\uDD5B', label: 'Milk', group: 0 },
      { emoji: '\uD83E\uDDC0', label: 'Cheese', group: 0 },
      { emoji: '\uD83E\uDD5A', label: 'Eggs', group: 0 },
      { emoji: '\uD83E\uDD6C', label: 'Lettuce', group: 0 },
      { emoji: '\uD83C\uDF5E', label: 'Bread', group: 1 },
      { emoji: '\uD83E\uDD6B', label: 'Tin of beans', group: 1 },
      { emoji: '\uD83C\uDF5D', label: 'Pasta', group: 1 },
      { emoji: '\u2615', label: 'Tea bags', group: 1 },
    ],
  },
  // 2 — Getting dressed: Indoor vs Outdoor
  {
    scenarioKey: 'patientApp.stim.sortItOut.scenarios.gettingDressed',
    groupA: 'Indoor clothes', groupAEmoji: '\uD83C\uDFE0',
    groupB: 'Outdoor clothes', groupBEmoji: '\uD83C\uDF27\uFE0F',
    items: [
      { emoji: '\uD83E\uDE74', label: 'Slippers', group: 0 },
      { emoji: '\uD83D\uDC55', label: 'T-shirt', group: 0 },
      { emoji: '\uD83E\uDDFB', label: 'Dressing gown', group: 0 },
      { emoji: '\uD83E\uDDE6', label: 'Socks', group: 0 },
      { emoji: '\uD83E\uDDE5', label: 'Coat', group: 1 },
      { emoji: '\uD83E\uDDE3', label: 'Scarf', group: 1 },
      { emoji: '\uD83E\uDDF4', label: 'Boots', group: 1 },
      { emoji: '\u2614', label: 'Umbrella', group: 1 },
    ],
  },
  // 3 — Tidying up: Bedroom vs Kitchen
  {
    scenarioKey: 'patientApp.stim.sortItOut.scenarios.tidying',
    groupA: 'Bedroom', groupAEmoji: '\uD83D\uDECF\uFE0F',
    groupB: 'Kitchen', groupBEmoji: '\uD83C\uDF73',
    items: [
      { emoji: '\uD83D\uDECF\uFE0F', label: 'Pillow', group: 0 },
      { emoji: '\uD83E\uDE9F', label: 'Blanket', group: 0 },
      { emoji: '\uD83D\uDCDA', label: 'Bedside book', group: 0 },
      { emoji: '\u23F0', label: 'Alarm clock', group: 0 },
      { emoji: '\uD83C\uDF74', label: 'Cutlery', group: 1 },
      { emoji: '\uD83E\uDD58', label: 'Frying pan', group: 1 },
      { emoji: '\u2615', label: 'Mug', group: 1 },
      { emoji: '\uD83E\uDDFD', label: 'Sponge', group: 1 },
    ],
  },
  // 4 — Packing: Summer vs Winter holiday
  {
    scenarioKey: 'patientApp.stim.sortItOut.scenarios.packing',
    groupA: 'Summer holiday', groupAEmoji: '\u2600\uFE0F',
    groupB: 'Winter holiday', groupBEmoji: '\u2744\uFE0F',
    items: [
      { emoji: '\uD83E\uDE73', label: 'Shorts', group: 0 },
      { emoji: '\uD83D\uDE0E', label: 'Sunglasses', group: 0 },
      { emoji: '\uD83E\uDDE4', label: 'Sandals', group: 0 },
      { emoji: '\uD83E\uDDF4', label: 'Sun cream', group: 0 },
      { emoji: '\uD83E\uDDE5', label: 'Warm coat', group: 1 },
      { emoji: '\uD83E\uDDE4', label: 'Gloves', group: 1 },
      { emoji: '\uD83E\uDDE3', label: 'Woolly hat', group: 1 },
      { emoji: '\uD83E\uDDF4', label: 'Thick socks', group: 1 },
    ],
  },
  // 5 — Garden: Flowers vs Vegetables
  {
    scenarioKey: 'patientApp.stim.sortItOut.scenarios.garden',
    groupA: 'Flower bed', groupAEmoji: '\uD83C\uDF3A',
    groupB: 'Vegetable patch', groupBEmoji: '\uD83E\uDD55',
    items: [
      { emoji: '\uD83C\uDF39', label: 'Rose', group: 0 },
      { emoji: '\uD83C\uDF37', label: 'Tulip', group: 0 },
      { emoji: '\uD83C\uDF3B', label: 'Sunflower', group: 0 },
      { emoji: '\uD83C\uDF3C', label: 'Daisy', group: 0 },
      { emoji: '\uD83E\uDD55', label: 'Carrot', group: 1 },
      { emoji: '\uD83C\uDF45', label: 'Tomato', group: 1 },
      { emoji: '\uD83E\uDD52', label: 'Courgette', group: 1 },
      { emoji: '\uD83E\uDD6C', label: 'Lettuce', group: 1 },
    ],
  },
  // 6 — Bathroom: Morning routine vs Evening routine
  {
    scenarioKey: 'patientApp.stim.sortItOut.scenarios.bathroom',
    groupA: 'Morning', groupAEmoji: '\uD83C\uDF05',
    groupB: 'Bedtime', groupBEmoji: '\uD83C\uDF19',
    items: [
      { emoji: '\uD83E\uDEB4', label: 'Toothbrush', group: 0 },
      { emoji: '\uD83D\uDEBF', label: 'Shower', group: 0 },
      { emoji: '\uD83D\uDC54', label: 'Get dressed', group: 0 },
      { emoji: '\u2615', label: 'Breakfast', group: 0 },
      { emoji: '\uD83D\uDECF\uFE0F', label: 'Pyjamas', group: 1 },
      { emoji: '\uD83E\uDDF4', label: 'Night cream', group: 1 },
      { emoji: '\uD83D\uDCD6', label: 'Bedtime story', group: 1 },
      { emoji: '\uD83D\uDD6F\uFE0F', label: 'Candle', group: 1 },
    ],
  },
  // 7 — Pets: Cat things vs Dog things
  {
    scenarioKey: 'patientApp.stim.sortItOut.scenarios.pets',
    groupA: 'For the cat', groupAEmoji: '\uD83D\uDC31',
    groupB: 'For the dog', groupBEmoji: '\uD83D\uDC36',
    items: [
      { emoji: '\uD83D\uDC1F', label: 'Fish treats', group: 0 },
      { emoji: '\uD83E\uDEA3', label: 'Scratching post', group: 0 },
      { emoji: '\uD83E\uDEBF', label: 'Cat litter', group: 0 },
      { emoji: '\uD83D\uDCA4', label: 'Cat bed', group: 0 },
      { emoji: '\uD83E\uDD9A', label: 'Lead', group: 1 },
      { emoji: '\uD83C\uDFBE', label: 'Tennis ball', group: 1 },
      { emoji: '\uD83E\uDD9B', label: 'Bone', group: 1 },
      { emoji: '\uD83D\uDEB6', label: 'Walkies', group: 1 },
    ],
  },
  // 8 — Drinks: Hot vs Cold
  {
    scenarioKey: 'patientApp.stim.sortItOut.scenarios.drinks',
    groupA: 'Hot drinks', groupAEmoji: '\u2615',
    groupB: 'Cold drinks', groupBEmoji: '\uD83E\uDDCA',
    items: [
      { emoji: '\u2615', label: 'Tea', group: 0 },
      { emoji: '\u2615', label: 'Coffee', group: 0 },
      { emoji: '\uD83E\uDDC3', label: 'Hot chocolate', group: 0 },
      { emoji: '\uD83C\uDF75', label: 'Herbal tea', group: 0 },
      { emoji: '\uD83E\uDD64', label: 'Lemonade', group: 1 },
      { emoji: '\uD83C\uDF4A', label: 'Orange juice', group: 1 },
      { emoji: '\uD83E\uDD5B', label: 'Milkshake', group: 1 },
      { emoji: '\uD83D\uDCA7', label: 'Iced water', group: 1 },
    ],
  },
  // 9 — Activities: Rainy day vs Sunny day
  {
    scenarioKey: 'patientApp.stim.sortItOut.scenarios.activities',
    groupA: 'Rainy day', groupAEmoji: '\uD83C\uDF27\uFE0F',
    groupB: 'Sunny day', groupBEmoji: '\u2600\uFE0F',
    items: [
      { emoji: '\uD83D\uDCDA', label: 'Read a book', group: 0 },
      { emoji: '\uD83C\uDFAC', label: 'Watch a film', group: 0 },
      { emoji: '\uD83E\uDDF6', label: 'Knitting', group: 0 },
      { emoji: '\u265F\uFE0F', label: 'Board game', group: 0 },
      { emoji: '\uD83C\uDF3A', label: 'Gardening', group: 1 },
      { emoji: '\uD83D\uDEB6', label: 'Go for a walk', group: 1 },
      { emoji: '\uD83E\uDDFA', label: 'Picnic', group: 1 },
      { emoji: '\uD83C\uDFBE', label: 'Play outside', group: 1 },
    ],
  },
  // 10 — Transport: Land vs Water
  {
    scenarioKey: 'patientApp.stim.sortItOut.scenarios.transport',
    groupA: 'Land', groupAEmoji: '\uD83D\uDEE3\uFE0F',
    groupB: 'Water', groupBEmoji: '\uD83C\uDF0A',
    items: [
      { emoji: '\uD83D\uDE97', label: 'Car', group: 0 },
      { emoji: '\uD83D\uDE8C', label: 'Bus', group: 0 },
      { emoji: '\uD83D\uDE82', label: 'Train', group: 0 },
      { emoji: '\uD83D\uDEB2', label: 'Bicycle', group: 0 },
      { emoji: '\uD83D\uDEA2', label: 'Ship', group: 1 },
      { emoji: '\u26F5', label: 'Sailboat', group: 1 },
      { emoji: '\uD83D\uDEA3', label: 'Rowing boat', group: 1 },
      { emoji: '\u26F4\uFE0F', label: 'Ferry', group: 1 },
    ],
  },
  // 11 — Meals: Breakfast vs Dinner
  {
    scenarioKey: 'patientApp.stim.sortItOut.scenarios.meals',
    groupA: 'Breakfast', groupAEmoji: '\uD83C\uDF1E',
    groupB: 'Dinner', groupBEmoji: '\uD83C\uDF19',
    items: [
      { emoji: '\uD83E\uDD5A', label: 'Eggs', group: 0 },
      { emoji: '\uD83C\uDF5E', label: 'Toast', group: 0 },
      { emoji: '\uD83E\uDD63', label: 'Cereal', group: 0 },
      { emoji: '\uD83C\uDF4A', label: 'Orange juice', group: 0 },
      { emoji: '\uD83C\uDF56', label: 'Roast meat', group: 1 },
      { emoji: '\uD83E\uDD54', label: 'Potatoes', group: 1 },
      { emoji: '\uD83E\uDD57', label: 'Salad', group: 1 },
      { emoji: '\uD83C\uDF70', label: 'Pudding', group: 1 },
    ],
  },
  // 12 — Music: Instruments vs Singing
  {
    scenarioKey: 'patientApp.stim.sortItOut.scenarios.music',
    groupA: 'Instruments', groupAEmoji: '\uD83C\uDFB5',
    groupB: 'Singing', groupBEmoji: '\uD83C\uDFA4',
    items: [
      { emoji: '\uD83C\uDFB9', label: 'Piano', group: 0 },
      { emoji: '\uD83C\uDFB8', label: 'Guitar', group: 0 },
      { emoji: '\uD83C\uDFBA', label: 'Trumpet', group: 0 },
      { emoji: '\uD83E\uDE87', label: 'Drum', group: 0 },
      { emoji: '\uD83C\uDFA4', label: 'Solo singer', group: 1 },
      { emoji: '\uD83D\uDC69\u200D\uD83C\uDFA4', label: 'Pop star', group: 1 },
      { emoji: '\uD83C\uDFB6', label: 'Choir', group: 1 },
      { emoji: '\uD83D\uDC68\u200D\uD83C\uDFA4', label: 'Crooner', group: 1 },
    ],
  },
  // 13 — Seasons: Spring things vs Autumn things
  {
    scenarioKey: 'patientApp.stim.sortItOut.scenarios.seasons',
    groupA: 'Spring', groupAEmoji: '\uD83C\uDF3B',
    groupB: 'Autumn', groupBEmoji: '\uD83C\uDF42',
    items: [
      { emoji: '\uD83C\uDF38', label: 'Blossom', group: 0 },
      { emoji: '\uD83D\uDC23', label: 'Chicks', group: 0 },
      { emoji: '\uD83C\uDF37', label: 'Daffodils', group: 0 },
      { emoji: '\uD83D\uDC1D', label: 'Bees buzzing', group: 0 },
      { emoji: '\uD83C\uDF41', label: 'Falling leaves', group: 1 },
      { emoji: '\uD83C\uDF30', label: 'Conkers', group: 1 },
      { emoji: '\uD83C\uDF83', label: 'Pumpkins', group: 1 },
      { emoji: '\uD83C\uDF2C\uFE0F', label: 'Windy days', group: 1 },
    ],
  },
  // 14 — Cleaning: Kitchen cleaning vs Laundry
  {
    scenarioKey: 'patientApp.stim.sortItOut.scenarios.cleaning',
    groupA: 'Kitchen cleaning', groupAEmoji: '\uD83C\uDF73',
    groupB: 'Laundry', groupBEmoji: '\uD83E\uDDFA',
    items: [
      { emoji: '\uD83E\uDDFD', label: 'Washing-up liquid', group: 0 },
      { emoji: '\uD83E\uDDFB', label: 'Tea towel', group: 0 },
      { emoji: '\uD83E\uDDF9', label: 'Sweep floor', group: 0 },
      { emoji: '\uD83E\uDEE7', label: 'Wipe surfaces', group: 0 },
      { emoji: '\uD83E\uDDFA', label: 'Washing machine', group: 1 },
      { emoji: '\uD83D\uDC55', label: 'Clothes', group: 1 },
      { emoji: '\uD83E\uDEE7', label: 'Iron', group: 1 },
      { emoji: '\uD83E\uDDFB', label: 'Folding', group: 1 },
    ],
  },
  // 15 — Baby: Feeding vs Playtime
  {
    scenarioKey: 'patientApp.stim.sortItOut.scenarios.baby',
    groupA: 'Feeding time', groupAEmoji: '\uD83C\uDF7C',
    groupB: 'Playtime', groupBEmoji: '\uD83E\uDDF8',
    items: [
      { emoji: '\uD83C\uDF7C', label: 'Bottle', group: 0 },
      { emoji: '\uD83E\uDD63', label: 'Bowl & spoon', group: 0 },
      { emoji: '\uD83E\uDEB6', label: 'Bib', group: 0 },
      { emoji: '\uD83C\uDF4C', label: 'Mashed banana', group: 0 },
      { emoji: '\uD83E\uDDF8', label: 'Teddy bear', group: 1 },
      { emoji: '\uD83E\uDE87', label: 'Rattle', group: 1 },
      { emoji: '\uD83D\uDCD6', label: 'Picture book', group: 1 },
      { emoji: '\uD83E\uDDF1', label: 'Building blocks', group: 1 },
    ],
  },
  // 16 — Party: Food vs Decorations
  {
    scenarioKey: 'patientApp.stim.sortItOut.scenarios.party',
    groupA: 'Party food', groupAEmoji: '\uD83C\uDF70',
    groupB: 'Decorations', groupBEmoji: '\uD83C\uDF88',
    items: [
      { emoji: '\uD83C\uDF54', label: 'Sandwiches', group: 0 },
      { emoji: '\uD83C\uDF70', label: 'Birthday cake', group: 0 },
      { emoji: '\uD83E\uDD64', label: 'Fizzy drinks', group: 0 },
      { emoji: '\uD83C\uDF6C', label: 'Sweets', group: 0 },
      { emoji: '\uD83C\uDF88', label: 'Balloons', group: 1 },
      { emoji: '\uD83C\uDF89', label: 'Party poppers', group: 1 },
      { emoji: '\uD83C\uDF80', label: 'Streamers', group: 1 },
      { emoji: '\uD83C\uDF1F', label: 'Fairy lights', group: 1 },
    ],
  },
  // 17 — Toolbox: DIY vs Sewing
  {
    scenarioKey: 'patientApp.stim.sortItOut.scenarios.toolbox',
    groupA: 'DIY tools', groupAEmoji: '\uD83D\uDD28',
    groupB: 'Sewing kit', groupBEmoji: '\uD83E\uDEA1',
    items: [
      { emoji: '\uD83D\uDD28', label: 'Hammer', group: 0 },
      { emoji: '\uD83D\uDD29', label: 'Screwdriver', group: 0 },
      { emoji: '\uD83D\uDCCF', label: 'Tape measure', group: 0 },
      { emoji: '\uD83E\uDE9A', label: 'Paintbrush', group: 0 },
      { emoji: '\uD83E\uDEA1', label: 'Needle', group: 1 },
      { emoji: '\uD83E\uDDF6', label: 'Thread', group: 1 },
      { emoji: '\u2702\uFE0F', label: 'Scissors', group: 1 },
      { emoji: '\uD83E\uDEB6', label: 'Buttons', group: 1 },
    ],
  },
  // 18 — Health: Pharmacy vs First aid
  {
    scenarioKey: 'patientApp.stim.sortItOut.scenarios.health',
    groupA: 'Pharmacy', groupAEmoji: '\uD83C\uDFE5',
    groupB: 'First aid box', groupBEmoji: '\uD83E\uDE79',
    items: [
      { emoji: '\uD83D\uDC8A', label: 'Tablets', group: 0 },
      { emoji: '\uD83E\uDDF4', label: 'Cough syrup', group: 0 },
      { emoji: '\uD83E\uDDFC', label: 'Hand sanitiser', group: 0 },
      { emoji: '\uD83E\uDEB4', label: 'Vitamins', group: 0 },
      { emoji: '\uD83E\uDE79', label: 'Plaster', group: 1 },
      { emoji: '\uD83E\uDE7A', label: 'Bandage', group: 1 },
      { emoji: '\uD83E\uDDF4', label: 'Antiseptic', group: 1 },
      { emoji: '\uD83E\uDD12', label: 'Thermometer', group: 1 },
    ],
  },
  // 19 — Stationery: Office vs Art supplies
  {
    scenarioKey: 'patientApp.stim.sortItOut.scenarios.stationery',
    groupA: 'Office desk', groupAEmoji: '\uD83D\uDCBC',
    groupB: 'Art supplies', groupBEmoji: '\uD83C\uDFA8',
    items: [
      { emoji: '\u270F\uFE0F', label: 'Pencil', group: 0 },
      { emoji: '\uD83D\uDCCE', label: 'Paperclip', group: 0 },
      { emoji: '\uD83D\uDCBC', label: 'Folder', group: 0 },
      { emoji: '\uD83D\uDCC5', label: 'Calendar', group: 0 },
      { emoji: '\uD83C\uDFA8', label: 'Paint palette', group: 1 },
      { emoji: '\uD83D\uDD8C\uFE0F', label: 'Paintbrush', group: 1 },
      { emoji: '\uD83D\uDDBC\uFE0F', label: 'Canvas', group: 1 },
      { emoji: '\uD83E\uDDE3', label: 'Coloured pencils', group: 1 },
    ],
  },
  // 20 — Leisure: Quiet evening vs Social evening
  {
    scenarioKey: 'patientApp.stim.sortItOut.scenarios.leisure',
    groupA: 'Quiet evening', groupAEmoji: '\uD83D\uDD6F\uFE0F',
    groupB: 'Social evening', groupBEmoji: '\uD83C\uDF89',
    items: [
      { emoji: '\uD83D\uDCD6', label: 'Reading', group: 0 },
      { emoji: '\uD83D\uDCFA', label: 'Television', group: 0 },
      { emoji: '\uD83E\uDDF6', label: 'Crossword', group: 0 },
      { emoji: '\u2615', label: 'Cup of tea', group: 0 },
      { emoji: '\uD83C\uDFB2', label: 'Board games', group: 1 },
      { emoji: '\uD83C\uDF7D\uFE0F', label: 'Dinner party', group: 1 },
      { emoji: '\uD83D\uDC83', label: 'Dancing', group: 1 },
      { emoji: '\uD83C\uDFB5', label: 'Sing-along', group: 1 },
    ],
  },
];
