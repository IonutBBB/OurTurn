export interface SortItem {
  emoji: string;
  label: string;
  group: 0 | 1; // which group it belongs to
}

export interface CategorySortContent {
  groupA: string; // name of first group (e.g. "Fruits")
  groupAEmoji: string;
  groupB: string; // name of second group (e.g. "Vegetables")
  groupBEmoji: string;
  items: SortItem[];
}

export const CATEGORY_SORT_CONTENT: CategorySortContent[] = [
  // 1. Fruits vs Vegetables
  {
    groupA: 'Fruits', groupAEmoji: '\uD83C\uDF4E',
    groupB: 'Vegetables', groupBEmoji: '\uD83E\uDD66',
    items: [
      { emoji: '\uD83C\uDF4C', label: 'Banana', group: 0 },
      { emoji: '\uD83C\uDF53', label: 'Strawberry', group: 0 },
      { emoji: '\uD83C\uDF4A', label: 'Orange', group: 0 },
      { emoji: '\uD83C\uDF47', label: 'Grapes', group: 0 },
      { emoji: '\uD83E\uDD55', label: 'Carrot', group: 1 },
      { emoji: '\uD83C\uDF3D', label: 'Corn', group: 1 },
      { emoji: '\uD83E\uDD52', label: 'Cucumber', group: 1 },
      { emoji: '\uD83C\uDF36\uFE0F', label: 'Pepper', group: 1 },
    ],
  },
  // 2. Animals vs Vehicles
  {
    groupA: 'Animals', groupAEmoji: '\uD83D\uDC3E',
    groupB: 'Vehicles', groupBEmoji: '\uD83D\uDE97',
    items: [
      { emoji: '\uD83D\uDC36', label: 'Dog', group: 0 },
      { emoji: '\uD83D\uDC31', label: 'Cat', group: 0 },
      { emoji: '\uD83D\uDC34', label: 'Horse', group: 0 },
      { emoji: '\uD83D\uDC07', label: 'Rabbit', group: 0 },
      { emoji: '\uD83D\uDE8C', label: 'Bus', group: 1 },
      { emoji: '\uD83D\uDE82', label: 'Train', group: 1 },
      { emoji: '\uD83D\uDEB2', label: 'Bicycle', group: 1 },
      { emoji: '\u2708\uFE0F', label: 'Aeroplane', group: 1 },
    ],
  },
  // 3. Hot vs Cold
  {
    groupA: 'Hot Things', groupAEmoji: '\uD83D\uDD25',
    groupB: 'Cold Things', groupBEmoji: '\u2744\uFE0F',
    items: [
      { emoji: '\u2615', label: 'Hot Tea', group: 0 },
      { emoji: '\uD83C\uDF1E', label: 'Sun', group: 0 },
      { emoji: '\uD83C\uDF2B\uFE0F', label: 'Campfire', group: 0 },
      { emoji: '\uD83C\uDF5C', label: 'Soup', group: 0 },
      { emoji: '\uD83C\uDF66', label: 'Ice Cream', group: 1 },
      { emoji: '\u26C4', label: 'Snowman', group: 1 },
      { emoji: '\uD83E\uDDCA', label: 'Ice Cube', group: 1 },
      { emoji: '\uD83E\uDD64', label: 'Iced Drink', group: 1 },
    ],
  },
  // 4. Land Animals vs Sea Creatures
  {
    groupA: 'Land Animals', groupAEmoji: '\uD83C\uDF33',
    groupB: 'Sea Creatures', groupBEmoji: '\uD83C\uDF0A',
    items: [
      { emoji: '\uD83D\uDC18', label: 'Elephant', group: 0 },
      { emoji: '\uD83E\uDD81', label: 'Lion', group: 0 },
      { emoji: '\uD83D\uDC2E', label: 'Cow', group: 0 },
      { emoji: '\uD83D\uDC14', label: 'Chicken', group: 0 },
      { emoji: '\uD83D\uDC1F', label: 'Fish', group: 1 },
      { emoji: '\uD83D\uDC19', label: 'Octopus', group: 1 },
      { emoji: '\uD83E\uDD80', label: 'Crab', group: 1 },
      { emoji: '\uD83D\uDC33', label: 'Whale', group: 1 },
    ],
  },
  // 5. Clothes vs Food
  {
    groupA: 'Clothes', groupAEmoji: '\uD83D\uDC55',
    groupB: 'Food', groupBEmoji: '\uD83C\uDF54',
    items: [
      { emoji: '\uD83E\uDDE5', label: 'Coat', group: 0 },
      { emoji: '\uD83D\uDC57', label: 'Dress', group: 0 },
      { emoji: '\uD83E\uDDE6', label: 'Socks', group: 0 },
      { emoji: '\uD83D\uDC5F', label: 'Shoes', group: 0 },
      { emoji: '\uD83C\uDF5E', label: 'Bread', group: 1 },
      { emoji: '\uD83E\uDDC0', label: 'Cheese', group: 1 },
      { emoji: '\uD83C\uDF55', label: 'Pizza', group: 1 },
      { emoji: '\uD83C\uDF70', label: 'Cake', group: 1 },
    ],
  },
  // 6. Furniture vs Tools
  {
    groupA: 'Furniture', groupAEmoji: '\uD83D\uDECB\uFE0F',
    groupB: 'Tools', groupBEmoji: '\uD83D\uDD27',
    items: [
      { emoji: '\uD83D\uDECB\uFE0F', label: 'Sofa', group: 0 },
      { emoji: '\uD83E\uDE91', label: 'Chair', group: 0 },
      { emoji: '\uD83D\uDECF\uFE0F', label: 'Bed', group: 0 },
      { emoji: '\uD83D\uDDC4\uFE0F', label: 'Cabinet', group: 0 },
      { emoji: '\uD83D\uDD28', label: 'Hammer', group: 1 },
      { emoji: '\uD83E\uDE9B', label: 'Screwdriver', group: 1 },
      { emoji: '\uD83D\uDD27', label: 'Wrench', group: 1 },
      { emoji: '\uD83E\uDE9A', label: 'Saw', group: 1 },
    ],
  },
  // 7. Flowers vs Trees
  {
    groupA: 'Flowers', groupAEmoji: '\uD83C\uDF3B',
    groupB: 'Trees', groupBEmoji: '\uD83C\uDF32',
    items: [
      { emoji: '\uD83C\uDF39', label: 'Rose', group: 0 },
      { emoji: '\uD83C\uDF3B', label: 'Sunflower', group: 0 },
      { emoji: '\uD83C\uDF37', label: 'Tulip', group: 0 },
      { emoji: '\uD83C\uDF3A', label: 'Hibiscus', group: 0 },
      { emoji: '\uD83C\uDF32', label: 'Pine Tree', group: 1 },
      { emoji: '\uD83C\uDF33', label: 'Oak Tree', group: 1 },
      { emoji: '\uD83C\uDF34', label: 'Palm Tree', group: 1 },
      { emoji: '\uD83C\uDF3F', label: 'Willow', group: 1 },
    ],
  },
  // 8. Breakfast vs Dinner
  {
    groupA: 'Breakfast', groupAEmoji: '\uD83C\uDF73',
    groupB: 'Dinner', groupBEmoji: '\uD83C\uDF7D\uFE0F',
    items: [
      { emoji: '\uD83E\uDD5E', label: 'Pancakes', group: 0 },
      { emoji: '\uD83E\uDD50', label: 'Croissant', group: 0 },
      { emoji: '\uD83C\uDF73', label: 'Eggs', group: 0 },
      { emoji: '\uD83E\uDD63', label: 'Cereal', group: 0 },
      { emoji: '\uD83C\uDF57', label: 'Roast Chicken', group: 1 },
      { emoji: '\uD83C\uDF5D', label: 'Pasta', group: 1 },
      { emoji: '\uD83E\uDD69', label: 'Steak', group: 1 },
      { emoji: '\uD83C\uDF72', label: 'Stew', group: 1 },
    ],
  },
  // 9. Musical Instruments vs Sports
  {
    groupA: 'Musical Instruments', groupAEmoji: '\uD83C\uDFB5',
    groupB: 'Sports', groupBEmoji: '\u26BD',
    items: [
      { emoji: '\uD83C\uDFB8', label: 'Guitar', group: 0 },
      { emoji: '\uD83C\uDFB9', label: 'Piano', group: 0 },
      { emoji: '\uD83E\uDE87', label: 'Drums', group: 0 },
      { emoji: '\uD83C\uDFBA', label: 'Trumpet', group: 0 },
      { emoji: '\u26BD', label: 'Football', group: 1 },
      { emoji: '\uD83C\uDFC0', label: 'Basketball', group: 1 },
      { emoji: '\uD83C\uDFBE', label: 'Tennis', group: 1 },
      { emoji: '\uD83C\uDFCA', label: 'Swimming', group: 1 },
    ],
  },
  // 10. Weather vs Seasons
  {
    groupA: 'Weather', groupAEmoji: '\u26C5',
    groupB: 'Seasons', groupBEmoji: '\uD83C\uDF41',
    items: [
      { emoji: '\uD83C\uDF27\uFE0F', label: 'Rain', group: 0 },
      { emoji: '\u2600\uFE0F', label: 'Sunshine', group: 0 },
      { emoji: '\uD83C\uDF28\uFE0F', label: 'Snow', group: 0 },
      { emoji: '\uD83C\uDF2A\uFE0F', label: 'Wind', group: 0 },
      { emoji: '\uD83C\uDF38', label: 'Spring', group: 1 },
      { emoji: '\uD83C\uDF3B', label: 'Summer', group: 1 },
      { emoji: '\uD83C\uDF42', label: 'Autumn', group: 1 },
      { emoji: '\u2744\uFE0F', label: 'Winter', group: 1 },
    ],
  },
  // 11. Birds vs Insects
  {
    groupA: 'Birds', groupAEmoji: '\uD83D\uDC26',
    groupB: 'Insects', groupBEmoji: '\uD83D\uDC1B',
    items: [
      { emoji: '\uD83E\uDD85', label: 'Eagle', group: 0 },
      { emoji: '\uD83E\uDD89', label: 'Owl', group: 0 },
      { emoji: '\uD83D\uDC27', label: 'Penguin', group: 0 },
      { emoji: '\uD83E\uDD9C', label: 'Parrot', group: 0 },
      { emoji: '\uD83D\uDC1D', label: 'Bee', group: 1 },
      { emoji: '\uD83E\uDD8B', label: 'Butterfly', group: 1 },
      { emoji: '\uD83D\uDC1E', label: 'Ladybird', group: 1 },
      { emoji: '\uD83E\uDD97', label: 'Cricket', group: 1 },
    ],
  },
  // 12. Kitchen Items vs Bathroom Items
  {
    groupA: 'Kitchen', groupAEmoji: '\uD83C\uDF74',
    groupB: 'Bathroom', groupBEmoji: '\uD83D\uDEC1',
    items: [
      { emoji: '\uD83C\uDF73', label: 'Frying Pan', group: 0 },
      { emoji: '\uD83D\uDD2A', label: 'Knife', group: 0 },
      { emoji: '\uD83E\uDD44', label: 'Spoon', group: 0 },
      { emoji: '\uD83C\uDF75', label: 'Teapot', group: 0 },
      { emoji: '\uD83E\uDDFC', label: 'Soap', group: 1 },
      { emoji: '\uD83E\uDDF4', label: 'Shampoo', group: 1 },
      { emoji: '\uD83E\uDE92', label: 'Toothbrush', group: 1 },
      { emoji: '\uD83D\uDEC1', label: 'Bathtub', group: 1 },
    ],
  },
  // 13. Round Things vs Square Things
  {
    groupA: 'Round Things', groupAEmoji: '\u26AA',
    groupB: 'Square Things', groupBEmoji: '\uD83D\uDFE6',
    items: [
      { emoji: '\u26BD', label: 'Ball', group: 0 },
      { emoji: '\uD83C\uDF15', label: 'Moon', group: 0 },
      { emoji: '\uD83C\uDF55', label: 'Pizza', group: 0 },
      { emoji: '\u23F0', label: 'Clock', group: 0 },
      { emoji: '\uD83D\uDCFA', label: 'Television', group: 1 },
      { emoji: '\uD83D\uDDBC\uFE0F', label: 'Picture Frame', group: 1 },
      { emoji: '\uD83D\uDCE6', label: 'Box', group: 1 },
      { emoji: '\uD83D\uDCD6', label: 'Book', group: 1 },
    ],
  },
  // 14. Things That Fly vs Things That Swim
  {
    groupA: 'Things That Fly', groupAEmoji: '\uD83E\uDD85',
    groupB: 'Things That Swim', groupBEmoji: '\uD83D\uDC20',
    items: [
      { emoji: '\u2708\uFE0F', label: 'Aeroplane', group: 0 },
      { emoji: '\uD83E\uDD87', label: 'Bat', group: 0 },
      { emoji: '\uD83E\uDD85', label: 'Eagle', group: 0 },
      { emoji: '\uD83C\uDF88', label: 'Balloon', group: 0 },
      { emoji: '\uD83D\uDC2C', label: 'Dolphin', group: 1 },
      { emoji: '\uD83E\uDD88', label: 'Shark', group: 1 },
      { emoji: '\uD83D\uDC22', label: 'Turtle', group: 1 },
      { emoji: '\uD83D\uDC1F', label: 'Fish', group: 1 },
    ],
  },
  // 15. Things in a Garden vs Things in a Kitchen
  {
    groupA: 'Garden', groupAEmoji: '\uD83C\uDF3B',
    groupB: 'Kitchen', groupBEmoji: '\uD83C\uDF73',
    items: [
      { emoji: '\uD83C\uDF39', label: 'Rose', group: 0 },
      { emoji: '\uD83E\uDE74', label: 'Watering Can', group: 0 },
      { emoji: '\uD83D\uDC1B', label: 'Caterpillar', group: 0 },
      { emoji: '\uD83C\uDF3F', label: 'Herb', group: 0 },
      { emoji: '\uD83C\uDF72', label: 'Pot', group: 1 },
      { emoji: '\uD83E\uDD44', label: 'Spoon', group: 1 },
      { emoji: '\uD83E\uDDC1', label: 'Cupcake', group: 1 },
      { emoji: '\uD83E\uDD62', label: 'Chopsticks', group: 1 },
    ],
  },
  // 16. Day vs Night
  {
    groupA: 'Daytime', groupAEmoji: '\u2600\uFE0F',
    groupB: 'Night-time', groupBEmoji: '\uD83C\uDF19',
    items: [
      { emoji: '\u2600\uFE0F', label: 'Sunshine', group: 0 },
      { emoji: '\uD83C\uDF08', label: 'Rainbow', group: 0 },
      { emoji: '\uD83E\uDD8B', label: 'Butterfly', group: 0 },
      { emoji: '\uD83C\uDFD6\uFE0F', label: 'Beach', group: 0 },
      { emoji: '\uD83C\uDF19', label: 'Moon', group: 1 },
      { emoji: '\u2B50', label: 'Stars', group: 1 },
      { emoji: '\uD83E\uDD89', label: 'Owl', group: 1 },
      { emoji: '\uD83D\uDCA4', label: 'Sleeping', group: 1 },
    ],
  },
  // 17. Soft Things vs Hard Things
  {
    groupA: 'Soft Things', groupAEmoji: '\u2601\uFE0F',
    groupB: 'Hard Things', groupBEmoji: '\uD83E\uDEA8',
    items: [
      { emoji: '\uD83E\uDDF8', label: 'Teddy Bear', group: 0 },
      { emoji: '\uD83D\uDECF\uFE0F', label: 'Pillow', group: 0 },
      { emoji: '\uD83E\uDDE3', label: 'Scarf', group: 0 },
      { emoji: '\u2601\uFE0F', label: 'Cloud', group: 0 },
      { emoji: '\uD83E\uDEA8', label: 'Rock', group: 1 },
      { emoji: '\uD83D\uDD11', label: 'Key', group: 1 },
      { emoji: '\uD83E\uDE99', label: 'Coin', group: 1 },
      { emoji: '\uD83D\uDC8E', label: 'Diamond', group: 1 },
    ],
  },
  // 18. Drinks vs Desserts
  {
    groupA: 'Drinks', groupAEmoji: '\uD83E\uDD64',
    groupB: 'Desserts', groupBEmoji: '\uD83C\uDF70',
    items: [
      { emoji: '\u2615', label: 'Coffee', group: 0 },
      { emoji: '\uD83C\uDF75', label: 'Tea', group: 0 },
      { emoji: '\uD83E\uDD5B', label: 'Milk', group: 0 },
      { emoji: '\uD83E\uDDC3', label: 'Juice', group: 0 },
      { emoji: '\uD83C\uDF66', label: 'Ice Cream', group: 1 },
      { emoji: '\uD83C\uDF6B', label: 'Chocolate', group: 1 },
      { emoji: '\uD83C\uDF69', label: 'Doughnut', group: 1 },
      { emoji: '\uD83E\uDD67', label: 'Pie', group: 1 },
    ],
  },
  // 19. Things with Wheels vs Things with Wings
  {
    groupA: 'Has Wheels', groupAEmoji: '\uD83D\uDEDE',
    groupB: 'Has Wings', groupBEmoji: '\uD83E\uDD85',
    items: [
      { emoji: '\uD83D\uDE97', label: 'Car', group: 0 },
      { emoji: '\uD83D\uDEB2', label: 'Bicycle', group: 0 },
      { emoji: '\uD83D\uDE8C', label: 'Bus', group: 0 },
      { emoji: '\uD83D\uDEF4', label: 'Scooter', group: 0 },
      { emoji: '\uD83D\uDC26', label: 'Bird', group: 1 },
      { emoji: '\uD83E\uDD8B', label: 'Butterfly', group: 1 },
      { emoji: '\uD83D\uDC1D', label: 'Bee', group: 1 },
      { emoji: '\uD83E\uDD87', label: 'Bat', group: 1 },
    ],
  },
  // 20. At the Beach vs In the Mountains
  {
    groupA: 'Beach', groupAEmoji: '\uD83C\uDFD6\uFE0F',
    groupB: 'Mountains', groupBEmoji: '\u26F0\uFE0F',
    items: [
      { emoji: '\uD83C\uDFC4', label: 'Surfing', group: 0 },
      { emoji: '\uD83D\uDC1A', label: 'Seashell', group: 0 },
      { emoji: '\uD83E\uDE76', label: 'Sandcastle', group: 0 },
      { emoji: '\uD83C\uDF0A', label: 'Waves', group: 0 },
      { emoji: '\u26F7\uFE0F', label: 'Skiing', group: 1 },
      { emoji: '\uD83C\uDFD4\uFE0F', label: 'Mountain', group: 1 },
      { emoji: '\uD83E\uDDD7', label: 'Climbing', group: 1 },
      { emoji: '\uD83C\uDF32', label: 'Pine Forest', group: 1 },
    ],
  },
];
