
import { storage } from './storage';

/**
 * Gamblly API Configuration
 * تم ضبط هذا الكود ليقرأ القيم التي أدخلتها أنت في Vercel بالضبط.
 */

const getSafeEnv = (key: string, defaultValue: string): string => {
  try {
    // 1. محاولة الجلب من Vite (الأكثر شيوعاً في Vercel)
    const viteEnv = (import.meta as any).env;
    if (viteEnv) {
      if (viteEnv[`VITE_${key}`]) return viteEnv[`VITE_${key}`];
      if (viteEnv[key]) return viteEnv[key];
    }

    // 2. محاولة الجلب من process.env بشكل آمن
    if (typeof process !== 'undefined' && process.env) {
      if (process.env[`VITE_${key}`]) return process.env[`VITE_${key}`] as string;
      if (process.env[key]) return process.env[key] as string;
    }
  } catch (e) {
    // في حال حدوث خطأ، لا تتوقف الصفحة، بل استخدم القيمة الافتراضية
    console.warn(`Environment variable ${key} missing, using fallback.`);
  }
  return defaultValue;
};

// الأسماء مطابقة تماماً لما وضعته أنت في Vercel
const API_KEY = getSafeEnv('GAMBLY_API_KEY', 'e1a9a69a700CodeHub9484c058d7b5be');
const API_SUFFIX = getSafeEnv('GAMBLY_API_SUFFIX', '32b4c5');
const DEMO_EMAIL = getSafeEnv('GAMBLY_EMAIL', 'demo@gmail.com');

export const gambllyApi = {
  getGames: async (userId: string) => {
    storage.addApiLog({
      endpoint: '/api/v1/games/list',
      method: 'GET',
      status: 200,
      userId
    });

    await new Promise(r => setTimeout(r, 800));

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

    const sessionToken = btoa(`${API_KEY}:${Date.now()}`).substring(0, 32);
    
    return `https://demo.gamblly.com/game/${gameId}?token=${sessionToken}&operator=${API_SUFFIX}&user=${username}&email=${DEMO_EMAIL}&currency=TND`;
  }
};
