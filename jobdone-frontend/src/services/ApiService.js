import { initialFeed, initialJobs, initialStories } from '../data.js';

const TRADES = [
  "Electrician", "Plumber", "Carpenter", "Painter", "HVAC", 
  "Mechanic", "Driver", "Mason", "Cleaner", "Interior Designer", 
  "Welder", "AC Technician", "Gardener", "CCTV Installer", "RO Technician"
];

class MockDatabase {
  constructor() {
    this.feed = [];
    this.jobs = [];
    this.stories = [];
    this.generateData();
  }

  generateData() {
    // Generate 10,000 Feed items
    const baseFeed = initialFeed.length > 0 ? initialFeed : [
      { id: "feed-gen", authorName: "Gen Author", content: "Gen Content", likes: 0, commentsCount: 0, comments: [] }
    ];
    for (let i = 0; i < 10000; i++) {
      const template = baseFeed[i % baseFeed.length];
      this.feed.push({
        ...template,
        id: `mock-feed-${i}`,
        authorName: `${template.authorName} ${Math.floor(i / baseFeed.length)}`,
        likes: Math.floor(Math.random() * 1000),
        commentsCount: Math.floor(Math.random() * 100),
        matchScore: Math.floor(Math.random() * 30) + 70, // 70-100
        trustScore: Math.floor(Math.random() * 20) + 80, // 80-100
        distance: `${Math.floor(Math.random() * 20)}km away`,
        trade: TRADES[Math.floor(Math.random() * TRADES.length)].toLowerCase()
      });
    }

    // Generate 5,000 Jobs
    const baseJobs = initialJobs.length > 0 ? initialJobs : [
      { id: "job-gen", title: "Gen Job", company: "Gen Co", description: "Gen Desc", category: "Construction" }
    ];
    for (let i = 0; i < 5000; i++) {
      const template = baseJobs[i % baseJobs.length];
      const TIME_AGOS = ["Just now", "10m ago", "1h ago", "4h ago", "1d ago", "3d ago"];
      const DURATIONS = ["1 day", "3 days", "1 week", "2 weeks", "1 month", "Ongoing"];
      this.jobs.push({
        ...template,
        id: `mock-job-${i}`,
        title: `${template.title} ${Math.floor(i / baseJobs.length)}`,
        matchScore: Math.floor(Math.random() * 40) + 60,
        trustScore: Math.floor(Math.random() * 20) + 80,
        trade: TRADES[Math.floor(Math.random() * TRADES.length)].toLowerCase(),
        timeAgo: TIME_AGOS[Math.floor(Math.random() * TIME_AGOS.length)],
        distance: `${Math.floor(Math.random() * 30) + 1}km away`,
        isUrgent: Math.random() > 0.8, // 20% chance to be urgent
        duration: DURATIONS[Math.floor(Math.random() * DURATIONS.length)],
        clientAvatar: template.companyLogo || "https://lh3.googleusercontent.com/aida-public/AB6AXuAtgc7h8rggTMnezzxskuOtxYRC4QZAqZwauVBizXVfiWEh1R0yGLBstfK5ItSthalYnz3GAcidfndxVGyo6LJfp2mj6hQ1XRYucIpc8epp_S046ULBKIk1NjcrU5LeXIckXJa6hmieE2_vOd0jZIoQoHq2xPzhBB_dY7at0bsJ50hzVRb7AvrAzn4c2MjXld0_OV8mevIJTEAxKbZbZ6sKkr1rVbGKAVVSKeCaG_PNi5ChvTUKnT4LiixWDqqbnDgI9FOirq9ArHt"
      });
    }

    // Generate 1,000 Stories
    const baseStories = initialStories.length > 0 ? initialStories : [
      { id: "story-gen", name: "Gen Story", skills: ["Skill"] }
    ];
    for (let i = 0; i < 1000; i++) {
      const template = baseStories[i % baseStories.length];
      this.stories.push({
        ...template,
        id: `mock-story-${i}`,
        name: `${template.name} ${Math.floor(i / baseStories.length)}`,
        trade: TRADES[Math.floor(Math.random() * TRADES.length)].toLowerCase()
      });
    }
  }

