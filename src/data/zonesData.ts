export interface Zone {
  id: string;
  name: string;
  displayName: string;
  shortCode: string;
}

export const zonesData: Zone[] = [
  {
    id: 'zone_1',
    name: 'Mangalore',
    displayName: 'Mangalore',
    shortCode: 'MGL'
  },
  {
    id: 'zone_2',
    name: 'Puttur-Nidpalli',
    displayName: 'Puttur-Nidpalli',
    shortCode: 'PN'
  },
  {
    id: 'zone_3',
    name: 'Bayar',
    displayName: 'Bayar',
    shortCode: 'BYR'
  },
  {
    id: 'zone_4',
    name: 'Padre-Katukukke',
    displayName: 'Padre-Katukukke',
    shortCode: 'PK'
  },
  {
    id: 'zone_5',
    name: 'Agalpady',
    displayName: 'Agalpady',
    shortCode: 'AGL'
  },
  {
    id: 'zone_6',
    name: 'Gundyadka-Udupi-Karkala-Moodabidre',
    displayName: 'Gundyadka-Udupi-Karkala-Moodabidre',
    shortCode: 'GUKM'
  },
  {
    id: 'zone_7',
    name: 'Kochi-Taire',
    displayName: 'Kochi-Taire',
    shortCode: 'KT'
  },
  {
    id: 'zone_8',
    name: 'Bengaluru-Mysuru-Malenadu',
    displayName: 'Bengaluru-Mysuru-Malenadu',
    shortCode: 'BMM'
  }
];

export interface CricketTeam {
  name: string;
  zone: string;
  players: number;
  wins: number;
  losses: number;
  points: number;
  nrr?: number; // Net Run Rate
}

export const cricketTeamsData: CricketTeam[] = [
  // Mangalore Zone
  { name: 'Mangalore Tigers', zone: 'Mangalore', players: 11, wins: 5, losses: 1, points: 20, nrr: 1.25 },
  { name: 'Coastal Strikers', zone: 'Mangalore', players: 11, wins: 4, losses: 2, points: 16, nrr: 0.85 },
  
  // Puttur-Nidpalli Zone
  { name: 'Puttur Panthers', zone: 'Puttur-Nidpalli', players: 11, wins: 4, losses: 2, points: 16, nrr: 0.95 },
  { name: 'Nidpalli Warriors', zone: 'Puttur-Nidpalli', players: 11, wins: 3, losses: 3, points: 12, nrr: -0.15 },
  
  // Bayar Zone
  { name: 'Bayar Blaze', zone: 'Bayar', players: 11, wins: 3, losses: 3, points: 12, nrr: 0.45 },
  { name: 'Bayar Hawks', zone: 'Bayar', players: 11, wins: 2, losses: 4, points: 8, nrr: -0.65 },
  
  // Padre-Katukukke Zone
  { name: 'Padre Eagles', zone: 'Padre-Katukukke', players: 11, wins: 4, losses: 2, points: 16, nrr: 0.75 },
  { name: 'Katukukke Kings', zone: 'Padre-Katukukke', players: 11, wins: 2, losses: 4, points: 8, nrr: -0.55 },
  
  // Agalpady Zone
  { name: 'Agalpady Arrows', zone: 'Agalpady', players: 11, wins: 3, losses: 3, points: 12, nrr: 0.20 },
  { name: 'Agalpady Nomads', zone: 'Agalpady', players: 11, wins: 1, losses: 5, points: 4, nrr: -1.20 },
  
  // Gundyadka-Udupi-Karkala-Moodabidre Zone
  { name: 'GUKM United', zone: 'Gundyadka-Udupi-Karkala-Moodabidre', players: 11, wins: 5, losses: 1, points: 20, nrr: 1.15 },
  { name: 'Udupi Titans', zone: 'Gundyadka-Udupi-Karkala-Moodabidre', players: 11, wins: 4, losses: 2, points: 16, nrr: 0.65 },
  
  // Kochi-Taire Zone
  { name: 'Kochi Kings', zone: 'Kochi-Taire', players: 11, wins: 3, losses: 3, points: 12, nrr: 0.35 },
  { name: 'Taire Tigers', zone: 'Kochi-Taire', players: 11, wins: 2, losses: 4, points: 8, nrr: -0.75 },
  
  // Bengaluru-Mysuru-Malenadu Zone
  { name: 'Bengaluru Royals', zone: 'Bengaluru-Mysuru-Malenadu', players: 11, wins: 5, losses: 1, points: 20, nrr: 1.45 },
  { name: 'Mysuru Mavericks', zone: 'Bengaluru-Mysuru-Malenadu', players: 11, wins: 4, losses: 2, points: 16, nrr: 0.95 },
  { name: 'Malenadu Rangers', zone: 'Bengaluru-Mysuru-Malenadu', players: 11, wins: 2, losses: 4, points: 8, nrr: -0.35 }
];
