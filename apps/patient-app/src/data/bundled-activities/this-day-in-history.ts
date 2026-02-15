export interface HistoryEvent {
  year: number;
  description: string;
  emoji: string;
  discussionKeys: string[];
}

export interface ThisDayInHistoryContent {
  monthKey: string;
  events: HistoryEvent[];
}

export const THIS_DAY_IN_HISTORY_CONTENT: ThisDayInHistoryContent[] = [
  // January
  {
    monthKey: 'patientApp.stim.thisDayInHistory.months.january',
    events: [
      { year: 1901, emoji: '\uD83D\uDC51', description: 'Queen Victoria passed away, ending the longest reign in British history at the time.', discussionKeys: ['patientApp.stim.thisDayInHistory.discuss.royals', 'patientApp.stim.thisDayInHistory.discuss.changes'] },
      { year: 1926, emoji: '\uD83D\uDCFA', description: 'John Logie Baird gave the first public demonstration of television.', discussionKeys: ['patientApp.stim.thisDayInHistory.discuss.firstTV', 'patientApp.stim.thisDayInHistory.discuss.technology'] },
      { year: 1947, emoji: '\u2744\uFE0F', description: 'The great blizzard of 1947 began, one of the worst winters Britain has ever seen.', discussionKeys: ['patientApp.stim.thisDayInHistory.discuss.weather', 'patientApp.stim.thisDayInHistory.discuss.coldWinter'] },
      { year: 1965, emoji: '\uD83C\uDFB5', description: 'Winston Churchill passed away, and the nation came together to pay tribute.', discussionKeys: ['patientApp.stim.thisDayInHistory.discuss.leaders', 'patientApp.stim.thisDayInHistory.discuss.wartime'] },
      { year: 2004, emoji: '\uD83D\uDE80', description: 'NASA\'s Mars rover "Opportunity" landed on Mars and explored for 15 years.', discussionKeys: ['patientApp.stim.thisDayInHistory.discuss.space', 'patientApp.stim.thisDayInHistory.discuss.discovery'] },
    ],
  },
  // February
  {
    monthKey: 'patientApp.stim.thisDayInHistory.months.february',
    events: [
      { year: 1952, emoji: '\uD83D\uDC51', description: 'Princess Elizabeth became Queen Elizabeth II after the death of her father, King George VI.', discussionKeys: ['patientApp.stim.thisDayInHistory.discuss.royals', 'patientApp.stim.thisDayInHistory.discuss.remember'] },
      { year: 1964, emoji: '\uD83C\uDFB8', description: 'The Beatles appeared on The Ed Sullivan Show, watched by 73 million Americans.', discussionKeys: ['patientApp.stim.thisDayInHistory.discuss.music', 'patientApp.stim.thisDayInHistory.discuss.favourite'] },
      { year: 1971, emoji: '\uD83D\uDCB7', description: 'Britain switched to decimal currency — goodbye to shillings and half-crowns!', discussionKeys: ['patientApp.stim.thisDayInHistory.discuss.money', 'patientApp.stim.thisDayInHistory.discuss.changes'] },
      { year: 1990, emoji: '\u270A', description: 'Nelson Mandela was released from prison after 27 years, a moment that changed the world.', discussionKeys: ['patientApp.stim.thisDayInHistory.discuss.freedom', 'patientApp.stim.thisDayInHistory.discuss.justice'] },
      { year: 2002, emoji: '\u26F8\uFE0F', description: 'The Winter Olympics were held in Salt Lake City, with record-breaking performances.', discussionKeys: ['patientApp.stim.thisDayInHistory.discuss.sport', 'patientApp.stim.thisDayInHistory.discuss.competition'] },
    ],
  },
  // March
  {
    monthKey: 'patientApp.stim.thisDayInHistory.months.march',
    events: [
      { year: 1876, emoji: '\uD83D\uDCDE', description: 'Alexander Graham Bell made the first successful telephone call: "Mr. Watson, come here."', discussionKeys: ['patientApp.stim.thisDayInHistory.discuss.technology', 'patientApp.stim.thisDayInHistory.discuss.firstPhone'] },
      { year: 1930, emoji: '\u2693', description: 'Mahatma Gandhi began the famous Salt March, a peaceful protest that inspired millions.', discussionKeys: ['patientApp.stim.thisDayInHistory.discuss.courage', 'patientApp.stim.thisDayInHistory.discuss.peace'] },
      { year: 1966, emoji: '\u26BD', description: 'England\'s football team was preparing for the World Cup — which they went on to win!', discussionKeys: ['patientApp.stim.thisDayInHistory.discuss.sport', 'patientApp.stim.thisDayInHistory.discuss.celebration'] },
      { year: 1994, emoji: '\uD83D\uDE82', description: 'The Channel Tunnel opened, connecting Britain to France by rail for the first time.', discussionKeys: ['patientApp.stim.thisDayInHistory.discuss.travel', 'patientApp.stim.thisDayInHistory.discuss.engineering'] },
      { year: 2012, emoji: '\uD83C\uDFAC', description: 'The Encyclopaedia Britannica ended its print edition after 244 years.', discussionKeys: ['patientApp.stim.thisDayInHistory.discuss.books', 'patientApp.stim.thisDayInHistory.discuss.changes'] },
    ],
  },
  // April
  {
    monthKey: 'patientApp.stim.thisDayInHistory.months.april',
    events: [
      { year: 1912, emoji: '\uD83D\uDEA2', description: 'The RMS Titanic sank on her maiden voyage across the Atlantic.', discussionKeys: ['patientApp.stim.thisDayInHistory.discuss.ships', 'patientApp.stim.thisDayInHistory.discuss.bravery'] },
      { year: 1953, emoji: '\uD83E\uDDEC', description: 'Watson and Crick described the structure of DNA, changing science forever.', discussionKeys: ['patientApp.stim.thisDayInHistory.discuss.discovery', 'patientApp.stim.thisDayInHistory.discuss.science'] },
      { year: 1961, emoji: '\uD83D\uDE80', description: 'Yuri Gagarin became the first human in space, orbiting the Earth in 108 minutes.', discussionKeys: ['patientApp.stim.thisDayInHistory.discuss.space', 'patientApp.stim.thisDayInHistory.discuss.bravery'] },
      { year: 1981, emoji: '\uD83D\uDE80', description: 'The first Space Shuttle "Columbia" launched, beginning a new era of space travel.', discussionKeys: ['patientApp.stim.thisDayInHistory.discuss.space', 'patientApp.stim.thisDayInHistory.discuss.technology'] },
      { year: 2011, emoji: '\uD83D\uDC70', description: 'Prince William married Catherine Middleton at Westminster Abbey, watched by two billion people.', discussionKeys: ['patientApp.stim.thisDayInHistory.discuss.royals', 'patientApp.stim.thisDayInHistory.discuss.celebration'] },
    ],
  },
  // May
  {
    monthKey: 'patientApp.stim.thisDayInHistory.months.may',
    events: [
      { year: 1945, emoji: '\uD83C\uDF89', description: 'VE Day — Victory in Europe! The end of World War II in Europe was celebrated across the country.', discussionKeys: ['patientApp.stim.thisDayInHistory.discuss.wartime', 'patientApp.stim.thisDayInHistory.discuss.celebration'] },
      { year: 1953, emoji: '\u26F0\uFE0F', description: 'Edmund Hillary and Tenzing Norgay reached the summit of Mount Everest.', discussionKeys: ['patientApp.stim.thisDayInHistory.discuss.adventure', 'patientApp.stim.thisDayInHistory.discuss.bravery'] },
      { year: 1977, emoji: '\uD83C\uDFAC', description: 'Star Wars premiered in cinemas, becoming one of the most popular films ever made.', discussionKeys: ['patientApp.stim.thisDayInHistory.discuss.films', 'patientApp.stim.thisDayInHistory.discuss.favourite'] },
      { year: 1994, emoji: '\uD83D\uDE82', description: 'The Channel Tunnel officially opened between England and France.', discussionKeys: ['patientApp.stim.thisDayInHistory.discuss.travel', 'patientApp.stim.thisDayInHistory.discuss.engineering'] },
      { year: 2012, emoji: '\uD83C\uDFF7\uFE0F', description: 'The Queen\'s Diamond Jubilee celebrations began, marking 60 years on the throne.', discussionKeys: ['patientApp.stim.thisDayInHistory.discuss.royals', 'patientApp.stim.thisDayInHistory.discuss.celebration'] },
    ],
  },
  // June
  {
    monthKey: 'patientApp.stim.thisDayInHistory.months.june',
    events: [
      { year: 1944, emoji: '\u2693', description: 'D-Day — Allied forces landed on the beaches of Normandy, a turning point in the war.', discussionKeys: ['patientApp.stim.thisDayInHistory.discuss.wartime', 'patientApp.stim.thisDayInHistory.discuss.bravery'] },
      { year: 1953, emoji: '\uD83D\uDC51', description: 'The Coronation of Queen Elizabeth II was watched by millions on television.', discussionKeys: ['patientApp.stim.thisDayInHistory.discuss.royals', 'patientApp.stim.thisDayInHistory.discuss.remember'] },
      { year: 1966, emoji: '\u26BD', description: 'The 1966 FIFA World Cup began in England — and England won it!', discussionKeys: ['patientApp.stim.thisDayInHistory.discuss.sport', 'patientApp.stim.thisDayInHistory.discuss.celebration'] },
      { year: 1985, emoji: '\uD83C\uDFB5', description: 'Live Aid concert raised millions for famine relief — a moment of global unity through music.', discussionKeys: ['patientApp.stim.thisDayInHistory.discuss.music', 'patientApp.stim.thisDayInHistory.discuss.kindness'] },
      { year: 2002, emoji: '\uD83C\uDF89', description: 'The Queen\'s Golden Jubilee party was held at Buckingham Palace with a massive concert.', discussionKeys: ['patientApp.stim.thisDayInHistory.discuss.royals', 'patientApp.stim.thisDayInHistory.discuss.music'] },
    ],
  },
  // July
  {
    monthKey: 'patientApp.stim.thisDayInHistory.months.july',
    events: [
      { year: 1948, emoji: '\uD83C\uDFE5', description: 'The National Health Service (NHS) was founded — free healthcare for all.', discussionKeys: ['patientApp.stim.thisDayInHistory.discuss.health', 'patientApp.stim.thisDayInHistory.discuss.changes'] },
      { year: 1966, emoji: '\u26BD', description: 'England beat West Germany 4-2 to win the World Cup at Wembley Stadium.', discussionKeys: ['patientApp.stim.thisDayInHistory.discuss.sport', 'patientApp.stim.thisDayInHistory.discuss.celebration'] },
      { year: 1969, emoji: '\uD83C\uDF15', description: 'Neil Armstrong became the first person to walk on the Moon: "One small step for man..."', discussionKeys: ['patientApp.stim.thisDayInHistory.discuss.space', 'patientApp.stim.thisDayInHistory.discuss.remember'] },
      { year: 1981, emoji: '\uD83D\uDC70', description: 'Prince Charles married Lady Diana Spencer, watched by 750 million people worldwide.', discussionKeys: ['patientApp.stim.thisDayInHistory.discuss.royals', 'patientApp.stim.thisDayInHistory.discuss.celebration'] },
      { year: 2012, emoji: '\uD83C\uDFC5', description: 'The Olympic Games opened in London with Danny Boyle\'s spectacular ceremony.', discussionKeys: ['patientApp.stim.thisDayInHistory.discuss.sport', 'patientApp.stim.thisDayInHistory.discuss.celebration'] },
    ],
  },
  // August
  {
    monthKey: 'patientApp.stim.thisDayInHistory.months.august',
    events: [
      { year: 1926, emoji: '\uD83C\uDF0A', description: 'Gertrude Ederle became the first woman to swim across the English Channel.', discussionKeys: ['patientApp.stim.thisDayInHistory.discuss.bravery', 'patientApp.stim.thisDayInHistory.discuss.sport'] },
      { year: 1945, emoji: '\u270C\uFE0F', description: 'VJ Day — Victory over Japan, marking the end of World War II entirely.', discussionKeys: ['patientApp.stim.thisDayInHistory.discuss.wartime', 'patientApp.stim.thisDayInHistory.discuss.peace'] },
      { year: 1963, emoji: '\u270A', description: 'Martin Luther King Jr. delivered his "I Have a Dream" speech in Washington DC.', discussionKeys: ['patientApp.stim.thisDayInHistory.discuss.freedom', 'patientApp.stim.thisDayInHistory.discuss.courage'] },
      { year: 1966, emoji: '\uD83C\uDFB8', description: 'The Beatles played their last ever concert, at Candlestick Park in San Francisco.', discussionKeys: ['patientApp.stim.thisDayInHistory.discuss.music', 'patientApp.stim.thisDayInHistory.discuss.favourite'] },
      { year: 1997, emoji: '\uD83D\uDE22', description: 'Princess Diana passed away in Paris, and the whole world mourned together.', discussionKeys: ['patientApp.stim.thisDayInHistory.discuss.royals', 'patientApp.stim.thisDayInHistory.discuss.remember'] },
    ],
  },
  // September
  {
    monthKey: 'patientApp.stim.thisDayInHistory.months.september',
    events: [
      { year: 1928, emoji: '\uD83E\uDDA0', description: 'Alexander Fleming discovered penicillin, one of the most important medical breakthroughs ever.', discussionKeys: ['patientApp.stim.thisDayInHistory.discuss.science', 'patientApp.stim.thisDayInHistory.discuss.health'] },
      { year: 1939, emoji: '\uD83D\uDCFB', description: 'Britain declared war on Germany. Families gathered around their radios to hear the announcement.', discussionKeys: ['patientApp.stim.thisDayInHistory.discuss.wartime', 'patientApp.stim.thisDayInHistory.discuss.remember'] },
      { year: 1952, emoji: '\u2708\uFE0F', description: 'The world\'s first passenger jet, the de Havilland Comet, entered service with BOAC.', discussionKeys: ['patientApp.stim.thisDayInHistory.discuss.travel', 'patientApp.stim.thisDayInHistory.discuss.technology'] },
      { year: 1966, emoji: '\uD83C\uDFB6', description: 'The Beatles released "Revolver," widely considered one of the greatest albums ever.', discussionKeys: ['patientApp.stim.thisDayInHistory.discuss.music', 'patientApp.stim.thisDayInHistory.discuss.favourite'] },
      { year: 2000, emoji: '\uD83C\uDFC5', description: 'The Sydney Olympics showcased amazing athletes including Steve Redgrave\'s fifth gold medal.', discussionKeys: ['patientApp.stim.thisDayInHistory.discuss.sport', 'patientApp.stim.thisDayInHistory.discuss.achievement'] },
    ],
  },
  // October
  {
    monthKey: 'patientApp.stim.thisDayInHistory.months.october',
    events: [
      { year: 1957, emoji: '\uD83D\uDEF0\uFE0F', description: 'Sputnik, the first satellite, was launched into space by the Soviet Union.', discussionKeys: ['patientApp.stim.thisDayInHistory.discuss.space', 'patientApp.stim.thisDayInHistory.discuss.technology'] },
      { year: 1966, emoji: '\uD83C\uDFF4', description: 'The Aberfan disaster in Wales — a community came together in the face of tragedy.', discussionKeys: ['patientApp.stim.thisDayInHistory.discuss.community', 'patientApp.stim.thisDayInHistory.discuss.kindness'] },
      { year: 1973, emoji: '\uD83C\uDFF7\uFE0F', description: 'The Sydney Opera House was officially opened after 16 years of construction.', discussionKeys: ['patientApp.stim.thisDayInHistory.discuss.engineering', 'patientApp.stim.thisDayInHistory.discuss.culture'] },
      { year: 1989, emoji: '\uD83E\uDDF1', description: 'The fall of the Berlin Wall began, reuniting families who had been separated for decades.', discussionKeys: ['patientApp.stim.thisDayInHistory.discuss.freedom', 'patientApp.stim.thisDayInHistory.discuss.family'] },
      { year: 2003, emoji: '\u2708\uFE0F', description: 'Concorde made its final commercial flight, ending the era of supersonic passenger travel.', discussionKeys: ['patientApp.stim.thisDayInHistory.discuss.travel', 'patientApp.stim.thisDayInHistory.discuss.technology'] },
    ],
  },
  // November
  {
    monthKey: 'patientApp.stim.thisDayInHistory.months.november',
    events: [
      { year: 1918, emoji: '\uD83D\uDD4A\uFE0F', description: 'Armistice Day — World War I ended at the 11th hour of the 11th day of the 11th month.', discussionKeys: ['patientApp.stim.thisDayInHistory.discuss.wartime', 'patientApp.stim.thisDayInHistory.discuss.peace'] },
      { year: 1947, emoji: '\uD83D\uDC70', description: 'Princess Elizabeth married Prince Philip at Westminster Abbey.', discussionKeys: ['patientApp.stim.thisDayInHistory.discuss.royals', 'patientApp.stim.thisDayInHistory.discuss.celebration'] },
      { year: 1963, emoji: '\uD83D\uDCFA', description: 'The first episode of Doctor Who was broadcast on BBC television.', discussionKeys: ['patientApp.stim.thisDayInHistory.discuss.television', 'patientApp.stim.thisDayInHistory.discuss.favourite'] },
      { year: 1989, emoji: '\uD83E\uDDF1', description: 'The Berlin Wall officially fell, symbolising the end of the Cold War.', discussionKeys: ['patientApp.stim.thisDayInHistory.discuss.freedom', 'patientApp.stim.thisDayInHistory.discuss.changes'] },
      { year: 2003, emoji: '\uD83C\uDFC6', description: 'England won the Rugby World Cup in a dramatic final against Australia.', discussionKeys: ['patientApp.stim.thisDayInHistory.discuss.sport', 'patientApp.stim.thisDayInHistory.discuss.celebration'] },
    ],
  },
  // December
  {
    monthKey: 'patientApp.stim.thisDayInHistory.months.december',
    events: [
      { year: 1901, emoji: '\uD83D\uDCE1', description: 'Guglielmo Marconi received the first transatlantic radio signal, connecting continents.', discussionKeys: ['patientApp.stim.thisDayInHistory.discuss.technology', 'patientApp.stim.thisDayInHistory.discuss.communication'] },
      { year: 1936, emoji: '\uD83D\uDC51', description: 'King Edward VIII abdicated the throne for love, and his brother became King George VI.', discussionKeys: ['patientApp.stim.thisDayInHistory.discuss.royals', 'patientApp.stim.thisDayInHistory.discuss.love'] },
      { year: 1952, emoji: '\uD83C\uDF2B\uFE0F', description: 'The Great Smog descended on London for five days, leading to the Clean Air Act.', discussionKeys: ['patientApp.stim.thisDayInHistory.discuss.weather', 'patientApp.stim.thisDayInHistory.discuss.changes'] },
      { year: 1957, emoji: '\uD83D\uDC51', description: 'The Queen\'s first Christmas broadcast was shown on television for the very first time.', discussionKeys: ['patientApp.stim.thisDayInHistory.discuss.royals', 'patientApp.stim.thisDayInHistory.discuss.christmas'] },
      { year: 1968, emoji: '\uD83C\uDF0D', description: 'Apollo 8 astronauts orbited the Moon and took the famous "Earthrise" photograph.', discussionKeys: ['patientApp.stim.thisDayInHistory.discuss.space', 'patientApp.stim.thisDayInHistory.discuss.wonder'] },
    ],
  },
];
