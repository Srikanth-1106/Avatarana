export interface EventItem {
  id: string;
  name: string;
  category: 'Men' | 'Women' | 'Kids' | 'Senior Citizens' | 'General';
  subCategory?: string; // For Kids age groups
  type: 'Group' | 'Individual';
  minPlayers?: number; // Minimum players required for Group events
  maxPlayers?: number; // Maximum players allowed for Group events
  description: string;
  points: { first: number; second: number; third?: number };
}

export const eventsData: EventItem[] = [
  // Men's Events
  { id: 'm1', name: 'Cricket', category: 'Men', type: 'Group', minPlayers: 11, description: 'Regional teams compete in league format using standard cricket rules', points: { first: 10, second: 5 } },
  { id: 'm2', name: 'Volleyball', category: 'Men', type: 'Group', minPlayers: 6, maxPlayers: 8, description: '6–8 players per team, best of 3 sets', points: { first: 10, second: 5 } },
  { id: 'm4', name: 'Tug of War', category: 'Men', type: 'Group', minPlayers: 8, description: 'Teams pull opponent across center line', points: { first: 10, second: 5 } },
  
  // Women's Events
  { id: 'w2', name: 'Rangoli', category: 'Women', type: 'Group', minPlayers: 2, maxPlayers: 2, description: '2 participants per team. Judged on design, creativity and colour', points: { first: 5, second: 3, third: 2 } },
  { id: 'w3', name: 'Dodgeball', category: 'Women', type: 'Group', minPlayers: 6, description: 'Team elimination game', points: { first: 10, second: 5 } },
  { id: 'w4', name: 'Lemon & Spoon', category: 'Women', type: 'Individual', description: 'Balance race carrying lemon on spoon', points: { first: 5, second: 3, third: 2 } },
  { id: 'w5', name: 'Throwball', category: 'Women', type: 'Group', minPlayers: 7, description: 'Net sport where the ball must be thrown over in one motion', points: { first: 10, second: 5 } },

  // Kids Events (LKG - 1st)
  { id: 'k1', name: 'Ball in Bucket', category: 'Kids', subCategory: 'LKG - 1st Std', type: 'Individual', description: 'Ball toss into bucket', points: { first: 5, second: 3, third: 2 } },
  { id: 'k2', name: 'Colouring', category: 'Kids', subCategory: 'LKG - 1st Std', type: 'Individual', description: 'Colour within outline', points: { first: 5, second: 3, third: 2 } },
  { id: 'k3', name: '50 Meter Race', category: 'Kids', subCategory: 'LKG - 1st Std', type: 'Individual', description: 'Straight sprint race', points: { first: 5, second: 3, third: 2 } },

  // Kids Events (2nd - 5th)
  { id: 'k4', name: '100 Meter Race', category: 'Kids', subCategory: '2nd - 5th Std', type: 'Individual', description: 'Sprint race based on speed', points: { first: 5, second: 3, third: 2 } },
  { id: 'k5', name: 'Lemon & Spoon', category: 'Kids', subCategory: '2nd - 5th Std', type: 'Individual', description: 'Balance and speed', points: { first: 5, second: 3, third: 2 } },
  { id: 'k6', name: 'Drawing', category: 'Kids', subCategory: '2nd - 5th Std', type: 'Individual', description: 'Judged on creativity', points: { first: 5, second: 3, third: 2 } },

  // Kids Events (6th - 10th)
  { id: 'k7', name: 'Drawing', category: 'Kids', subCategory: '6th - 10th Std', type: 'Individual', description: 'Advanced drawing competition', points: { first: 5, second: 3, third: 2 } },
  { id: 'k9', name: 'Maida Coin Game', category: 'Kids', subCategory: '6th - 10th Std', type: 'Individual', description: 'Retrieve coin from flour using only your face', points: { first: 5, second: 3, third: 2 } },

  // Senior Citizens Events
  { id: 's1', name: 'Fast Walking', category: 'Senior Citizens', type: 'Individual', description: 'Walking race (running not allowed)', points: { first: 5, second: 3, third: 2 } },
  { id: 's2', name: 'Padabandha (Crossword)', category: 'Senior Citizens', type: 'Individual', description: 'Kannada crossword and other indoor games', points: { first: 5, second: 3, third: 2 } },

  // General Open Events
  { id: 'g1', name: 'Cooking Without Fire', category: 'General', type: 'Group', minPlayers: 2, description: 'Prepare dish without using gas or flame', points: { first: 10, second: 5 } },
  { id: 'g2', name: 'Housie Housie (Tambola)', category: 'General', type: 'Individual', description: 'Bingo style number game', points: { first: 5, second: 3, third: 2 } },
  { id: 'g3', name: 'Treasure Hunt', category: 'General', type: 'Group', minPlayers: 3, description: 'Teams follow clues to find treasure', points: { first: 10, second: 5 } },
  
  // Lagori in every category
  { id: 'logori_m', name: 'Lagori', category: 'Men', type: 'Group', minPlayers: 7, description: 'Traditional game where teams knock down and rebuild a stone pile', points: { first: 10, second: 5 } },
  { id: 'logori_w', name: 'Lagori', category: 'Women', type: 'Group', minPlayers: 7, description: 'Traditional game where teams knock down and rebuild a stone pile', points: { first: 10, second: 5 } },
  { id: 'logori_k', name: 'Lagori', category: 'Kids', subCategory: '6th - 10th Std', type: 'Group', minPlayers: 7, description: 'Traditional game where teams knock down and rebuild a stone pile', points: { first: 10, second: 5 } },
  { id: 'logori_s', name: 'Lagori', category: 'Senior Citizens', type: 'Group', minPlayers: 7, description: 'Traditional game where teams knock down and rebuild a stone pile', points: { first: 10, second: 5 } },
];
