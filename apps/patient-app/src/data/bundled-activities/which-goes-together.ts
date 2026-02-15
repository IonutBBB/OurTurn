export interface WhichGoesTogetherRound {
  target: { emoji: string; label: string };
  options: { emoji: string; label: string }[];
  correctIndex: number;
}

export interface WhichGoesTogetherContent {
  rounds: WhichGoesTogetherRound[];
}

export const WHICH_GOES_TOGETHER_CONTENT: WhichGoesTogetherContent[] = [
  // Set 1
  {
    rounds: [
      { target: { emoji: '🔑', label: 'Key' }, options: [{ emoji: '🔒', label: 'Lock' }, { emoji: '🎸', label: 'Guitar' }, { emoji: '🌻', label: 'Sunflower' }], correctIndex: 0 },
      { target: { emoji: '🧵', label: 'Thread' }, options: [{ emoji: '🔨', label: 'Hammer' }, { emoji: '🪡', label: 'Needle' }, { emoji: '🍎', label: 'Apple' }], correctIndex: 1 },
      { target: { emoji: '☕', label: 'Cup' }, options: [{ emoji: '🎈', label: 'Balloon' }, { emoji: '📚', label: 'Books' }, { emoji: '☕', label: 'Saucer' }], correctIndex: 2 },
      { target: { emoji: '✉️', label: 'Letter' }, options: [{ emoji: '📮', label: 'Postbox' }, { emoji: '🎹', label: 'Piano' }, { emoji: '🐕', label: 'Dog' }], correctIndex: 0 },
    ],
  },
  // Set 2
  {
    rounds: [
      { target: { emoji: '🍞', label: 'Bread' }, options: [{ emoji: '🔧', label: 'Spanner' }, { emoji: '🧈', label: 'Butter' }, { emoji: '🎨', label: 'Paint' }], correctIndex: 1 },
      { target: { emoji: '🪥', label: 'Toothbrush' }, options: [{ emoji: '🪒', label: 'Razor' }, { emoji: '🧴', label: 'Toothpaste' }, { emoji: '🔑', label: 'Key' }], correctIndex: 1 },
      { target: { emoji: '👟', label: 'Shoe' }, options: [{ emoji: '🧦', label: 'Sock' }, { emoji: '🎩', label: 'Top Hat' }, { emoji: '🧤', label: 'Gloves' }], correctIndex: 0 },
      { target: { emoji: '🔨', label: 'Hammer' }, options: [{ emoji: '🍌', label: 'Banana' }, { emoji: '📱', label: 'Phone' }, { emoji: '🪛', label: 'Nail' }], correctIndex: 2 },
    ],
  },
  // Set 3
  {
    rounds: [
      { target: { emoji: '🎣', label: 'Fishing Rod' }, options: [{ emoji: '🐟', label: 'Fish' }, { emoji: '🐕', label: 'Dog' }, { emoji: '🎸', label: 'Guitar' }], correctIndex: 0 },
      { target: { emoji: '✂️', label: 'Scissors' }, options: [{ emoji: '🔧', label: 'Spanner' }, { emoji: '📄', label: 'Paper' }, { emoji: '🍕', label: 'Pizza' }], correctIndex: 1 },
      { target: { emoji: '🌧️', label: 'Rain' }, options: [{ emoji: '☂️', label: 'Umbrella' }, { emoji: '🎸', label: 'Guitar' }, { emoji: '🍰', label: 'Cake' }], correctIndex: 0 },
      { target: { emoji: '📖', label: 'Book' }, options: [{ emoji: '🎈', label: 'Balloon' }, { emoji: '🏠', label: 'House' }, { emoji: '🔖', label: 'Bookmark' }], correctIndex: 2 },
    ],
  },
  // Set 4
  {
    rounds: [
      { target: { emoji: '🖊️', label: 'Pen' }, options: [{ emoji: '📝', label: 'Notepad' }, { emoji: '🍎', label: 'Apple' }, { emoji: '🚗', label: 'Car' }], correctIndex: 0 },
      { target: { emoji: '🫖', label: 'Teapot' }, options: [{ emoji: '🔨', label: 'Hammer' }, { emoji: '🍵', label: 'Teacup' }, { emoji: '🌺', label: 'Flower' }], correctIndex: 1 },
      { target: { emoji: '🧤', label: 'Gloves' }, options: [{ emoji: '🧣', label: 'Scarf' }, { emoji: '📱', label: 'Phone' }, { emoji: '🎸', label: 'Guitar' }], correctIndex: 0 },
      { target: { emoji: '🕯️', label: 'Candle' }, options: [{ emoji: '📚', label: 'Books' }, { emoji: '🔥', label: 'Match' }, { emoji: '🐟', label: 'Fish' }], correctIndex: 1 },
    ],
  },
  // Set 5
  {
    rounds: [
      { target: { emoji: '🪣', label: 'Bucket' }, options: [{ emoji: '🎸', label: 'Guitar' }, { emoji: '🏖️', label: 'Spade' }, { emoji: '📖', label: 'Book' }], correctIndex: 1 },
      { target: { emoji: '🍳', label: 'Frying Pan' }, options: [{ emoji: '🥚', label: 'Egg' }, { emoji: '📮', label: 'Postbox' }, { emoji: '🎈', label: 'Balloon' }], correctIndex: 0 },
      { target: { emoji: '🪴', label: 'Plant' }, options: [{ emoji: '🚗', label: 'Car' }, { emoji: '💧', label: 'Water' }, { emoji: '🔨', label: 'Hammer' }], correctIndex: 1 },
      { target: { emoji: '📷', label: 'Camera' }, options: [{ emoji: '🖼️', label: 'Photo' }, { emoji: '🍕', label: 'Pizza' }, { emoji: '🔑', label: 'Key' }], correctIndex: 0 },
    ],
  },
  // Set 6
  {
    rounds: [
      { target: { emoji: '🎹', label: 'Piano' }, options: [{ emoji: '🎵', label: 'Music' }, { emoji: '🍰', label: 'Cake' }, { emoji: '✈️', label: 'Plane' }], correctIndex: 0 },
      { target: { emoji: '🩺', label: 'Stethoscope' }, options: [{ emoji: '🎸', label: 'Guitar' }, { emoji: '👨‍⚕️', label: 'Doctor' }, { emoji: '🏖️', label: 'Beach' }], correctIndex: 1 },
      { target: { emoji: '🧲', label: 'Magnet' }, options: [{ emoji: '📄', label: 'Paper' }, { emoji: '🪵', label: 'Wood' }, { emoji: '🔩', label: 'Metal' }], correctIndex: 2 },
      { target: { emoji: '🎒', label: 'Backpack' }, options: [{ emoji: '🏫', label: 'School' }, { emoji: '🍕', label: 'Pizza' }, { emoji: '🔧', label: 'Spanner' }], correctIndex: 0 },
    ],
  },
  // Set 7
  {
    rounds: [
      { target: { emoji: '🧹', label: 'Broom' }, options: [{ emoji: '🧽', label: 'Dustpan' }, { emoji: '🎸', label: 'Guitar' }, { emoji: '🚗', label: 'Car' }], correctIndex: 0 },
      { target: { emoji: '🧊', label: 'Ice' }, options: [{ emoji: '🌋', label: 'Volcano' }, { emoji: '❄️', label: 'Snowflake' }, { emoji: '🌺', label: 'Flower' }], correctIndex: 1 },
      { target: { emoji: '🎂', label: 'Birthday Cake' }, options: [{ emoji: '🔨', label: 'Hammer' }, { emoji: '📮', label: 'Postbox' }, { emoji: '🕯️', label: 'Candles' }], correctIndex: 2 },
      { target: { emoji: '👓', label: 'Glasses' }, options: [{ emoji: '👀', label: 'Eyes' }, { emoji: '🦶', label: 'Foot' }, { emoji: '🖐️', label: 'Hand' }], correctIndex: 0 },
    ],
  },
  // Set 8
  {
    rounds: [
      { target: { emoji: '🪜', label: 'Ladder' }, options: [{ emoji: '🎸', label: 'Guitar' }, { emoji: '🏠', label: 'Roof' }, { emoji: '🍎', label: 'Apple' }], correctIndex: 1 },
      { target: { emoji: '🔔', label: 'Bell' }, options: [{ emoji: '⛪', label: 'Church' }, { emoji: '🏖️', label: 'Beach' }, { emoji: '🚗', label: 'Car' }], correctIndex: 0 },
      { target: { emoji: '🏹', label: 'Bow' }, options: [{ emoji: '🍕', label: 'Pizza' }, { emoji: '🎯', label: 'Arrow' }, { emoji: '📱', label: 'Phone' }], correctIndex: 1 },
      { target: { emoji: '🧶', label: 'Wool' }, options: [{ emoji: '🪡', label: 'Knitting Needles' }, { emoji: '🔧', label: 'Spanner' }, { emoji: '🎈', label: 'Balloon' }], correctIndex: 0 },
    ],
  },
  // Set 9
  {
    rounds: [
      { target: { emoji: '⛽', label: 'Petrol Pump' }, options: [{ emoji: '🎸', label: 'Guitar' }, { emoji: '🚗', label: 'Car' }, { emoji: '🌺', label: 'Flower' }], correctIndex: 1 },
      { target: { emoji: '🪥', label: 'Brush' }, options: [{ emoji: '💇', label: 'Hair' }, { emoji: '🍕', label: 'Pizza' }, { emoji: '📱', label: 'Phone' }], correctIndex: 0 },
      { target: { emoji: '🎿', label: 'Skis' }, options: [{ emoji: '🏖️', label: 'Beach' }, { emoji: '🌺', label: 'Flower' }, { emoji: '❄️', label: 'Snow' }], correctIndex: 2 },
      { target: { emoji: '🧊', label: 'Ice Cube' }, options: [{ emoji: '🥤', label: 'Cold Drink' }, { emoji: '🔥', label: 'Fire' }, { emoji: '☀️', label: 'Sun' }], correctIndex: 0 },
    ],
  },
  // Set 10
  {
    rounds: [
      { target: { emoji: '🪟', label: 'Window' }, options: [{ emoji: '🏖️', label: 'Beach' }, { emoji: '🪞', label: 'Curtain' }, { emoji: '🍕', label: 'Pizza' }], correctIndex: 1 },
      { target: { emoji: '🍯', label: 'Honey' }, options: [{ emoji: '🐝', label: 'Bee' }, { emoji: '🐕', label: 'Dog' }, { emoji: '🎸', label: 'Guitar' }], correctIndex: 0 },
      { target: { emoji: '🔦', label: 'Torch' }, options: [{ emoji: '🌞', label: 'Sunshine' }, { emoji: '🌙', label: 'Dark' }, { emoji: '🍰', label: 'Cake' }], correctIndex: 1 },
      { target: { emoji: '🧲', label: 'Compass' }, options: [{ emoji: '🗺️', label: 'Map' }, { emoji: '🍕', label: 'Pizza' }, { emoji: '🎸', label: 'Guitar' }], correctIndex: 0 },
    ],
  },
  // Set 11
  {
    rounds: [
      { target: { emoji: '🧅', label: 'Onion' }, options: [{ emoji: '😢', label: 'Tears' }, { emoji: '😊', label: 'Smile' }, { emoji: '🎸', label: 'Guitar' }], correctIndex: 0 },
      { target: { emoji: '⚓', label: 'Anchor' }, options: [{ emoji: '🚗', label: 'Car' }, { emoji: '🚢', label: 'Ship' }, { emoji: '✈️', label: 'Plane' }], correctIndex: 1 },
      { target: { emoji: '🎭', label: 'Masks' }, options: [{ emoji: '🏟️', label: 'Theatre' }, { emoji: '🏖️', label: 'Beach' }, { emoji: '🏔️', label: 'Mountain' }], correctIndex: 0 },
      { target: { emoji: '📺', label: 'Television' }, options: [{ emoji: '🔨', label: 'Hammer' }, { emoji: '🎮', label: 'Remote' }, { emoji: '🍕', label: 'Pizza' }], correctIndex: 1 },
    ],
  },
  // Set 12
  {
    rounds: [
      { target: { emoji: '🧪', label: 'Test Tube' }, options: [{ emoji: '🔬', label: 'Microscope' }, { emoji: '🎸', label: 'Guitar' }, { emoji: '🍎', label: 'Apple' }], correctIndex: 0 },
      { target: { emoji: '🪵', label: 'Log' }, options: [{ emoji: '🏖️', label: 'Beach' }, { emoji: '🔥', label: 'Fireplace' }, { emoji: '📱', label: 'Phone' }], correctIndex: 1 },
      { target: { emoji: '🏀', label: 'Basketball' }, options: [{ emoji: '🏊', label: 'Pool' }, { emoji: '🎸', label: 'Guitar' }, { emoji: '🏀', label: 'Hoop' }], correctIndex: 2 },
      { target: { emoji: '🧲', label: 'Magnet' }, options: [{ emoji: '📄', label: 'Paper' }, { emoji: '🧲', label: 'Fridge' }, { emoji: '🌺', label: 'Flower' }], correctIndex: 1 },
    ],
  },
  // Set 13
  {
    rounds: [
      { target: { emoji: '🗝️', label: 'Old Key' }, options: [{ emoji: '🏰', label: 'Castle' }, { emoji: '🍕', label: 'Pizza' }, { emoji: '🎸', label: 'Guitar' }], correctIndex: 0 },
      { target: { emoji: '🪴', label: 'Plant' }, options: [{ emoji: '🔧', label: 'Spanner' }, { emoji: '🌞', label: 'Sunlight' }, { emoji: '🍕', label: 'Pizza' }], correctIndex: 1 },
      { target: { emoji: '🩹', label: 'Plaster' }, options: [{ emoji: '🎸', label: 'Guitar' }, { emoji: '🏖️', label: 'Beach' }, { emoji: '🤕', label: 'Cut' }], correctIndex: 2 },
      { target: { emoji: '👑', label: 'Crown' }, options: [{ emoji: '🏰', label: 'King' }, { emoji: '🍕', label: 'Pizza' }, { emoji: '🔧', label: 'Spanner' }], correctIndex: 0 },
    ],
  },
  // Set 14
  {
    rounds: [
      { target: { emoji: '🧳', label: 'Suitcase' }, options: [{ emoji: '✈️', label: 'Holiday' }, { emoji: '🔧', label: 'Spanner' }, { emoji: '🎸', label: 'Guitar' }], correctIndex: 0 },
      { target: { emoji: '🔔', label: 'Door Bell' }, options: [{ emoji: '🍕', label: 'Pizza' }, { emoji: '🏠', label: 'Front Door' }, { emoji: '🎸', label: 'Guitar' }], correctIndex: 1 },
      { target: { emoji: '🎣', label: 'Rod' }, options: [{ emoji: '🏖️', label: 'Beach' }, { emoji: '🐛', label: 'Worm' }, { emoji: '🔧', label: 'Spanner' }], correctIndex: 1 },
      { target: { emoji: '🫗', label: 'Jug' }, options: [{ emoji: '🎸', label: 'Guitar' }, { emoji: '🍕', label: 'Pizza' }, { emoji: '🥛', label: 'Milk' }], correctIndex: 2 },
    ],
  },
  // Set 15
  {
    rounds: [
      { target: { emoji: '🧑‍🍳', label: 'Chef' }, options: [{ emoji: '🍳', label: 'Kitchen' }, { emoji: '✈️', label: 'Plane' }, { emoji: '🎸', label: 'Guitar' }], correctIndex: 0 },
      { target: { emoji: '🌂', label: 'Umbrella' }, options: [{ emoji: '☀️', label: 'Sun' }, { emoji: '🌧️', label: 'Rain' }, { emoji: '❄️', label: 'Snow' }], correctIndex: 1 },
      { target: { emoji: '📻', label: 'Radio' }, options: [{ emoji: '🎶', label: 'Music' }, { emoji: '🍕', label: 'Pizza' }, { emoji: '🔧', label: 'Spanner' }], correctIndex: 0 },
      { target: { emoji: '🔩', label: 'Bolt' }, options: [{ emoji: '🍎', label: 'Apple' }, { emoji: '🎸', label: 'Guitar' }, { emoji: '🔧', label: 'Spanner' }], correctIndex: 2 },
    ],
  },
  // Set 16
  {
    rounds: [
      { target: { emoji: '🧽', label: 'Sponge' }, options: [{ emoji: '🧴', label: 'Soap' }, { emoji: '🎸', label: 'Guitar' }, { emoji: '✈️', label: 'Plane' }], correctIndex: 0 },
      { target: { emoji: '🎤', label: 'Microphone' }, options: [{ emoji: '🍕', label: 'Pizza' }, { emoji: '🎵', label: 'Singer' }, { emoji: '🔧', label: 'Spanner' }], correctIndex: 1 },
      { target: { emoji: '📫', label: 'Letterbox' }, options: [{ emoji: '🎸', label: 'Guitar' }, { emoji: '🍎', label: 'Apple' }, { emoji: '📬', label: 'Postman' }], correctIndex: 2 },
      { target: { emoji: '🧯', label: 'Fire Extinguisher' }, options: [{ emoji: '🔥', label: 'Fire' }, { emoji: '💧', label: 'Water' }, { emoji: '🍕', label: 'Pizza' }], correctIndex: 0 },
    ],
  },
  // Set 17
  {
    rounds: [
      { target: { emoji: '🎈', label: 'Balloon' }, options: [{ emoji: '🎉', label: 'Party' }, { emoji: '🔧', label: 'Spanner' }, { emoji: '📚', label: 'Books' }], correctIndex: 0 },
      { target: { emoji: '🏆', label: 'Trophy' }, options: [{ emoji: '🍕', label: 'Pizza' }, { emoji: '🥇', label: 'Winner' }, { emoji: '🎸', label: 'Guitar' }], correctIndex: 1 },
      { target: { emoji: '🗑️', label: 'Bin' }, options: [{ emoji: '🎸', label: 'Guitar' }, { emoji: '📄', label: 'Rubbish' }, { emoji: '🍎', label: 'Apple' }], correctIndex: 1 },
      { target: { emoji: '🧊', label: 'Ice' }, options: [{ emoji: '☀️', label: 'Sun' }, { emoji: '🌺', label: 'Flower' }, { emoji: '🥶', label: 'Cold' }], correctIndex: 2 },
    ],
  },
  // Set 18
  {
    rounds: [
      { target: { emoji: '🛁', label: 'Bath' }, options: [{ emoji: '🧴', label: 'Soap' }, { emoji: '🎸', label: 'Guitar' }, { emoji: '📚', label: 'Books' }], correctIndex: 0 },
      { target: { emoji: '🌾', label: 'Wheat' }, options: [{ emoji: '🍞', label: 'Bread' }, { emoji: '🍕', label: 'Pizza' }, { emoji: '🎸', label: 'Guitar' }], correctIndex: 0 },
      { target: { emoji: '🎪', label: 'Circus Tent' }, options: [{ emoji: '🔧', label: 'Spanner' }, { emoji: '🤡', label: 'Clown' }, { emoji: '📚', label: 'Books' }], correctIndex: 1 },
      { target: { emoji: '🪥', label: 'Toothbrush' }, options: [{ emoji: '🎸', label: 'Guitar' }, { emoji: '🍕', label: 'Pizza' }, { emoji: '😁', label: 'Teeth' }], correctIndex: 2 },
    ],
  },
  // Set 19
  {
    rounds: [
      { target: { emoji: '📞', label: 'Phone' }, options: [{ emoji: '🗣️', label: 'Talking' }, { emoji: '🔧', label: 'Spanner' }, { emoji: '🎸', label: 'Guitar' }], correctIndex: 0 },
      { target: { emoji: '⏰', label: 'Alarm Clock' }, options: [{ emoji: '🍕', label: 'Pizza' }, { emoji: '🛏️', label: 'Bed' }, { emoji: '🎸', label: 'Guitar' }], correctIndex: 1 },
      { target: { emoji: '🪴', label: 'Flower Pot' }, options: [{ emoji: '🔧', label: 'Spanner' }, { emoji: '🎸', label: 'Guitar' }, { emoji: '🌱', label: 'Seed' }], correctIndex: 2 },
      { target: { emoji: '🧵', label: 'Thread' }, options: [{ emoji: '👔', label: 'Button' }, { emoji: '🍕', label: 'Pizza' }, { emoji: '🔧', label: 'Spanner' }], correctIndex: 0 },
    ],
  },
  // Set 20
  {
    rounds: [
      { target: { emoji: '📸', label: 'Photo' }, options: [{ emoji: '🖼️', label: 'Frame' }, { emoji: '🎸', label: 'Guitar' }, { emoji: '🍕', label: 'Pizza' }], correctIndex: 0 },
      { target: { emoji: '🪑', label: 'Chair' }, options: [{ emoji: '🍕', label: 'Pizza' }, { emoji: '🪵', label: 'Table' }, { emoji: '🎸', label: 'Guitar' }], correctIndex: 1 },
      { target: { emoji: '👒', label: 'Hat' }, options: [{ emoji: '🔧', label: 'Spanner' }, { emoji: '🍕', label: 'Pizza' }, { emoji: '☀️', label: 'Sunshine' }], correctIndex: 2 },
      { target: { emoji: '🕶️', label: 'Sunglasses' }, options: [{ emoji: '☀️', label: 'Sun' }, { emoji: '🌧️', label: 'Rain' }, { emoji: '❄️', label: 'Snow' }], correctIndex: 0 },
    ],
  },
];
