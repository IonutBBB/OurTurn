export interface OddOneOutRound {
  items: { emoji: string; label: string }[];
  oddIndex: number; // index of the odd one (0-3)
  groupName: string; // what the 3 have in common
}

export interface OddOneOutContent {
  rounds: OddOneOutRound[];
}

export const ODD_ONE_OUT_CONTENT: OddOneOutContent[] = [
  // Set 1 — Fruits, Animals, Vehicles, Clothing
  {
    rounds: [
      {
        items: [
          { emoji: '🍎', label: 'Apple' },
          { emoji: '🍌', label: 'Banana' },
          { emoji: '🍇', label: 'Grapes' },
          { emoji: '🥕', label: 'Carrot' },
        ],
        oddIndex: 3,
        groupName: 'Fruits',
      },
      {
        items: [
          { emoji: '🐕', label: 'Dog' },
          { emoji: '🚗', label: 'Car' },
          { emoji: '🐈', label: 'Cat' },
          { emoji: '🐇', label: 'Rabbit' },
        ],
        oddIndex: 1,
        groupName: 'Animals',
      },
      {
        items: [
          { emoji: '🚌', label: 'Bus' },
          { emoji: '🚂', label: 'Train' },
          { emoji: '🌳', label: 'Tree' },
          { emoji: '✈️', label: 'Aeroplane' },
        ],
        oddIndex: 2,
        groupName: 'Vehicles',
      },
      {
        items: [
          { emoji: '👒', label: 'Hat' },
          { emoji: '🧤', label: 'Gloves' },
          { emoji: '🧣', label: 'Scarf' },
          { emoji: '📖', label: 'Book' },
        ],
        oddIndex: 3,
        groupName: 'Clothing',
      },
    ],
  },

  // Set 2 — Tools, Kitchen, Weather, Flowers
  {
    rounds: [
      {
        items: [
          { emoji: '🔨', label: 'Hammer' },
          { emoji: '🪛', label: 'Screwdriver' },
          { emoji: '🔧', label: 'Spanner' },
          { emoji: '🎸', label: 'Guitar' },
        ],
        oddIndex: 3,
        groupName: 'Tools',
      },
      {
        items: [
          { emoji: '🍳', label: 'Frying Pan' },
          { emoji: '⚽', label: 'Football' },
          { emoji: '🥄', label: 'Spoon' },
          { emoji: '🍽️', label: 'Plate' },
        ],
        oddIndex: 1,
        groupName: 'Kitchen items',
      },
      {
        items: [
          { emoji: '☀️', label: 'Sun' },
          { emoji: '🌧️', label: 'Rain' },
          { emoji: '❄️', label: 'Snow' },
          { emoji: '🪑', label: 'Chair' },
        ],
        oddIndex: 3,
        groupName: 'Weather',
      },
      {
        items: [
          { emoji: '🌷', label: 'Tulip' },
          { emoji: '🌻', label: 'Sunflower' },
          { emoji: '🔑', label: 'Key' },
          { emoji: '🌹', label: 'Rose' },
        ],
        oddIndex: 2,
        groupName: 'Flowers',
      },
    ],
  },

  // Set 3 — Musical instruments, Drinks, Sea creatures, Furniture
  {
    rounds: [
      {
        items: [
          { emoji: '🎹', label: 'Piano' },
          { emoji: '🎻', label: 'Violin' },
          { emoji: '🥁', label: 'Drum' },
          { emoji: '🧲', label: 'Magnet' },
        ],
        oddIndex: 3,
        groupName: 'Musical instruments',
      },
      {
        items: [
          { emoji: '☕', label: 'Coffee' },
          { emoji: '🧃', label: 'Juice' },
          { emoji: '🍵', label: 'Tea' },
          { emoji: '🧀', label: 'Cheese' },
        ],
        oddIndex: 3,
        groupName: 'Drinks',
      },
      {
        items: [
          { emoji: '🐟', label: 'Fish' },
          { emoji: '🦀', label: 'Crab' },
          { emoji: '🐙', label: 'Octopus' },
          { emoji: '🐓', label: 'Rooster' },
        ],
        oddIndex: 3,
        groupName: 'Sea creatures',
      },
      {
        items: [
          { emoji: '🪑', label: 'Chair' },
          { emoji: '🛋️', label: 'Sofa' },
          { emoji: '🛏️', label: 'Bed' },
          { emoji: '🌂', label: 'Umbrella' },
        ],
        oddIndex: 3,
        groupName: 'Furniture',
      },
    ],
  },

  // Set 4 — Birds, Vegetables, Sports, Footwear
  {
    rounds: [
      {
        items: [
          { emoji: '🦅', label: 'Eagle' },
          { emoji: '🐧', label: 'Penguin' },
          { emoji: '🦉', label: 'Owl' },
          { emoji: '🐸', label: 'Frog' },
        ],
        oddIndex: 3,
        groupName: 'Birds',
      },
      {
        items: [
          { emoji: '🥦', label: 'Broccoli' },
          { emoji: '🌽', label: 'Corn' },
          { emoji: '🥬', label: 'Lettuce' },
          { emoji: '🍰', label: 'Cake' },
        ],
        oddIndex: 3,
        groupName: 'Vegetables',
      },
      {
        items: [
          { emoji: '⚽', label: 'Football' },
          { emoji: '🎾', label: 'Tennis' },
          { emoji: '🏀', label: 'Basketball' },
          { emoji: '🎨', label: 'Painting' },
        ],
        oddIndex: 3,
        groupName: 'Sports',
      },
      {
        items: [
          { emoji: '👟', label: 'Trainer' },
          { emoji: '👢', label: 'Boot' },
          { emoji: '🩴', label: 'Flip-flop' },
          { emoji: '🎩', label: 'Top Hat' },
        ],
        oddIndex: 3,
        groupName: 'Footwear',
      },
    ],
  },

  // Set 5 — Desserts, Farm animals, Stationery, Trees
  {
    rounds: [
      {
        items: [
          { emoji: '🍦', label: 'Ice Cream' },
          { emoji: '🍩', label: 'Doughnut' },
          { emoji: '🧁', label: 'Cupcake' },
          { emoji: '🥖', label: 'Baguette' },
        ],
        oddIndex: 3,
        groupName: 'Desserts',
      },
      {
        items: [
          { emoji: '🐄', label: 'Cow' },
          { emoji: '🐖', label: 'Pig' },
          { emoji: '🐑', label: 'Sheep' },
          { emoji: '🦈', label: 'Shark' },
        ],
        oddIndex: 3,
        groupName: 'Farm animals',
      },
      {
        items: [
          { emoji: '✏️', label: 'Pencil' },
          { emoji: '📏', label: 'Ruler' },
          { emoji: '✂️', label: 'Scissors' },
          { emoji: '🔔', label: 'Bell' },
        ],
        oddIndex: 3,
        groupName: 'Stationery',
      },
      {
        items: [
          { emoji: '🌲', label: 'Pine Tree' },
          { emoji: '🌴', label: 'Palm Tree' },
          { emoji: '🍂', label: 'Oak Tree' },
          { emoji: '🏠', label: 'House' },
        ],
        oddIndex: 3,
        groupName: 'Trees',
      },
    ],
  },

  // Set 6 — Insects, Dairy, Colours, Headwear
  {
    rounds: [
      {
        items: [
          { emoji: '🐝', label: 'Bee' },
          { emoji: '🦋', label: 'Butterfly' },
          { emoji: '🐜', label: 'Ant' },
          { emoji: '🐕', label: 'Dog' },
        ],
        oddIndex: 3,
        groupName: 'Insects',
      },
      {
        items: [
          { emoji: '🥛', label: 'Milk' },
          { emoji: '🧀', label: 'Cheese' },
          { emoji: '🧈', label: 'Butter' },
          { emoji: '🍉', label: 'Watermelon' },
        ],
        oddIndex: 3,
        groupName: 'Dairy',
      },
      {
        items: [
          { emoji: '🔴', label: 'Red' },
          { emoji: '🔵', label: 'Blue' },
          { emoji: '🟢', label: 'Green' },
          { emoji: '⭐', label: 'Star' },
        ],
        oddIndex: 3,
        groupName: 'Colours',
      },
      {
        items: [
          { emoji: '🎩', label: 'Top Hat' },
          { emoji: '👑', label: 'Crown' },
          { emoji: '🧢', label: 'Cap' },
          { emoji: '🧤', label: 'Gloves' },
        ],
        oddIndex: 3,
        groupName: 'Headwear',
      },
    ],
  },

  // Set 7 — Berries, Pets, Buildings, Timepieces
  {
    rounds: [
      {
        items: [
          { emoji: '🍓', label: 'Strawberry' },
          { emoji: '🫐', label: 'Blueberry' },
          { emoji: '🍒', label: 'Cherry' },
          { emoji: '🥔', label: 'Potato' },
        ],
        oddIndex: 3,
        groupName: 'Berries',
      },
      {
        items: [
          { emoji: '🐕', label: 'Dog' },
          { emoji: '🐈', label: 'Cat' },
          { emoji: '🐹', label: 'Hamster' },
          { emoji: '🦁', label: 'Lion' },
        ],
        oddIndex: 3,
        groupName: 'Pets',
      },
      {
        items: [
          { emoji: '🏠', label: 'House' },
          { emoji: '🏢', label: 'Office' },
          { emoji: '🏥', label: 'Hospital' },
          { emoji: '🚀', label: 'Rocket' },
        ],
        oddIndex: 3,
        groupName: 'Buildings',
      },
      {
        items: [
          { emoji: '⏰', label: 'Alarm Clock' },
          { emoji: '⌚', label: 'Watch' },
          { emoji: '🕰️', label: 'Clock' },
          { emoji: '📱', label: 'Phone' },
        ],
        oddIndex: 3,
        groupName: 'Timepieces',
      },
    ],
  },

  // Set 8 — Tropical fruits, Water vehicles, Winter items, Writing tools
  {
    rounds: [
      {
        items: [
          { emoji: '🥥', label: 'Coconut' },
          { emoji: '🍍', label: 'Pineapple' },
          { emoji: '🥭', label: 'Mango' },
          { emoji: '🥦', label: 'Broccoli' },
        ],
        oddIndex: 3,
        groupName: 'Tropical fruits',
      },
      {
        items: [
          { emoji: '🚢', label: 'Ship' },
          { emoji: '⛵', label: 'Sailboat' },
          { emoji: '🛶', label: 'Canoe' },
          { emoji: '🚁', label: 'Helicopter' },
        ],
        oddIndex: 3,
        groupName: 'Water vehicles',
      },
      {
        items: [
          { emoji: '🧣', label: 'Scarf' },
          { emoji: '🧤', label: 'Gloves' },
          { emoji: '🧥', label: 'Coat' },
          { emoji: '👙', label: 'Swimsuit' },
        ],
        oddIndex: 3,
        groupName: 'Winter clothing',
      },
      {
        items: [
          { emoji: '✏️', label: 'Pencil' },
          { emoji: '🖊️', label: 'Pen' },
          { emoji: '🖍️', label: 'Crayon' },
          { emoji: '🔨', label: 'Hammer' },
        ],
        oddIndex: 3,
        groupName: 'Writing tools',
      },
    ],
  },

  // Set 9 — Garden items, Breakfast foods, Celestial bodies, Cleaning
  {
    rounds: [
      {
        items: [
          { emoji: '🌻', label: 'Sunflower' },
          { emoji: '🪴', label: 'Potted Plant' },
          { emoji: '🌿', label: 'Herb' },
          { emoji: '🔩', label: 'Bolt' },
        ],
        oddIndex: 3,
        groupName: 'Garden items',
      },
      {
        items: [
          { emoji: '🥞', label: 'Pancakes' },
          { emoji: '🍳', label: 'Fried Egg' },
          { emoji: '🥐', label: 'Croissant' },
          { emoji: '🍕', label: 'Pizza' },
        ],
        oddIndex: 3,
        groupName: 'Breakfast foods',
      },
      {
        items: [
          { emoji: '🌙', label: 'Moon' },
          { emoji: '⭐', label: 'Star' },
          { emoji: '☀️', label: 'Sun' },
          { emoji: '🏔️', label: 'Mountain' },
        ],
        oddIndex: 3,
        groupName: 'Things in the sky',
      },
      {
        items: [
          { emoji: '🧹', label: 'Broom' },
          { emoji: '🧽', label: 'Sponge' },
          { emoji: '🪣', label: 'Bucket' },
          { emoji: '🎭', label: 'Theatre Masks' },
        ],
        oddIndex: 3,
        groupName: 'Cleaning items',
      },
    ],
  },

  // Set 10 — Citrus fruits, Wild animals, Containers, Jewellery
  {
    rounds: [
      {
        items: [
          { emoji: '🍊', label: 'Orange' },
          { emoji: '🍋', label: 'Lemon' },
          { emoji: '🍈', label: 'Melon' },
          { emoji: '🥩', label: 'Steak' },
        ],
        oddIndex: 3,
        groupName: 'Fruits',
      },
      {
        items: [
          { emoji: '🐅', label: 'Tiger' },
          { emoji: '🦁', label: 'Lion' },
          { emoji: '🐻', label: 'Bear' },
          { emoji: '🐓', label: 'Rooster' },
        ],
        oddIndex: 3,
        groupName: 'Wild animals',
      },
      {
        items: [
          { emoji: '🧳', label: 'Suitcase' },
          { emoji: '🎒', label: 'Backpack' },
          { emoji: '👜', label: 'Handbag' },
          { emoji: '🪜', label: 'Ladder' },
        ],
        oddIndex: 3,
        groupName: 'Bags',
      },
      {
        items: [
          { emoji: '💍', label: 'Ring' },
          { emoji: '📿', label: 'Necklace' },
          { emoji: '👑', label: 'Crown' },
          { emoji: '🎺', label: 'Trumpet' },
        ],
        oddIndex: 3,
        groupName: 'Jewellery',
      },
    ],
  },

  // Set 11 — Land vehicles, Baked goods, Gardening tools, Baby items
  {
    rounds: [
      {
        items: [
          { emoji: '🚗', label: 'Car' },
          { emoji: '🚌', label: 'Bus' },
          { emoji: '🏍️', label: 'Motorbike' },
          { emoji: '⛵', label: 'Sailboat' },
        ],
        oddIndex: 3,
        groupName: 'Land vehicles',
      },
      {
        items: [
          { emoji: '🍞', label: 'Bread' },
          { emoji: '🥯', label: 'Bagel' },
          { emoji: '🥨', label: 'Pretzel' },
          { emoji: '🥗', label: 'Salad' },
        ],
        oddIndex: 3,
        groupName: 'Baked goods',
      },
      {
        items: [
          { emoji: '🪴', label: 'Plant Pot' },
          { emoji: '🌱', label: 'Seedling' },
          { emoji: '🧑‍🌾', label: 'Gardener' },
          { emoji: '🎯', label: 'Target' },
        ],
        oddIndex: 3,
        groupName: 'Gardening',
      },
      {
        items: [
          { emoji: '🍼', label: 'Baby Bottle' },
          { emoji: '👶', label: 'Baby' },
          { emoji: '🧸', label: 'Teddy Bear' },
          { emoji: '🔧', label: 'Spanner' },
        ],
        oddIndex: 3,
        groupName: 'Baby items',
      },
    ],
  },

  // Set 12 — Hot drinks, Dogs, Shapes, Art supplies
  {
    rounds: [
      {
        items: [
          { emoji: '☕', label: 'Coffee' },
          { emoji: '🍵', label: 'Tea' },
          { emoji: '🍫', label: 'Hot Chocolate' },
          { emoji: '🍺', label: 'Beer' },
        ],
        oddIndex: 3,
        groupName: 'Hot drinks',
      },
      {
        items: [
          { emoji: '🐩', label: 'Poodle' },
          { emoji: '🐕', label: 'Dog' },
          { emoji: '🦮', label: 'Guide Dog' },
          { emoji: '🐈', label: 'Cat' },
        ],
        oddIndex: 3,
        groupName: 'Dogs',
      },
      {
        items: [
          { emoji: '🔴', label: 'Circle' },
          { emoji: '🔷', label: 'Diamond' },
          { emoji: '🟩', label: 'Square' },
          { emoji: '🌈', label: 'Rainbow' },
        ],
        oddIndex: 3,
        groupName: 'Shapes',
      },
      {
        items: [
          { emoji: '🎨', label: 'Paint Palette' },
          { emoji: '🖌️', label: 'Paintbrush' },
          { emoji: '🖍️', label: 'Crayon' },
          { emoji: '⚙️', label: 'Gear' },
        ],
        oddIndex: 3,
        groupName: 'Art supplies',
      },
    ],
  },

  // Set 13 — Herbs, Ocean animals, Musical styles, Bathroom
  {
    rounds: [
      {
        items: [
          { emoji: '🌿', label: 'Herb' },
          { emoji: '🍃', label: 'Leaves' },
          { emoji: '🌱', label: 'Sprout' },
          { emoji: '🍖', label: 'Meat' },
        ],
        oddIndex: 3,
        groupName: 'Plants',
      },
      {
        items: [
          { emoji: '🐳', label: 'Whale' },
          { emoji: '🐬', label: 'Dolphin' },
          { emoji: '🦭', label: 'Seal' },
          { emoji: '🐘', label: 'Elephant' },
        ],
        oddIndex: 3,
        groupName: 'Ocean animals',
      },
      {
        items: [
          { emoji: '🎹', label: 'Piano' },
          { emoji: '🎸', label: 'Guitar' },
          { emoji: '🎺', label: 'Trumpet' },
          { emoji: '📺', label: 'Television' },
        ],
        oddIndex: 3,
        groupName: 'Musical instruments',
      },
      {
        items: [
          { emoji: '🛁', label: 'Bath' },
          { emoji: '🚿', label: 'Shower' },
          { emoji: '🧴', label: 'Soap' },
          { emoji: '📚', label: 'Books' },
        ],
        oddIndex: 3,
        groupName: 'Bathroom items',
      },
    ],
  },

  // Set 14 — Autumn, Italian food, Office, Camping
  {
    rounds: [
      {
        items: [
          { emoji: '🍂', label: 'Autumn Leaves' },
          { emoji: '🎃', label: 'Pumpkin' },
          { emoji: '🌰', label: 'Chestnut' },
          { emoji: '🌸', label: 'Cherry Blossom' },
        ],
        oddIndex: 3,
        groupName: 'Autumn things',
      },
      {
        items: [
          { emoji: '🍕', label: 'Pizza' },
          { emoji: '🍝', label: 'Pasta' },
          { emoji: '🥘', label: 'Risotto' },
          { emoji: '🍣', label: 'Sushi' },
        ],
        oddIndex: 3,
        groupName: 'Italian food',
      },
      {
        items: [
          { emoji: '💻', label: 'Laptop' },
          { emoji: '🖨️', label: 'Printer' },
          { emoji: '📎', label: 'Paper Clip' },
          { emoji: '🏖️', label: 'Beach' },
        ],
        oddIndex: 3,
        groupName: 'Office items',
      },
      {
        items: [
          { emoji: '⛺', label: 'Tent' },
          { emoji: '🔥', label: 'Campfire' },
          { emoji: '🎒', label: 'Backpack' },
          { emoji: '🎻', label: 'Violin' },
        ],
        oddIndex: 3,
        groupName: 'Camping',
      },
    ],
  },

  // Set 15 — Cakes, Reptiles, Space, Beach
  {
    rounds: [
      {
        items: [
          { emoji: '🎂', label: 'Birthday Cake' },
          { emoji: '🧁', label: 'Cupcake' },
          { emoji: '🍰', label: 'Cake Slice' },
          { emoji: '🌶️', label: 'Chilli Pepper' },
        ],
        oddIndex: 3,
        groupName: 'Cakes',
      },
      {
        items: [
          { emoji: '🐍', label: 'Snake' },
          { emoji: '🦎', label: 'Lizard' },
          { emoji: '🐊', label: 'Crocodile' },
          { emoji: '🐇', label: 'Rabbit' },
        ],
        oddIndex: 3,
        groupName: 'Reptiles',
      },
      {
        items: [
          { emoji: '🚀', label: 'Rocket' },
          { emoji: '🛸', label: 'Flying Saucer' },
          { emoji: '🌙', label: 'Moon' },
          { emoji: '🚲', label: 'Bicycle' },
        ],
        oddIndex: 3,
        groupName: 'Space things',
      },
      {
        items: [
          { emoji: '🏖️', label: 'Beach' },
          { emoji: '🐚', label: 'Seashell' },
          { emoji: '🩴', label: 'Flip-flop' },
          { emoji: '🎿', label: 'Skiing' },
        ],
        oddIndex: 3,
        groupName: 'Beach things',
      },
    ],
  },

  // Set 16 — Vegetables, Emergency, Sweets, Woodland animals
  {
    rounds: [
      {
        items: [
          { emoji: '🥕', label: 'Carrot' },
          { emoji: '🥒', label: 'Cucumber' },
          { emoji: '🫑', label: 'Pepper' },
          { emoji: '🍭', label: 'Lollipop' },
        ],
        oddIndex: 3,
        groupName: 'Vegetables',
      },
      {
        items: [
          { emoji: '🚒', label: 'Fire Engine' },
          { emoji: '🚑', label: 'Ambulance' },
          { emoji: '🚔', label: 'Police Car' },
          { emoji: '🛒', label: 'Shopping Trolley' },
        ],
        oddIndex: 3,
        groupName: 'Emergency vehicles',
      },
      {
        items: [
          { emoji: '🍬', label: 'Sweet' },
          { emoji: '🍭', label: 'Lollipop' },
          { emoji: '🍫', label: 'Chocolate' },
          { emoji: '🧅', label: 'Onion' },
        ],
        oddIndex: 3,
        groupName: 'Sweets',
      },
      {
        items: [
          { emoji: '🦊', label: 'Fox' },
          { emoji: '🦔', label: 'Hedgehog' },
          { emoji: '🐿️', label: 'Squirrel' },
          { emoji: '🐋', label: 'Whale' },
        ],
        oddIndex: 3,
        groupName: 'Woodland animals',
      },
    ],
  },

  // Set 17 — Balls, Flowers, Kitchen appliances, Weather
  {
    rounds: [
      {
        items: [
          { emoji: '⚽', label: 'Football' },
          { emoji: '🏀', label: 'Basketball' },
          { emoji: '🎾', label: 'Tennis Ball' },
          { emoji: '🧊', label: 'Ice Cube' },
        ],
        oddIndex: 3,
        groupName: 'Balls',
      },
      {
        items: [
          { emoji: '🌺', label: 'Hibiscus' },
          { emoji: '🌸', label: 'Cherry Blossom' },
          { emoji: '💐', label: 'Bouquet' },
          { emoji: '🍄', label: 'Mushroom' },
        ],
        oddIndex: 3,
        groupName: 'Flowers',
      },
      {
        items: [
          { emoji: '🍳', label: 'Frying Pan' },
          { emoji: '🫖', label: 'Teapot' },
          { emoji: '🥄', label: 'Spoon' },
          { emoji: '💡', label: 'Light Bulb' },
        ],
        oddIndex: 3,
        groupName: 'Kitchen items',
      },
      {
        items: [
          { emoji: '🌧️', label: 'Rain' },
          { emoji: '⛈️', label: 'Storm' },
          { emoji: '🌪️', label: 'Tornado' },
          { emoji: '🧲', label: 'Magnet' },
        ],
        oddIndex: 3,
        groupName: 'Weather',
      },
    ],
  },

  // Set 18 — Hats, Seafood, Transport, Bedroom
  {
    rounds: [
      {
        items: [
          { emoji: '🎩', label: 'Top Hat' },
          { emoji: '🧢', label: 'Cap' },
          { emoji: '👒', label: 'Sun Hat' },
          { emoji: '👞', label: 'Shoe' },
        ],
        oddIndex: 3,
        groupName: 'Hats',
      },
      {
        items: [
          { emoji: '🦐', label: 'Prawn' },
          { emoji: '🦞', label: 'Lobster' },
          { emoji: '🦀', label: 'Crab' },
          { emoji: '🐔', label: 'Chicken' },
        ],
        oddIndex: 3,
        groupName: 'Seafood',
      },
      {
        items: [
          { emoji: '🚂', label: 'Train' },
          { emoji: '🚌', label: 'Bus' },
          { emoji: '🚕', label: 'Taxi' },
          { emoji: '🏠', label: 'House' },
        ],
        oddIndex: 3,
        groupName: 'Transport',
      },
      {
        items: [
          { emoji: '🛏️', label: 'Bed' },
          { emoji: '🛌', label: 'Sleeping' },
          { emoji: '🌙', label: 'Moon' },
          { emoji: '🏈', label: 'Rugby Ball' },
        ],
        oddIndex: 3,
        groupName: 'Bedtime things',
      },
    ],
  },

  // Set 19 — Tropical, Pets, Rainy day, Celebration
  {
    rounds: [
      {
        items: [
          { emoji: '🌴', label: 'Palm Tree' },
          { emoji: '🦜', label: 'Parrot' },
          { emoji: '🐠', label: 'Tropical Fish' },
          { emoji: '❄️', label: 'Snowflake' },
        ],
        oddIndex: 3,
        groupName: 'Tropical things',
      },
      {
        items: [
          { emoji: '🐕', label: 'Dog' },
          { emoji: '🐈', label: 'Cat' },
          { emoji: '🐠', label: 'Goldfish' },
          { emoji: '🐅', label: 'Tiger' },
        ],
        oddIndex: 3,
        groupName: 'Pets',
      },
      {
        items: [
          { emoji: '☂️', label: 'Umbrella' },
          { emoji: '🌧️', label: 'Rain' },
          { emoji: '🥾', label: 'Wellington Boots' },
          { emoji: '☀️', label: 'Sun' },
        ],
        oddIndex: 3,
        groupName: 'Rainy day things',
      },
      {
        items: [
          { emoji: '🎂', label: 'Birthday Cake' },
          { emoji: '🎁', label: 'Gift' },
          { emoji: '🎈', label: 'Balloon' },
          { emoji: '📐', label: 'Protractor' },
        ],
        oddIndex: 3,
        groupName: 'Celebration things',
      },
    ],
  },

  // Set 20 — Fruits, Flying things, Round things, Warm drinks
  {
    rounds: [
      {
        items: [
          { emoji: '🍑', label: 'Peach' },
          { emoji: '🍐', label: 'Pear' },
          { emoji: '🍏', label: 'Green Apple' },
          { emoji: '🧅', label: 'Onion' },
        ],
        oddIndex: 3,
        groupName: 'Fruits',
      },
      {
        items: [
          { emoji: '🦅', label: 'Eagle' },
          { emoji: '✈️', label: 'Aeroplane' },
          { emoji: '🦋', label: 'Butterfly' },
          { emoji: '🐌', label: 'Snail' },
        ],
        oddIndex: 3,
        groupName: 'Things that fly',
      },
      {
        items: [
          { emoji: '⚽', label: 'Football' },
          { emoji: '🌍', label: 'Globe' },
          { emoji: '🍊', label: 'Orange' },
          { emoji: '📏', label: 'Ruler' },
        ],
        oddIndex: 3,
        groupName: 'Round things',
      },
      {
        items: [
          { emoji: '☕', label: 'Coffee' },
          { emoji: '🍵', label: 'Tea' },
          { emoji: '🫖', label: 'Teapot' },
          { emoji: '🧃', label: 'Juice Box' },
        ],
        oddIndex: 3,
        groupName: 'Hot drinks',
      },
    ],
  },
];
