
import { storage } from './storage';

// Credentials provided by the user
const API_KEY = 'e1a9a69a700CodeHub9484c058d7b5be';
const API_SUFFIX = '32b4c5';
const DEMO_EMAIL = 'demo@gmail.com';

/**
 * Gamblly API Service
 * Note: In a production environment, these calls should be made from a backend
 * to protect the API_KEY and avoid CORS issues.
 */
export const gambllyApi = {
  getGames: async (userId: string) => {
    // Log the API call for Admin tracking
    storage.addApiLog({
      endpoint: '/api/v1/games/list',
      method: 'GET',
      status: 200,
      userId
    });

    // Simulate API delay
    await new Promise(r => setTimeout(r, 800));

    // Demo games list
    return [
      { id: '1001', name: 'Aviator', provider: 'Spribe', image: 'https://images.unsplash.com/photo-1551732998-9573f6941ed8?w=400&h=300&fit=crop', type: 'Crash' },
      { id: '2005', name: 'Gates of Olympus', provider: 'Pragmatic Play', image: 'https://images.unsplash.com/photo-1606167668584-78701c57f13d?w=400&h=300&fit=crop', type: 'Slot' },
      { id: '3012', name: 'Crazy Time', provider: 'Evolution', image: 'https://images.unsplash.com/photo-1518893063132-36e46dbe2498?w=400&h=300&fit=crop', type: 'Live' },
      { id: '4050', name: 'Sweet Bonanza', provider: 'Pragmatic Play', image: 'https://images.unsplash.com/photo-1599427423303-1288b8747f41?w=400&h=300&fit=crop', type: 'Slot' },
      { id: '5002', name: 'Roulette Royale', provider: 'Ezugi', image: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=400&h=300&fit=crop', type: 'Table' },
      { id: '6008', name: 'Blackjack VIP', provider: 'Evolution', image: 'https://images.unsplash.com/photo-1511193311914-0346f16efe50?w=400&h=300&fit=crop', type: 'Table' },
    ];
  },

  launchGame: async (gameId: string, userId: string, username: string) => {
    storage.addApiLog({
      endpoint: '/api/v1/games/launch',
      method: 'POST',
      status: 200,
      userId
    });

    // Generate a secure-looking session URL
    // In reality, this would use the API Key to fetch a URL from Gamblly
    const sessionToken = btoa(`${API_KEY}:${Date.now()}`).substring(0, 32);
    
    // Using the demo suffix and structure
    return `https://demo.gamblly.com/game/${gameId}?token=${sessionToken}&operator=${API_SUFFIX}&user=${username}&email=${DEMO_EMAIL}&currency=USD`;
  }
};
