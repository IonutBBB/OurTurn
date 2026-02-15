export interface CoinCountingRound {
  coins: { label: string; value: number }[];
  correctTotal: string;
  options: string[];
  correctIndex: number;
}

export interface CoinCountingContent {
  rounds: CoinCountingRound[];
}

export const COIN_COUNTING_CONTENT: CoinCountingContent[] = [
  // Set 1
  {
    rounds: [
      { coins: [{ label: '10p', value: 10 }, { label: '5p', value: 5 }], correctTotal: '15p', options: ['10p', '15p', '20p'], correctIndex: 1 },
      { coins: [{ label: '20p', value: 20 }, { label: '10p', value: 10 }], correctTotal: '30p', options: ['25p', '30p', '35p'], correctIndex: 1 },
      { coins: [{ label: '50p', value: 50 }, { label: '20p', value: 20 }, { label: '10p', value: 10 }], correctTotal: '80p', options: ['70p', '80p', '90p'], correctIndex: 1 },
      { coins: [{ label: '£1', value: 100 }, { label: '50p', value: 50 }], correctTotal: '£1.50', options: ['£1.20', '£1.50', '£2.00'], correctIndex: 1 },
    ],
  },
  // Set 2
  {
    rounds: [
      { coins: [{ label: '5p', value: 5 }, { label: '5p', value: 5 }], correctTotal: '10p', options: ['5p', '10p', '15p'], correctIndex: 1 },
      { coins: [{ label: '20p', value: 20 }, { label: '20p', value: 20 }], correctTotal: '40p', options: ['30p', '40p', '50p'], correctIndex: 1 },
      { coins: [{ label: '50p', value: 50 }, { label: '50p', value: 50 }], correctTotal: '£1.00', options: ['80p', '£1.00', '£1.50'], correctIndex: 1 },
      { coins: [{ label: '£1', value: 100 }, { label: '20p', value: 20 }, { label: '5p', value: 5 }], correctTotal: '£1.25', options: ['£1.15', '£1.25', '£1.35'], correctIndex: 1 },
    ],
  },
  // Set 3
  {
    rounds: [
      { coins: [{ label: '10p', value: 10 }, { label: '10p', value: 10 }], correctTotal: '20p', options: ['15p', '20p', '25p'], correctIndex: 1 },
      { coins: [{ label: '50p', value: 50 }, { label: '10p', value: 10 }], correctTotal: '60p', options: ['55p', '60p', '65p'], correctIndex: 1 },
      { coins: [{ label: '20p', value: 20 }, { label: '10p', value: 10 }, { label: '5p', value: 5 }], correctTotal: '35p', options: ['30p', '35p', '40p'], correctIndex: 1 },
      { coins: [{ label: '£1', value: 100 }, { label: '£1', value: 100 }], correctTotal: '£2.00', options: ['£1.50', '£2.00', '£2.50'], correctIndex: 1 },
    ],
  },
  // Set 4
  {
    rounds: [
      { coins: [{ label: '2p', value: 2 }, { label: '2p', value: 2 }, { label: '1p', value: 1 }], correctTotal: '5p', options: ['4p', '5p', '6p'], correctIndex: 1 },
      { coins: [{ label: '10p', value: 10 }, { label: '5p', value: 5 }, { label: '2p', value: 2 }], correctTotal: '17p', options: ['15p', '17p', '19p'], correctIndex: 1 },
      { coins: [{ label: '50p', value: 50 }, { label: '20p', value: 20 }], correctTotal: '70p', options: ['60p', '70p', '80p'], correctIndex: 1 },
      { coins: [{ label: '£2', value: 200 }, { label: '50p', value: 50 }], correctTotal: '£2.50', options: ['£2.20', '£2.50', '£3.00'], correctIndex: 1 },
    ],
  },
  // Set 5
  {
    rounds: [
      { coins: [{ label: '1p', value: 1 }, { label: '1p', value: 1 }, { label: '1p', value: 1 }], correctTotal: '3p', options: ['2p', '3p', '4p'], correctIndex: 1 },
      { coins: [{ label: '20p', value: 20 }, { label: '5p', value: 5 }], correctTotal: '25p', options: ['20p', '25p', '30p'], correctIndex: 1 },
      { coins: [{ label: '50p', value: 50 }, { label: '20p', value: 20 }, { label: '20p', value: 20 }], correctTotal: '90p', options: ['80p', '90p', '£1.00'], correctIndex: 1 },
      { coins: [{ label: '£1', value: 100 }, { label: '10p', value: 10 }, { label: '10p', value: 10 }], correctTotal: '£1.20', options: ['£1.10', '£1.20', '£1.30'], correctIndex: 1 },
    ],
  },
  // Set 6
  {
    rounds: [
      { coins: [{ label: '5p', value: 5 }, { label: '2p', value: 2 }], correctTotal: '7p', options: ['6p', '7p', '8p'], correctIndex: 1 },
      { coins: [{ label: '10p', value: 10 }, { label: '10p', value: 10 }, { label: '10p', value: 10 }], correctTotal: '30p', options: ['25p', '30p', '35p'], correctIndex: 1 },
      { coins: [{ label: '£1', value: 100 }, { label: '20p', value: 20 }], correctTotal: '£1.20', options: ['£1.10', '£1.20', '£1.30'], correctIndex: 1 },
      { coins: [{ label: '50p', value: 50 }, { label: '5p', value: 5 }, { label: '5p', value: 5 }], correctTotal: '60p', options: ['55p', '60p', '65p'], correctIndex: 1 },
    ],
  },
  // Set 7
  {
    rounds: [
      { coins: [{ label: '2p', value: 2 }, { label: '1p', value: 1 }], correctTotal: '3p', options: ['2p', '3p', '4p'], correctIndex: 1 },
      { coins: [{ label: '20p', value: 20 }, { label: '10p', value: 10 }, { label: '10p', value: 10 }], correctTotal: '40p', options: ['35p', '40p', '45p'], correctIndex: 1 },
      { coins: [{ label: '£1', value: 100 }, { label: '50p', value: 50 }, { label: '20p', value: 20 }], correctTotal: '£1.70', options: ['£1.60', '£1.70', '£1.80'], correctIndex: 1 },
      { coins: [{ label: '£2', value: 200 }, { label: '£1', value: 100 }], correctTotal: '£3.00', options: ['£2.50', '£3.00', '£3.50'], correctIndex: 1 },
    ],
  },
  // Set 8
  {
    rounds: [
      { coins: [{ label: '5p', value: 5 }, { label: '5p', value: 5 }, { label: '5p', value: 5 }], correctTotal: '15p', options: ['10p', '15p', '20p'], correctIndex: 1 },
      { coins: [{ label: '50p', value: 50 }, { label: '5p', value: 5 }], correctTotal: '55p', options: ['50p', '55p', '60p'], correctIndex: 1 },
      { coins: [{ label: '£1', value: 100 }, { label: '£1', value: 100 }, { label: '50p', value: 50 }], correctTotal: '£2.50', options: ['£2.00', '£2.50', '£3.00'], correctIndex: 1 },
      { coins: [{ label: '20p', value: 20 }, { label: '2p', value: 2 }, { label: '1p', value: 1 }], correctTotal: '23p', options: ['21p', '23p', '25p'], correctIndex: 1 },
    ],
  },
  // Set 9
  {
    rounds: [
      { coins: [{ label: '10p', value: 10 }, { label: '2p', value: 2 }], correctTotal: '12p', options: ['10p', '12p', '14p'], correctIndex: 1 },
      { coins: [{ label: '20p', value: 20 }, { label: '20p', value: 20 }, { label: '10p', value: 10 }], correctTotal: '50p', options: ['40p', '50p', '60p'], correctIndex: 1 },
      { coins: [{ label: '50p', value: 50 }, { label: '50p', value: 50 }, { label: '50p', value: 50 }], correctTotal: '£1.50', options: ['£1.00', '£1.50', '£2.00'], correctIndex: 1 },
      { coins: [{ label: '£2', value: 200 }, { label: '20p', value: 20 }], correctTotal: '£2.20', options: ['£2.10', '£2.20', '£2.40'], correctIndex: 1 },
    ],
  },
  // Set 10
  {
    rounds: [
      { coins: [{ label: '1p', value: 1 }, { label: '2p', value: 2 }, { label: '2p', value: 2 }], correctTotal: '5p', options: ['4p', '5p', '6p'], correctIndex: 1 },
      { coins: [{ label: '10p', value: 10 }, { label: '20p', value: 20 }], correctTotal: '30p', options: ['25p', '30p', '35p'], correctIndex: 1 },
      { coins: [{ label: '£1', value: 100 }, { label: '10p', value: 10 }, { label: '5p', value: 5 }], correctTotal: '£1.15', options: ['£1.10', '£1.15', '£1.20'], correctIndex: 1 },
      { coins: [{ label: '£2', value: 200 }, { label: '£2', value: 200 }], correctTotal: '£4.00', options: ['£3.00', '£4.00', '£5.00'], correctIndex: 1 },
    ],
  },
  // Set 11
  {
    rounds: [
      { coins: [{ label: '5p', value: 5 }, { label: '1p', value: 1 }], correctTotal: '6p', options: ['5p', '6p', '7p'], correctIndex: 1 },
      { coins: [{ label: '50p', value: 50 }, { label: '10p', value: 10 }, { label: '5p', value: 5 }], correctTotal: '65p', options: ['60p', '65p', '70p'], correctIndex: 1 },
      { coins: [{ label: '£1', value: 100 }, { label: '50p', value: 50 }, { label: '50p', value: 50 }], correctTotal: '£2.00', options: ['£1.50', '£2.00', '£2.50'], correctIndex: 1 },
      { coins: [{ label: '20p', value: 20 }, { label: '5p', value: 5 }, { label: '2p', value: 2 }], correctTotal: '27p', options: ['25p', '27p', '29p'], correctIndex: 1 },
    ],
  },
  // Set 12
  {
    rounds: [
      { coins: [{ label: '2p', value: 2 }, { label: '2p', value: 2 }], correctTotal: '4p', options: ['3p', '4p', '5p'], correctIndex: 1 },
      { coins: [{ label: '10p', value: 10 }, { label: '5p', value: 5 }, { label: '5p', value: 5 }], correctTotal: '20p', options: ['15p', '20p', '25p'], correctIndex: 1 },
      { coins: [{ label: '£1', value: 100 }, { label: '20p', value: 20 }, { label: '10p', value: 10 }], correctTotal: '£1.30', options: ['£1.20', '£1.30', '£1.40'], correctIndex: 1 },
      { coins: [{ label: '50p', value: 50 }, { label: '20p', value: 20 }, { label: '5p', value: 5 }], correctTotal: '75p', options: ['70p', '75p', '80p'], correctIndex: 1 },
    ],
  },
  // Set 13
  {
    rounds: [
      { coins: [{ label: '10p', value: 10 }, { label: '1p', value: 1 }], correctTotal: '11p', options: ['10p', '11p', '12p'], correctIndex: 1 },
      { coins: [{ label: '20p', value: 20 }, { label: '20p', value: 20 }, { label: '20p', value: 20 }], correctTotal: '60p', options: ['50p', '60p', '70p'], correctIndex: 1 },
      { coins: [{ label: '£2', value: 200 }, { label: '50p', value: 50 }, { label: '50p', value: 50 }], correctTotal: '£3.00', options: ['£2.50', '£3.00', '£3.50'], correctIndex: 1 },
      { coins: [{ label: '5p', value: 5 }, { label: '2p', value: 2 }, { label: '1p', value: 1 }], correctTotal: '8p', options: ['7p', '8p', '9p'], correctIndex: 1 },
    ],
  },
  // Set 14
  {
    rounds: [
      { coins: [{ label: '1p', value: 1 }, { label: '1p', value: 1 }], correctTotal: '2p', options: ['1p', '2p', '3p'], correctIndex: 1 },
      { coins: [{ label: '50p', value: 50 }, { label: '20p', value: 20 }, { label: '10p', value: 10 }], correctTotal: '80p', options: ['70p', '80p', '90p'], correctIndex: 1 },
      { coins: [{ label: '£1', value: 100 }, { label: '£1', value: 100 }, { label: '20p', value: 20 }], correctTotal: '£2.20', options: ['£2.10', '£2.20', '£2.30'], correctIndex: 1 },
      { coins: [{ label: '10p', value: 10 }, { label: '10p', value: 10 }, { label: '5p', value: 5 }], correctTotal: '25p', options: ['20p', '25p', '30p'], correctIndex: 1 },
    ],
  },
  // Set 15
  {
    rounds: [
      { coins: [{ label: '5p', value: 5 }, { label: '5p', value: 5 }, { label: '2p', value: 2 }], correctTotal: '12p', options: ['10p', '12p', '14p'], correctIndex: 1 },
      { coins: [{ label: '20p', value: 20 }, { label: '10p', value: 10 }], correctTotal: '30p', options: ['25p', '30p', '35p'], correctIndex: 1 },
      { coins: [{ label: '£2', value: 200 }, { label: '£1', value: 100 }, { label: '50p', value: 50 }], correctTotal: '£3.50', options: ['£3.00', '£3.50', '£4.00'], correctIndex: 1 },
      { coins: [{ label: '50p', value: 50 }, { label: '2p', value: 2 }, { label: '1p', value: 1 }], correctTotal: '53p', options: ['51p', '53p', '55p'], correctIndex: 1 },
    ],
  },
  // Set 16
  {
    rounds: [
      { coins: [{ label: '2p', value: 2 }, { label: '5p', value: 5 }], correctTotal: '7p', options: ['5p', '7p', '9p'], correctIndex: 1 },
      { coins: [{ label: '10p', value: 10 }, { label: '10p', value: 10 }, { label: '20p', value: 20 }], correctTotal: '40p', options: ['35p', '40p', '45p'], correctIndex: 1 },
      { coins: [{ label: '£1', value: 100 }, { label: '5p', value: 5 }], correctTotal: '£1.05', options: ['£1.00', '£1.05', '£1.10'], correctIndex: 1 },
      { coins: [{ label: '£2', value: 200 }, { label: '20p', value: 20 }, { label: '10p', value: 10 }], correctTotal: '£2.30', options: ['£2.20', '£2.30', '£2.40'], correctIndex: 1 },
    ],
  },
  // Set 17
  {
    rounds: [
      { coins: [{ label: '1p', value: 1 }, { label: '2p', value: 2 }], correctTotal: '3p', options: ['2p', '3p', '4p'], correctIndex: 1 },
      { coins: [{ label: '50p', value: 50 }, { label: '50p', value: 50 }, { label: '20p', value: 20 }], correctTotal: '£1.20', options: ['£1.10', '£1.20', '£1.30'], correctIndex: 1 },
      { coins: [{ label: '£1', value: 100 }, { label: '10p', value: 10 }], correctTotal: '£1.10', options: ['£1.05', '£1.10', '£1.20'], correctIndex: 1 },
      { coins: [{ label: '20p', value: 20 }, { label: '5p', value: 5 }, { label: '5p', value: 5 }], correctTotal: '30p', options: ['25p', '30p', '35p'], correctIndex: 1 },
    ],
  },
  // Set 18
  {
    rounds: [
      { coins: [{ label: '10p', value: 10 }, { label: '2p', value: 2 }, { label: '1p', value: 1 }], correctTotal: '13p', options: ['11p', '13p', '15p'], correctIndex: 1 },
      { coins: [{ label: '50p', value: 50 }, { label: '10p', value: 10 }, { label: '10p', value: 10 }], correctTotal: '70p', options: ['65p', '70p', '75p'], correctIndex: 1 },
      { coins: [{ label: '£2', value: 200 }, { label: '£2', value: 200 }, { label: '50p', value: 50 }], correctTotal: '£4.50', options: ['£4.00', '£4.50', '£5.00'], correctIndex: 1 },
      { coins: [{ label: '20p', value: 20 }, { label: '20p', value: 20 }, { label: '5p', value: 5 }], correctTotal: '45p', options: ['40p', '45p', '50p'], correctIndex: 1 },
    ],
  },
  // Set 19
  {
    rounds: [
      { coins: [{ label: '5p', value: 5 }, { label: '2p', value: 2 }, { label: '2p', value: 2 }], correctTotal: '9p', options: ['7p', '9p', '11p'], correctIndex: 1 },
      { coins: [{ label: '£1', value: 100 }, { label: '20p', value: 20 }, { label: '20p', value: 20 }], correctTotal: '£1.40', options: ['£1.30', '£1.40', '£1.50'], correctIndex: 1 },
      { coins: [{ label: '50p', value: 50 }, { label: '5p', value: 5 }, { label: '2p', value: 2 }], correctTotal: '57p', options: ['55p', '57p', '59p'], correctIndex: 1 },
      { coins: [{ label: '£2', value: 200 }, { label: '10p', value: 10 }, { label: '5p', value: 5 }], correctTotal: '£2.15', options: ['£2.10', '£2.15', '£2.20'], correctIndex: 1 },
    ],
  },
  // Set 20
  {
    rounds: [
      { coins: [{ label: '10p', value: 10 }, { label: '5p', value: 5 }, { label: '1p', value: 1 }], correctTotal: '16p', options: ['14p', '16p', '18p'], correctIndex: 1 },
      { coins: [{ label: '20p', value: 20 }, { label: '10p', value: 10 }, { label: '2p', value: 2 }], correctTotal: '32p', options: ['30p', '32p', '34p'], correctIndex: 1 },
      { coins: [{ label: '£1', value: 100 }, { label: '50p', value: 50 }, { label: '10p', value: 10 }], correctTotal: '£1.60', options: ['£1.50', '£1.60', '£1.70'], correctIndex: 1 },
      { coins: [{ label: '£2', value: 200 }, { label: '£1', value: 100 }, { label: '20p', value: 20 }], correctTotal: '£3.20', options: ['£3.10', '£3.20', '£3.30'], correctIndex: 1 },
    ],
  },
];