  getPaginatedFeed(cursor, limit, filters) {
    let filtered = this.feed;
    
    // Global Trade filter
    if (filters.trade && filters.trade !== 'all') {
      filtered = filtered.filter(f => f.trade === filters.trade.toLowerCase());
    }

    if (filters.tab === 'following') {
      filtered = filtered.filter(f => filters.following && filters.following.includes(f.authorName));
    } else if (filters.tab === 'nearby') {
      filtered = filtered
        .filter(f => parseInt(f.distance) < 15) // expanded radius slightly so we have enough posts to see the sorting
        .sort((a, b) => parseInt(b.distance) - parseInt(a.distance)); // Descending order as requested
    } else if (filters.tab === 'ai') {
      filtered = [...filtered].sort((a, b) => b.matchScore - a.matchScore);
    } else if (filters.tab === 'trending') {
      filtered = [...filtered].sort((a, b) => b.likes - a.likes);
    }
    
    // Smart Feed Mixing Simulation for 'all' tab
    if (filters.tab === 'all') {
      // Shuffle slightly to simulate mixed content but keep mostly chronological
      // (For this mock, we just take them as they are since they are cyclic)
    }

    const startIndex = cursor ? filtered.findIndex(f => f.id === cursor) + 1 : 0;
    const items = filtered.slice(startIndex, startIndex + limit);
    const nextCursor = items.length === limit ? items[items.length - 1].id : null;
    
    return { items, nextCursor, total: filtered.length };
  }

  getPaginatedJobs(cursor, limit, category, query, trade) {
    let filtered = this.jobs;
    if (trade && trade !== 'all') {
      filtered = filtered.filter(j => j.trade === trade.toLowerCase());
    }
    if (category && category !== 'all') {
      filtered = filtered.filter(j => j.category.toLowerCase() === category.toLowerCase());
    }
    if (query) {
      filtered = filtered.filter(j => 
        j.title.toLowerCase().includes(query) || 
        j.company.toLowerCase().includes(query)
      );
    }

    // AI Match Sort
    filtered = [...filtered].sort((a, b) => (b.matchScore + b.trustScore) - (a.matchScore + a.trustScore));

    const startIndex = cursor ? filtered.findIndex(j => j.id === cursor) + 1 : 0;
    const items = filtered.slice(startIndex, startIndex + limit);
    const nextCursor = items.length === limit ? items[items.length - 1].id : null;

    return { items, nextCursor, total: filtered.length };
  }

  getStories(limit) {
    // Just return top N stories
    return this.stories.slice(0, limit);
  }
}

const db = new MockDatabase();

export class ApiService {
  /**
   * Generic fetch wrapper that intercepts calls and returns mock paginated data
   */
  static async fetch(endpoint, options = {}) {
    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 200));

    try {
      const response = await fetch(`http://localhost:5001${endpoint}`, options);
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      // Silent fallback
    }

    return this.mockResponse(endpoint, options);
  }

  static async mockResponse(endpoint, options) {
    const url = new URL(`http://localhost${endpoint}`);
    const path = url.pathname;
    const params = Object.fromEntries(url.searchParams.entries());

    if (path === '/api/feed') {
      const cursor = params.cursor || null;
      const limit = parseInt(params.limit) || 10;
      const tab = params.tab || 'all';
      const trade = params.trade || 'all';
      const following = params.following ? params.following.split(',') : [];
      return { status: 'success', data: db.getPaginatedFeed(cursor, limit, { tab, following, trade }) };
    }

    if (path === '/api/jobs') {
      const cursor = params.cursor || null;
      const limit = parseInt(params.limit) || 10;
      const cat = params.category || 'all';
      const q = (params.query || '').toLowerCase();
      const trade = params.trade || 'all';
      return { status: 'success', data: db.getPaginatedJobs(cursor, limit, cat, q, trade) };
    }

    if (path === '/api/stories') {
      const trade = params.trade || 'all';
      let stories = db.stories.slice(0, 10);
      if (trade !== 'all') {
        stories = db.stories.filter(s => s.trade === trade.toLowerCase()).slice(0, 10);
      }
      return { status: 'success', data: stories };
    }

    if (path.startsWith('/api/auth')) {
      return { status: 'success', user: { id: 'u1', name: 'Arjun Sharma' } };
    }

    // Follow Endpoints
    const followMatch = path.match(/^\/api\/users\/(.+)\/follow$/);
    if (followMatch) {
      const userId = decodeURIComponent(followMatch[1]);
      if (options.method === 'POST') {
        return { status: 'success', message: `Successfully followed ${userId}` };
      }
      if (options.method === 'DELETE') {
        return { status: 'success', message: `Successfully unfollowed ${userId}` };
      }
    }

    const followersMatch = path.match(/^\/api\/users\/(.+)\/(followers|following)$/);
    if (followersMatch) {
      return { status: 'success', data: { items: [], total: 0 } };
    }

    return { status: 'mock', message: 'API not implemented yet', data: { items: [], nextCursor: null } };
  }
}
