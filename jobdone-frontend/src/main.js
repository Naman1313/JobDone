import './style.css';
import { initialStories, initialJobs, initialFeed, initialChats, ArjunProfile } from './data.js';
import { translations } from './translations.js';
import { ApiService } from './services/ApiService.js';
import { ChatService } from './services/ChatService.js';
import { LocationService } from './services/LocationService.js';
import { PwaService } from './services/PwaService.js';
import { InfiniteScroller } from './utils/InfiniteScroller.js';
import { PullToRefresh } from './utils/PullToRefresh.js';

let feedScroller = null;
let jobsScroller = null;
let pullToRefreshFeed = null;
let pullToRefreshJobs = null;
// ==========================================
// STATE MANAGEMENT & LOCAL STORAGE INITIALIZATION
// ==========================================
function getLocalStorage(key, defaultValue) {
  const data = localStorage.getItem(key);
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      return defaultValue;
    }
  }
  localStorage.setItem(key, JSON.stringify(defaultValue));
  return defaultValue;
}

function setLocalStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// App State
let state = {
  stories: getLocalStorage('jobdone_v2_stories', initialStories),
  jobs: getLocalStorage('jobdone_v2_jobs', initialJobs),
  feed: getLocalStorage('jobdone_v2_feed', initialFeed),
  chats: getLocalStorage('jobdone_v2_chats', initialChats),
  profile: getLocalStorage('jobdone_v2_profile', ArjunProfile),
  following: getLocalStorage('jobdone_v2_following', []),
  currentView: 'feed',
  activeChatId: null,
  activeStoryIndex: 0,
  storyTimer: null,
  createPostTags: ['Plumbing', 'Installation'], // In-memory tags for Create Post form
  userLocation: null, // Store coords when fetched
  activeFeedTab: 'all', // all, following, nearby, trade, trending, ai
  selectedTrade: getLocalStorage('jobdone_v2_trade', 'all')
};

// Enrich mock data with AI parameters (Coords, Trust Scores, Match %)
const enrichMockData = () => {
  const baseLat = 19.0760;
  const baseLng = 72.8777;
  
  state.jobs.forEach(j => {
    if (!j.lat) j.lat = baseLat + (Math.random() * 0.1 - 0.05);
    if (!j.lng) j.lng = baseLng + (Math.random() * 0.1 - 0.05);
    if (!j.matchScore) j.matchScore = Math.floor(Math.random() * 20) + 80; // 80-99%
    if (!j.trustScore) j.trustScore = Math.floor(Math.random() * 10) + 90; // 90-99
  });
  state.feed.forEach(f => {
    if (!f.lat) f.lat = baseLat + (Math.random() * 0.1 - 0.05);
    if (!f.lng) f.lng = baseLng + (Math.random() * 0.1 - 0.05);
    if (!f.authorId) f.authorId = `author-${Math.floor(Math.random()*100)}`; // Assign mock IDs
    if (!f.matchScore) f.matchScore = Math.floor(Math.random() * 20) + 80;
    if (!f.trustScore) f.trustScore = Math.floor(Math.random() * 10) + 90;
  });
};
enrichMockData();

// Update and save helpers
function updateState(key, value) {
  state[key] = value;
  setLocalStorage(`jobdone_v2_${key}`, value);
}

// ==========================================
// THEME & LANGUAGE MANAGERS
// ==========================================
const ThemeManager = {
  theme: getLocalStorage('jobdone_v2_theme', 'system'),
  accent: getLocalStorage('jobdone_v2_accent', 'blue'),
  
  init() {
    this.applyTheme(this.theme);
    this.applyAccent(this.accent);
    
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (this.theme === 'system') {
        document.documentElement.classList.toggle('dark', e.matches);
      }
    });
  },
  
  applyTheme(themeValue) {
    this.theme = themeValue;
    setLocalStorage('jobdone_v2_theme', themeValue);
    
    if (themeValue === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (themeValue === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', isDark);
    }
    
    document.querySelectorAll('.theme-opt-btn').forEach(btn => {
      const icon = btn.querySelector('.check-icon');
      if (icon) {
        if (btn.dataset.theme === themeValue) {
          icon.classList.remove('hidden');
        } else {
          icon.classList.add('hidden');
        }
      }
    });
    
    const themeLabel = document.getElementById('current-theme-label');
    if (themeLabel && translations[LanguageManager.lang]) {
      themeLabel.innerText = translations[LanguageManager.lang].dict[`theme.${themeValue}`] || themeValue;
    }
  },
  
  applyAccent(color) {
    this.accent = color;
    setLocalStorage('jobdone_v2_accent', color);
    
    if (color === 'blue') {
      document.documentElement.removeAttribute('data-accent');
    } else {
      document.documentElement.setAttribute('data-accent', color);
    }
    
    const indicator = document.getElementById('current-accent-indicator');
    if (indicator) {
      indicator.className = indicator.className.replace(/bg-\w+(-\d+)?/g, '');
      const colorMap = {
        'blue': 'bg-blue-600',
        'orange': 'bg-orange-600',
        'green': 'bg-green-600',
        'purple': 'bg-purple-600',
        'red': 'bg-red-600',
        'yellow': 'bg-yellow-500',
        'black': 'bg-gray-900'
      };
      indicator.classList.add(colorMap[color] || 'bg-blue-600');
    }
    
    // Update checkmarks in accent grid
    document.querySelectorAll('.accent-opt-btn').forEach(btn => {
      if(btn.dataset.accent === color) {
        btn.classList.add('border-primary', 'border-2');
      } else {
        btn.classList.remove('border-primary', 'border-2');
      }
    });
  }
};

const LanguageManager = {
  lang: getLocalStorage('jobdone_v2_lang', 'en'),
  
  init() {
    this.populateLanguageSheet();
    this.applyLanguage(this.lang);
  },
  
  applyLanguage(langCode) {
    if (!translations[langCode]) langCode = 'en';
    this.lang = langCode;
    setLocalStorage('jobdone_v2_lang', langCode);
    
    const dict = translations[langCode].dict;
    
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) {
        if (el.tagName === 'INPUT' && (el.type === 'text' || el.type === 'search')) {
           el.placeholder = dict[key];
        } else {
           el.innerHTML = dict[key];
        }
      }
    });
    
    // Also re-apply dynamic labels containing text (e.g., Theme setting label)
    ThemeManager.applyTheme(ThemeManager.theme);
    
    const langLabel = document.getElementById('current-language-label');
    if (langLabel) {
      langLabel.innerText = translations[langCode].name;
    }
    
    this.renderLanguageList();
  },

  populateLanguageSheet() {
    this.renderLanguageList();
    const searchInput = document.getElementById('language-search-input');
    if(searchInput) {
      searchInput.addEventListener('input', (e) => this.renderLanguageList(e.target.value));
    }
  },

  renderLanguageList(filter = '') {
    const list = document.getElementById('language-list');
    if (!list) return;
    list.innerHTML = '';
    
    Object.entries(translations).forEach(([code, data]) => {
      if (filter && !data.name.toLowerCase().includes(filter.toLowerCase()) && !data.nativeName.toLowerCase().includes(filter.toLowerCase())) {
        return;
      }
      
      const btn = document.createElement('button');
      btn.className = `w-full py-4 px-md text-left font-semibold text-on-surface hover:bg-surface-container active:bg-surface-container-high rounded-xl transition-colors border border-outline-variant/10 flex justify-between items-center`;
      
      const isSelected = this.lang === code;
      
      btn.innerHTML = `
        <div class="flex flex-col">
          <span class="text-[16px]">${data.nativeName}</span>
          <span class="text-xs text-secondary font-normal">${data.name}</span>
        </div>
        <span class="material-symbols-outlined text-primary ${isSelected ? '' : 'hidden'}">check_circle</span>
      `;
      
      btn.addEventListener('click', () => {
        this.applyLanguage(code);
        toggleSheet('language-sheet-container', false);
      });
      
      list.appendChild(btn);
    });
  }
};

// ==========================================
// TOAST NOTIFICATIONS UTILITY
// ==========================================
function showToast(message, type = 'success') {
  const toastContainer = document.getElementById('toast-container');
  if (!toastContainer) return;

  const toast = document.createElement('div');
  toast.className = `flex items-center gap-xs px-lg py-3 rounded-xl shadow-lg border text-white text-sm font-semibold select-none animate-fade-in transition-all duration-300`;
  
  if (type === 'success') {
    toast.className += ' bg-primary border-primary/20 shadow-primary/10';
  } else if (type === 'info') {
    toast.className += ' bg-secondary border-secondary/20 shadow-secondary/10';
  } else {
    toast.className += ' bg-red-600 border-red-500/20';
  }

  let icon = 'info';
  if (type === 'success') icon = 'check_circle';
  if (type === 'error') icon = 'error';

  toast.innerHTML = `
    <span class="material-symbols-outlined text-[18px]">${icon}</span>
    <span>${message}</span>
  `;

  toastContainer.appendChild(toast);

  // Remove toast after 3 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ==========================================
// ROUTER & NAVIGATION
// ==========================================
function switchView(viewName) {
  // Hide all views
  document.querySelectorAll('.app-view').forEach(view => {
    view.classList.add('hidden');
  });

  // Show active view
  const targetView = document.getElementById(`view-${viewName}`);
  if (targetView) {
    targetView.classList.remove('hidden');
  }

  // Update tabs styles
  document.querySelectorAll('.nav-tab').forEach(tab => {
    const indicator = tab.querySelector('.nav-indicator');
    const isCurrent = tab.dataset.view === viewName;
    
    if (isCurrent) {
      tab.classList.remove('text-secondary');
      tab.classList.add('text-primary');
      if (indicator) indicator.classList.remove('hidden');
    } else {
      tab.classList.remove('text-primary');
      tab.classList.add('text-secondary');
      if (indicator) indicator.classList.add('hidden');
    }
  });

  state.currentView = viewName;
  
  // Only scrollTo top if we are not preserving scroll
  // We'll let the browser keep scroll if we just un-hid it, 
  // but if it's a fresh load or manual tab click maybe we scroll.
  // For now, don't force scroll top to preserve scroll position!

  // Run initializers (only if they haven't been initialized or need fresh data)
  if (viewName === 'feed' && !feedScroller) renderFeed();
  if (viewName === 'jobs' && !jobsScroller) renderJobs();
  if (viewName === 'messages') renderChats();
  if (viewName === 'profile') renderProfile();
}

// ==========================================
// FEED VIEW INITIALIZATION & ACTIONS
// ==========================================
async function renderFeed(forceRefresh = false) {
  const storiesContainer = document.getElementById('stories-container');
  const feedItems = document.getElementById('feed-items');
  if (!storiesContainer || !feedItems) return;

  // 1. Fetch & Render Stories
  storiesContainer.innerHTML = '';
  
  // Own share story card
  const ownStory = document.createElement('div');
  ownStory.className = 'flex flex-col items-center flex-shrink-0 gap-1 cursor-pointer';
  ownStory.innerHTML = `
    <div class="w-[72px] h-[72px] rounded-full p-1 border-2 border-dashed border-outline-variant flex items-center justify-center relative">
      <div class="w-full h-full rounded-full bg-surface-container-high flex items-center justify-center overflow-hidden">
        <span class="material-symbols-outlined text-primary text-3xl">add</span>
      </div>
    </div>
    <span class="text-xs font-semibold text-secondary text-center leading-tight mt-1">Share Work<br/><span class="text-[8px] text-outline opacity-70">Post update</span></span>
  `;
  ownStory.addEventListener('click', () => toggleCreatePostSheet(true));
  storiesContainer.appendChild(ownStory);

  try {
    const storiesRes = await ApiService.fetch(`/api/stories?trade=${state.selectedTrade}`);
    state.stories = storiesRes.data || [];
    setLocalStorage('jobdone_v2_stories', state.stories);
  } catch(e) {
    console.error("Failed to fetch stories", e);
  }

  // Workers stories cards
  state.stories.forEach((story, index) => {
    const card = document.createElement('div');
    card.className = 'flex flex-col items-center flex-shrink-0 gap-1 cursor-pointer animate-fade-in';
    card.innerHTML = `
      <div class="w-[72px] h-[72px] rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 flex items-center justify-center shadow-soft">
        <div class="w-full h-full rounded-full overflow-hidden bg-surface-container border-2 border-white dark:border-surface">
          <img alt="${story.name}" class="w-full h-full object-cover" src="${story.avatar}" />
        </div>
      </div>
      <span class="text-xs font-medium text-secondary truncate max-w-[70px] leading-tight text-center mt-1">${story.name}<br/><span class="text-[8px] opacity-70">${story.distance || ''}</span></span>
    `;
    card.addEventListener('click', () => openStoryViewer(index));
    storiesContainer.appendChild(card);
  });

  // 2. Render Feed Posts
  feedItems.innerHTML = '';
  
  // Feed rendering is now handled entirely by InfiniteScroller

  // Bind tab click events
  document.querySelectorAll('.feed-tab-btn').forEach(btn => {
    // Reset to inactive state
    btn.classList.remove('bg-primary', 'text-on-primary', 'border-primary', 'border', 'active');
    btn.classList.add('bg-surface-container', 'text-secondary');
    
    const isTradeButton = btn.dataset.tab === 'trade';
    const isTradeActive = state.selectedTrade !== 'all';
    
    // Highlight if it's the active tab OR it's the trade button and a trade is selected
    if (btn.dataset.tab === state.activeFeedTab || (isTradeButton && isTradeActive)) {
      btn.classList.remove('bg-surface-container', 'text-secondary');
      btn.classList.add('bg-primary', 'text-on-primary');
    }
    
    // Special border styling for the AI Picks button
    if (btn.dataset.tab === 'ai' && btn.dataset.tab !== state.activeFeedTab) {
       btn.classList.add('border', 'border-primary/30');
    }
    
    btn.onclick = (e) => {
      const selectedTab = e.currentTarget.dataset.tab;
      
      // If user clicks "trade" tab, toggle the trade filter UI
      if (selectedTab === 'trade') {
        TradeFilter.toggle(true);
        return; // Do not switch tabs
      }
      
      state.activeFeedTab = selectedTab;
      if (feedScroller) {
        feedScroller.destroy();
        feedScroller = null;
      }
      renderFeed();
    };
  });

  // Setup Event Delegation for Feed Actions
  if (!feedItems.dataset.eventsBound) {
    feedItems.dataset.eventsBound = 'true';
    feedItems.addEventListener('click', async (e) => {
      const likeBtn = e.target.closest('.like-btn');
      if (likeBtn) return toggleLikePost(likeBtn.dataset.postId);

      const commentBtn = e.target.closest('.comment-trigger-btn');
      if (commentBtn) return promptAddComment(commentBtn.dataset.postId);

      const shareBtn = e.target.closest('.share-post-btn');
      if (shareBtn) return sharePost({ id: shareBtn.dataset.postId }); // Mock share 

      const msgBtn = e.target.closest('.feed-msg-btn');
      if (msgBtn) return openDirectChat(msgBtn.dataset.authorName, msgBtn.dataset.authorAvatar, msgBtn.dataset.authorTitle);

      const followBtn = e.target.closest('.feed-follow-btn');
      if (followBtn) {
        const author = followBtn.dataset.author;
        const isCurrentlyFollowing = state.following.includes(author);

        if (isCurrentlyFollowing) {
          if (!confirm(`Are you sure you want to unfollow ${author}?`)) return;
        }

        // Set loading state
        const originalHTML = followBtn.innerHTML;
        const originalClasses = followBtn.className;
        followBtn.disabled = true;
        followBtn.className = "feed-follow-btn px-4 py-2 bg-surface-container-high text-secondary text-xs font-bold rounded-full opacity-70 cursor-not-allowed w-28 flex items-center justify-center gap-1";
        followBtn.innerHTML = `<span class="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>`;

        try {
          if (isCurrentlyFollowing) {
            await ApiService.fetch(`/api/users/${encodeURIComponent(author)}/follow`, { method: 'DELETE' });
            const newFollowing = state.following.filter(f => f !== author);
            updateState('following', newFollowing);
            showToast(`Unfollowed ${author}`);
            
            // Render Not Following button
            followBtn.className = "feed-follow-btn px-4 py-2 bg-primary text-on-primary text-xs font-bold rounded-full shadow-lg shadow-primary/10 hover:bg-primary-container active:scale-95 transition-all w-28 flex items-center justify-center gap-1";
            followBtn.innerHTML = `Follow`;
          } else {
            await ApiService.fetch(`/api/users/${encodeURIComponent(author)}/follow`, { method: 'POST' });
            const newFollowing = [...state.following, author];
            updateState('following', newFollowing);
            showToast(`You are now following this worker.`, 'success');
            
            // Render Following button
            followBtn.className = "feed-follow-btn group px-4 py-2 bg-surface-container text-secondary text-xs font-bold rounded-full border border-outline-variant/30 active:scale-95 transition-all w-28 flex items-center justify-center gap-1 hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-900/20 dark:hover:text-red-400 dark:hover:border-red-800";
            followBtn.innerHTML = `<span class="group-hover:hidden flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">check</span> Following</span><span class="hidden group-hover:block">Unfollow</span>`;
          }
        } catch (error) {
          // Revert on error
          followBtn.className = originalClasses;
          followBtn.innerHTML = originalHTML;
          showToast(`Failed to update follow status.`, 'error');
        }
        followBtn.disabled = false;
        
        // If we are currently in the "Following" tab, we need to completely reset the feed to reflect the removed posts
        if (state.activeFeedTab === 'following' && isCurrentlyFollowing) {
           // We just unfollowed someone in the Following tab. Their posts should instantly disappear!
           // We can just trigger a feed refresh.
           renderFeed(true);
        }
        return;
      }

      // Profile click navigation
      const avatarOrName = e.target.closest('.feed-avatar') || e.target.closest('.feed-author-name');
      if (avatarOrName) {
        const name = avatarOrName.dataset.authorName;
        if (name === 'Arjun Sharma') switchView('profile');
        else showToast(`Viewing ${name}'s portfolio`, 'info');
      }
    });
  }

  // Initialize Infinite Scroller for Feed
  if (!feedScroller) {
    feedScroller = new InfiniteScroller(feedItems, {
      fetchData: async (cursor) => {
        const followingQuery = state.activeFeedTab === 'following' ? `&following=${encodeURIComponent(state.following.join(','))}` : '';
        return ApiService.fetch(`/api/feed?limit=10&tab=${state.activeFeedTab}&trade=${state.selectedTrade}${cursor ? '&cursor='+cursor : ''}${followingQuery}`);
      },
      renderItem: (post) => renderFeedPostHTML(post),
      renderSkeleton: () => `
        <div class="bg-surface-container-lowest rounded-xl border border-outline-variant/20 p-md mb-6 w-full h-[400px] skeleton-box"></div>
      `,
      emptyMessage: "No posts found. Try following more workers!",
      endMessage: "You're all caught up on the feed."
    });
    
    // Initialize Pull-To-Refresh
    if (!pullToRefreshFeed) {
      pullToRefreshFeed = new PullToRefresh(document.getElementById('view-feed'), async () => {
        if (feedScroller) feedScroller.reset();
      });
    }
  }
}

function renderFeedPostHTML(post) {
  // Build tags HTML
  let tagsHtml = '';
  if (post.tags && post.tags.length > 0) {
    tagsHtml = `
      <div class="flex flex-wrap gap-2">
        ${post.tags.map(tag => `<span class="px-3 py-1 bg-surface-variant/50 text-on-surface-variant text-xs font-semibold rounded-full">${tag}</span>`).join('')}
      </div>
    `;
  }

  // Build media image HTML
  let mediaHtml = '';
  if (post.mediaUrl) {
    mediaHtml = `
      <div class="relative aspect-video w-full bg-surface-container-high">
        <img alt="Work Sample" class="w-full h-full object-cover opacity-0 transition-opacity duration-700" data-src="${post.mediaUrl}" onload="this.classList.remove('opacity-0')" />
        ${post.verifiedWork ? `
          <div class="absolute top-md right-md">
            <span class="px-3 py-1.5 bg-primary-container/90 backdrop-blur-md text-on-primary text-xs font-bold rounded-full flex items-center gap-1">
              <span class="material-symbols-outlined text-[14px]" style="font-variation-settings: 'FILL' 1;">verified</span>
              Verified Work
            </span>
          </div>
        ` : ''}
      </div>
    `;
  }

  // Build comment preview HTML if any
  let commentPreview = '';
  if (post.comments && post.comments.length > 0) {
    commentPreview = `
      <div class="bg-surface-container-low/40 px-md py-sm rounded-lg text-xs space-y-1">
        ${post.comments.map(c => `
          <div><span class="font-bold text-on-surface">${c.author}</span> <span class="text-on-surface-variant">${c.text}</span></div>
        `).join('')}
      </div>
    `;
  }

  const isFollowing = state.following.includes(post.authorName);
  
  return `
    <article class="animate-slide-up bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,90,180,0.04)] overflow-hidden border border-outline-variant/20 mb-6 w-full">
      <div class="p-md flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full overflow-hidden bg-surface-container cursor-pointer feed-avatar skeleton-box" data-author-name="${post.authorName}">
            <img alt="${post.authorName}" class="w-full h-full object-cover opacity-0 transition-opacity duration-500" data-src="${post.authorAvatar}" onload="this.classList.remove('opacity-0')" />
          </div>
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <h3 class="font-bold text-on-surface text-sm cursor-pointer feed-author-name" data-author-name="${post.authorName}">${post.authorName}</h3>
              ${post.hasPlatinumBadge ? `<span class="flex items-center gap-1 bg-[#E0F7FA]/50 text-[#00838F] px-1.5 py-0.5 rounded-full text-[9px] font-bold border border-[#B2EBF2] uppercase tracking-wider"><span class="material-symbols-outlined text-[12px]" style="font-variation-settings: 'FILL' 1;">workspace_premium</span> PLATINUM</span>` : ''}
              ${post.authorName !== state.profile.name ? `
                <span class="text-secondary/30">•</span>
              ` : ''}
            </div>
            <div class="flex items-center gap-2 mt-0.5">
              <p class="text-xs font-medium text-secondary">${post.authorTitle} • ${post.timeAgo}</p>
              ${post.trade ? `<span class="bg-secondary/10 text-secondary px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border border-secondary/20">${post.trade}</span>` : ''}
              ${post.matchScore ? `<span class="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-0.5"><span class="material-symbols-outlined text-[10px]">smart_toy</span> ${post.matchScore}% Match</span>` : ''}
              ${post.distance ? `<a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Worker Location ' + post.distance)}" target="_blank" rel="noopener noreferrer" class="bg-[#e8f0fe] text-[#1a73e8] border border-[#1a73e8]/20 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 hover:bg-[#d2e3fc] transition-colors cursor-pointer" title="View on Google Maps"><span class="material-symbols-outlined text-[12px]">location_on</span> ${post.distance}</a>` : ''}
            </div>
          </div>
        </div>
        <button class="feed-more-btn material-symbols-outlined text-secondary hover:text-primary transition-colors">more_vert</button>
      </div>

      ${mediaHtml}

      <div class="p-md space-y-3">
        <p class="text-body-md text-on-surface-variant leading-relaxed select-text">${post.content}</p>
        
        ${tagsHtml}
        ${commentPreview}

        <hr class="border-outline-variant/30"/>
        
        <div class="flex items-center justify-between pt-1">
          <div class="flex items-center gap-4">
            <button class="like-btn flex items-center gap-1.5 text-secondary hover:text-primary transition-all duration-200 active:scale-90" data-post-id="${post.id}">
              <span class="material-symbols-outlined text-[20px] ${post.liked ? 'text-primary' : ''}" style="font-variation-settings: 'FILL' ${post.liked ? '1' : '0'};">favorite</span>
              <span class="text-xs font-semibold select-none like-count">${post.likes}</span>
            </button>
            <button class="comment-trigger-btn flex items-center gap-1.5 text-secondary hover:text-primary transition-all duration-200 active:scale-90" data-post-id="${post.id}">
              <span class="material-symbols-outlined text-[20px]">chat_bubble</span>
              <span class="text-xs font-semibold select-none">${post.commentsCount}</span>
            </button>
            <button class="share-post-btn flex items-center gap-1.5 text-secondary hover:text-primary transition-all duration-200 active:scale-90" data-post-id="${post.id}">
              <span class="material-symbols-outlined text-[20px]">share</span>
            </button>
          </div>
          <div class="flex items-center gap-2">
            ${post.authorName !== state.profile.name ? `
              ${isFollowing ? `
                <button class="feed-follow-btn group px-4 py-2 bg-surface-container text-secondary text-xs font-bold rounded-full border border-outline-variant/30 active:scale-95 transition-all w-28 flex items-center justify-center gap-1 hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-900/20 dark:hover:text-red-400 dark:hover:border-red-800" data-author="${post.authorName}">
                  <span class="group-hover:hidden flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">check</span> Following</span>
                  <span class="hidden group-hover:block">Unfollow</span>
                </button>
              ` : `
                <button class="feed-follow-btn px-4 py-2 bg-primary text-on-primary text-xs font-bold rounded-full shadow-lg shadow-primary/10 hover:bg-primary-container active:scale-95 transition-all w-28 flex items-center justify-center gap-1" data-author="${post.authorName}">
                  Follow
                </button>
              `}
            ` : ''}
            <button class="feed-msg-btn px-4 py-2 bg-primary text-on-primary text-xs font-bold rounded-full shadow-lg shadow-primary/10 hover:bg-primary-container active:scale-95 transition-all w-28 flex items-center justify-center gap-1" data-author-name="${post.authorName}" data-author-avatar="${post.authorAvatar}" data-author-title="${post.authorTitle}">
              Message
            </button>
          </div>
        </div>
      </div>
    </article>
  `;
}

// Ensure toggleLikePost updates DOM optimistically
function toggleLikePost(postId) {
  // Find the button and optimistically update
  const btn = document.querySelector(`.like-btn[data-post-id="${postId}"]`);
  if (btn) {
    const icon = btn.querySelector('.material-symbols-outlined');
    const count = btn.querySelector('.like-count');
    const isLiked = icon.classList.contains('text-primary');
    
    if (isLiked) {
      icon.classList.remove('text-primary');
      icon.style.fontVariationSettings = "'FILL' 0";
      count.innerText = parseInt(count.innerText) - 1;
    } else {
      icon.classList.add('text-primary');
      icon.style.fontVariationSettings = "'FILL' 1";
      count.innerText = parseInt(count.innerText) + 1;
    }
  }
}

function promptAddComment(postId) {
  const text = prompt("Enter your comment:");
  if (!text || text.trim() === '') return;

  const updatedFeed = state.feed.map(post => {
    if (post.id === postId) {
      const comments = [...post.comments, { author: "You", text: text.trim() }];
      return { 
        ...post, 
        comments, 
        commentsCount: post.commentsCount + 1 
      };
    }
    return post;
  });
  updateState('feed', updatedFeed);
  renderFeed();
  showToast("Comment added!");
}

function sharePost(post) {
  const shareData = {
    title: `JobDone Showcase by ${post.authorName}`,
    text: post.content,
    url: `${window.location.origin}/#feed-${post.id}`
  };

  if (navigator.share) {
    navigator.share(shareData)
      .then(() => showToast("Post shared successfully!"))
      .catch(err => console.log(err));
  } else {
    navigator.clipboard.writeText(shareData.url);
    showToast("Post link copied to clipboard!");
  }
}

function shareProfile() {
  const shareData = {
    title: `JobDone Profile - ${state.profile.name}`,
    text: state.profile.bio,
    url: `${window.location.origin}/#profile-${state.profile.name.replace(/\s+/g, '-').toLowerCase()}`
  };

  if (navigator.share) {
    navigator.share(shareData)
      .then(() => showToast("Profile shared successfully!"))
      .catch(err => console.log(err));
  } else {
    navigator.clipboard.writeText(shareData.url);
    showToast("Profile link copied to clipboard!");
  }
}


// ==========================================
// STORY VIEWER SYSTEM
// ==========================================
function openStoryViewer(index) {
  state.activeStoryIndex = index;
  const story = state.stories[index];
  if (!story) return;

  const modal = document.getElementById('story-viewer-container');
  const avatar = document.getElementById('story-viewer-avatar');
  const name = document.getElementById('story-viewer-name');
  const subtitle = document.getElementById('story-viewer-subtitle');
  const img = document.getElementById('story-viewer-img');
  const caption = document.getElementById('story-viewer-caption');
  const progress = document.getElementById('story-progress-indicator');
  const msgBtn = document.getElementById('story-viewer-msg-btn');

  if (!modal || !img) return;

  avatar.src = story.avatar;
  name.innerText = story.name;
  subtitle.innerText = story.skills.join(' • ');
  img.src = story.storyImage;
  caption.innerText = story.caption;
  modal.classList.remove('hidden');

  // Trigger messaging from story
  msgBtn.onclick = () => {
    closeStoryViewer();
    const targetNameEl = document.getElementById('hire-target-name');
    if (targetNameEl) targetNameEl.innerText = story.name;
    if (window.toggleSheet) {
      window.toggleSheet('hire-me-modal-container', true);
    } else {
      const sheet = document.getElementById('hire-me-modal-container');
      if (sheet) sheet.classList.remove('hidden');
    }
  };

  const likeBtn = document.getElementById('story-viewer-like-btn');
  if (likeBtn) {
    likeBtn.onclick = () => {
      showToast("Story Liked!", "success");
      const icon = likeBtn.querySelector('.material-symbols-outlined');
      if (icon) {
        icon.style.fontVariationSettings = "'FILL' 1";
        icon.classList.add('text-red-500');
      }
    };
  }

  // Start progress bar
  if (state.storyTimer) clearInterval(state.storyTimer);
  let percent = 0;
  progress.style.width = '0%';
  
  const startStoryTimer = () => {
    if (state.storyTimer) clearInterval(state.storyTimer);
    state.storyTimer = setInterval(() => {
      percent += 2;
      progress.style.width = `${percent}%`;
      
      if (percent >= 100) {
        clearInterval(state.storyTimer);
        // Loop navigation: Go to next, or back to first if at end
        const nextIndex = (state.activeStoryIndex + 1) % state.stories.length;
        openStoryViewer(nextIndex);
      }
    }, 100);
  };
  
  startStoryTimer();

  // Play/Pause on hold
  const pauseStory = () => clearInterval(state.storyTimer);
  const resumeStory = () => startStoryTimer();
  img.onmousedown = pauseStory;
  img.onmouseup = resumeStory;
  img.ontouchstart = pauseStory;
  img.ontouchend = resumeStory;

  // Tap navigation
  const navLeft = document.getElementById('story-nav-left');
  const navRight = document.getElementById('story-nav-right');
  
  if (navLeft) {
    navLeft.onclick = (e) => {
      e.stopPropagation();
      clearInterval(state.storyTimer);
      const prevIndex = state.activeStoryIndex === 0 ? state.stories.length - 1 : state.activeStoryIndex - 1;
      openStoryViewer(prevIndex);
    };
  }
  
  if (navRight) {
    navRight.onclick = (e) => {
      e.stopPropagation();
      clearInterval(state.storyTimer);
      const nextIndex = (state.activeStoryIndex + 1) % state.stories.length;
      openStoryViewer(nextIndex);
    };
  }

  // Swipe-down-to-close gestures
  let startY = 0;
  let currentY = 0;
  
  modal.ontouchstart = (e) => {
    startY = e.touches[0].clientY;
  };
  
  modal.ontouchmove = (e) => {
    currentY = e.touches[0].clientY;
    const diff = currentY - startY;
    if (diff > 30) {
      modal.style.transform = `translateY(${diff}px)`;
      modal.style.transition = 'none';
    }
  };
  
  modal.ontouchend = () => {
    const diff = currentY - startY;
    modal.style.transform = '';
    modal.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    if (diff > 120) {
      closeStoryViewer();
    }
    // reset
    startY = 0;
    currentY = 0;
  };
}

function closeStoryViewer() {
  const modal = document.getElementById('story-viewer-container');
  if (modal) modal.classList.add('hidden');
  if (state.storyTimer) {
    clearInterval(state.storyTimer);
    state.storyTimer = null;
  }
}

// ==========================================
// JOBS VIEW INITIALIZATION & ACTIONS
// =====================================let jobsCategoryFilter = 'all';
let jobsSearchQuery = '';

function renderJobs() {
  const jobsList = document.getElementById('jobs-list');
  const searchInput = document.getElementById('jobs-search-input');
  if (!jobsList) return;

  // Setup Event Delegation for Jobs Actions
  if (!jobsList.dataset.eventsBound) {
    jobsList.addEventListener('click', async (e) => {
      const card = e.target.closest('.job-card');
      if (!card) return;
      
      const jobId = card.dataset.jobId;
      
      if (e.target.closest('.apply-job-btn')) {
        return applyToJob(jobId);
      }
      if (e.target.closest('.bookmark-job-btn')) {
        return showToast("Job Bookmarked!", "info");
      }
      
      // Default to opening job details
      // Open mock details
      showToast(`Viewing details for Job ID: ${jobId}`, "info");
    });
  }
  
  // Bind search input to refresh jobs scroller
  if (searchInput && !searchInput.dataset.eventsBound) {
    searchInput.dataset.eventsBound = 'true';
    // Debounce search
    let timeout = null;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        jobsSearchQuery = e.target.value.toLowerCase().trim();
        if (jobsScroller) {
          jobsScroller.destroy();
          jobsScroller = null;
        }
        renderJobs();
      }, 500);
    });
  }

  // Bind category filters
  if (!document.getElementById('filter-chips-container').dataset.eventsBound) {
    document.getElementById('filter-chips-container').dataset.eventsBound = 'true';
    document.querySelectorAll('.filter-chip').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-chip').forEach(b => {
          b.classList.remove('bg-primary', 'text-on-primary');
          b.classList.add('bg-surface-container', 'text-secondary');
        });
        e.currentTarget.classList.remove('bg-surface-container', 'text-secondary');
        e.currentTarget.classList.add('bg-primary', 'text-on-primary');
        
        state.activeJobsTab = e.currentTarget.dataset.category;
        
        if (jobsScroller) {
          jobsScroller.destroy();
          jobsScroller = null;
        }
        renderJobs();
      });
    });
  }

  // Initialize Infinite Scroller for Jobs
  if (!jobsScroller) {
    jobsScroller = new InfiniteScroller(jobsList, {
      fetchData: async (cursor) => {
        const query = jobsSearchQuery ? `&query=${encodeURIComponent(jobsSearchQuery)}` : '';
        return ApiService.fetch(`/api/jobs?limit=10&category=${state.activeJobsTab}&trade=${state.selectedTrade}${query}${cursor ? '&cursor='+cursor : ''}`);
      },
      renderItem: (job) => renderJobCardHTML(job),
      renderSkeleton: () => `
        <div class="bg-surface-container-lowest rounded-xl p-md mb-4 w-full h-[180px] skeleton-box"></div>
      `,
      emptyMessage: "No jobs found. Try adjusting your filters.",
      endMessage: "No more jobs for this category."
    });
    
    // Initialize Pull-To-Refresh
    if (!pullToRefreshJobs) {
      pullToRefreshJobs = new PullToRefresh(document.getElementById('view-jobs'), async () => {
        if (jobsScroller) jobsScroller.reset();
      });
    }
  }
}

function renderJobCardHTML(job) {
  // Random AI Injection
  let aiBlockHtml = '';
  const rnd = Math.random();
  if (rnd > 0.85) {
     const types = ['🤖 AI Recommended Jobs', '🔥 Trending Jobs', '📍 Nearby Jobs', '⚡ Urgent Hiring', '💰 High Paying Jobs', '⭐ Jobs From Followed Clients'];
     const title = types[Math.floor(Math.random() * types.length)];
     aiBlockHtml = `
       <div class="w-full bg-gradient-to-r from-primary/10 to-transparent p-md rounded-2xl mb-6 border-l-4 border-primary shadow-sm flex items-center justify-between cursor-pointer hover:bg-primary/10 transition-colors">
         <div>
           <h3 class="text-sm font-bold text-primary flex items-center gap-2">${title}</h3>
           <p class="text-xs text-secondary mt-1 font-medium">Discover more opportunities matching this criteria.</p>
         </div>
         <span class="material-symbols-outlined text-primary">arrow_forward_ios</span>
       </div>
     `;
  }
  
  return aiBlockHtml + `
    <div class="job-card bg-surface-container-lowest rounded-3xl p-md shadow-[0px_8px_24px_rgba(0,90,180,0.06)] border border-outline-variant/30 transition-all duration-300 hover:shadow-[0px_12px_32px_rgba(0,90,180,0.12)] mb-6" data-job-id="${job.id}">
      
      <!-- Header: Client Profile & Meta -->
      <div class="flex justify-between items-start mb-4">
        <div class="flex items-center gap-3 cursor-pointer">
          <div class="w-11 h-11 rounded-full overflow-hidden bg-surface-container border border-outline-variant/20 shadow-inner skeleton-box">
            <img class="w-full h-full object-cover opacity-0 transition-opacity duration-300" data-src="${job.clientAvatar || job.companyLogo}" onload="this.classList.remove('opacity-0')" alt="${job.company}" />
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <span class="font-bold text-on-surface text-sm tracking-tight">${job.company}</span>
              ${job.verified ? `<span class="material-symbols-outlined text-[14px] text-primary" style="font-variation-settings: 'FILL' 1;" title="Verified Client">verified</span>` : ''}
            </div>
            <div class="flex items-center gap-2 mt-0.5 text-[11px] text-secondary font-semibold uppercase tracking-wider">
              <span>${job.timeAgo || '2h ago'}</span>
              <span class="text-outline-variant/60">•</span>
              <span class="text-primary-container bg-primary/5 px-1.5 py-0.5 rounded border border-primary/10">${job.trade ? job.trade : (job.category || 'General')}</span>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-2">
          ${job.isUrgent ? `<span class="bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase flex items-center gap-1 shadow-sm"><span class="material-symbols-outlined text-[12px] animate-pulse">local_fire_department</span> Urgent</span>` : ''}
          <button class="material-symbols-outlined text-secondary hover:text-primary transition-colors p-1 text-[20px] active:scale-95">more_horiz</button>
        </div>
      </div>

      <!-- Job Title & AI Match -->
      <div class="mb-3">
        <h3 class="font-extrabold text-headline-sm text-on-surface leading-tight mb-2">${job.title}</h3>
        ${job.matchScore ? `
          <div class="inline-flex items-center gap-1 bg-gradient-to-r from-[#e8f0fe] to-white text-[#1a73e8] px-2.5 py-1 rounded-lg border border-[#1a73e8]/20 shadow-sm">
            <span class="material-symbols-outlined text-[14px]">smart_toy</span>
            <span class="text-xs font-extrabold">${job.matchScore}% AI Match</span>
          </div>
        ` : ''}
      </div>
      
      <!-- Description Preview -->
      <p class="text-body-sm text-on-surface-variant leading-relaxed line-clamp-2 mb-4 font-medium">
        ${job.description || 'Looking for an experienced professional for this role. Competitive payouts and great working environment. Immediate start required.'}
      </p>

      <!-- Badges Grid -->
      <div class="grid grid-cols-2 gap-2.5 mb-4">
        <div class="flex items-center gap-2.5 bg-surface-container-low p-2.5 rounded-xl border border-outline-variant/10 shadow-sm">
          <div class="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0">
            <span class="material-symbols-outlined text-[18px]">payments</span>
          </div>
          <div class="flex flex-col overflow-hidden">
            <span class="text-[9px] text-secondary uppercase font-bold tracking-wide">Budget</span>
            <span class="text-xs font-bold text-on-surface truncate">${job.payRate}</span>
          </div>
        </div>
        <div class="flex items-center gap-2.5 bg-surface-container-low p-2.5 rounded-xl border border-outline-variant/10 shadow-sm">
          <div class="w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
            <span class="material-symbols-outlined text-[18px]">schedule</span>
          </div>
          <div class="flex flex-col overflow-hidden">
            <span class="text-[9px] text-secondary uppercase font-bold tracking-wide">Duration</span>
            <span class="text-xs font-bold text-on-surface truncate">${job.duration || '1 week'}</span>
          </div>
        </div>
        <div class="flex items-center gap-2.5 bg-surface-container-low p-2.5 rounded-xl border border-outline-variant/10 shadow-sm">
          <div class="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <span class="material-symbols-outlined text-[18px]">location_on</span>
          </div>
          <div class="flex flex-col overflow-hidden">
            <span class="text-[9px] text-secondary uppercase font-bold tracking-wide">Location</span>
            <span class="text-xs font-bold text-on-surface truncate">${job.location}</span>
          </div>
        </div>
        <div class="flex items-center gap-2.5 bg-surface-container-low p-2.5 rounded-xl border border-outline-variant/10 shadow-sm">
          <div class="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <span class="material-symbols-outlined text-[18px]">route</span>
          </div>
          <div class="flex flex-col overflow-hidden">
            <span class="text-[9px] text-secondary uppercase font-bold tracking-wide">Distance</span>
            <span class="text-xs font-bold text-on-surface truncate">${job.distance || '5km away'}</span>
          </div>
        </div>
      </div>

      <!-- Footer Meta -->
      <div class="flex items-center justify-between text-[11px] text-secondary font-bold mb-4 px-1 uppercase tracking-wider">
        <span class="flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">group</span> ${job.applicationsCount || Math.floor(Math.random()*50)} Applicants</span>
        <span class="flex items-center gap-1 text-primary cursor-pointer hover:underline">View Client <span class="material-symbols-outlined text-[14px]">arrow_forward</span></span>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-2 pt-4 border-t border-outline-variant/20">
        <button class="flex-1 py-3 bg-primary text-on-primary rounded-xl font-bold text-sm hover:bg-primary-container active:scale-95 transition-all shadow-[0_4px_12px_rgba(0,90,180,0.25)] flex items-center justify-center gap-1.5">
          <span class="material-symbols-outlined text-[18px]">send</span> Apply Now
        </button>
        <button class="p-3 bg-[#e8f0fe] text-[#1a73e8] rounded-xl hover:bg-[#d2e3fc] active:scale-95 transition-all flex items-center justify-center" title="Chat with Client">
          <span class="material-symbols-outlined text-[20px]">chat</span>
        </button>
        <button class="p-3 bg-surface-container text-secondary rounded-xl hover:bg-surface-container-high active:scale-95 transition-all flex items-center justify-center" title="Save Job">
          <span class="material-symbols-outlined text-[20px]">bookmark</span>
        </button>
        <button class="p-3 bg-surface-container text-secondary rounded-xl hover:bg-surface-container-high active:scale-95 transition-all flex items-center justify-center" title="Share Job">
          <span class="material-symbols-outlined text-[20px]">share</span>
        </button>
      </div>

    </div>
  `;
}

function applyToJob(jobId) {
  const btn = document.querySelector(`.job-card[data-job-id="${jobId}"] .apply-job-btn`);
  if (btn && !btn.disabled) {
    btn.disabled = true;
    btn.innerText = 'Applied';
    btn.classList.remove('bg-primary', 'text-on-primary');
    btn.classList.add('bg-secondary', 'text-white');
    showToast("Application submitted successfully!", "success");
  }

  // Prepend a chat connection from this company recruiter
  const jobObj = state.jobs.find(j => j.id === jobId);
  if (jobObj) {
    const chatExists = state.chats.find(c => c.name === jobObj.company);
    if (!chatExists) {
      const newChat = {
        id: `chat-${Date.now()}`,
        name: jobObj.company,
        avatar: jobObj.companyLogo,
        title: "Hiring Manager",
        messages: [
          { sender: "other", text: `Thank you for applying to the ${jobObj.title} position. Our hiring team will review your portfolio and message you back shortly.`, time: "Just now" }
        ],
        typingReplies: [
          "Can you let us know your availability for a phone screening?",
          "We usually pay weekly. Is that fine with you?",
          "Awesome. Let's schedule an interview soon."
        ]
      };
      const updatedChats = [newChat, ...state.chats];
      updateState('chats', updatedChats);
    }
  }
}

// ==========================================
// JOB DETAILS MODAL SYSTEM
// ==========================================
function openJobDetails(job) {
  const container = document.getElementById('job-details-modal-container');
  const logo = document.getElementById('job-detail-logo');
  const title = document.getElementById('job-detail-title');
  const company = document.getElementById('job-detail-company');
  const verifiedBadge = document.getElementById('job-detail-verified-badge');
  const location = document.getElementById('job-detail-location');
  const type = document.getElementById('job-detail-type');
  const salary = document.getElementById('job-detail-salary');
  const apps = document.getElementById('job-detail-applications');
  const desc = document.getElementById('job-detail-description');
  const applyBtn = document.getElementById('job-detail-apply-btn');

  if (!container) return;

  logo.src = job.companyLogo;
  title.innerText = job.title;
  company.innerText = job.company;
  if (job.verified) verifiedBadge.classList.remove('hidden');
  else verifiedBadge.classList.add('hidden');

  location.innerText = job.location;
  type.innerText = job.type;
  salary.innerText = job.payRate;
  apps.innerText = `${job.applicationsCount} Applications`;
  desc.innerText = job.description;

  // Apply button config
  if (job.applied) {
    applyBtn.innerText = "Applied";
    applyBtn.className = "w-full bg-secondary text-white font-bold text-label-lg py-4 px-xl rounded-full cursor-not-allowed";
    applyBtn.disabled = true;
  } else {
    applyBtn.innerText = "Apply Now";
    applyBtn.className = "w-full bg-primary text-on-primary font-bold text-label-lg py-4 px-xl rounded-full shadow-lg shadow-primary/20 hover:bg-primary-container active:scale-95 transition-all";
    applyBtn.disabled = false;
    applyBtn.onclick = () => {
      applyToJob(job.id);
      openJobDetails({ ...job, applied: true, applicationsCount: job.applicationsCount + 1 }); // refresh modal state
    };
  }

  container.classList.remove('hidden');
}

function closeJobDetails() {
  const container = document.getElementById('job-details-modal-container');
  if (container) container.classList.add('hidden');
}

// ==========================================
// CREATE POST BOTTOM SHEET
// ==========================================
let uploadedImageBase64 = "";

function toggleCreatePostSheet(show) {
  const container = document.getElementById('create-post-sheet-container');
  const form = document.getElementById('create-post-form');
  const details = document.getElementById('post-description');
  const input = document.getElementById('post-location-input');

  if (!container) return;

  if (show) {
    container.classList.remove('hidden');
    // Load existing tags
    renderCreatePostTags();
  } else {
    container.classList.add('hidden');
    // Reset form
    if (form) form.reset();
    uploadedImageBase64 = "";
    document.getElementById('upload-state-preview').classList.add('hidden');
    document.getElementById('upload-state-empty').classList.remove('hidden');
  }
}

function renderCreatePostTags() {
  const list = document.getElementById('tags-active-list');
  if (!list) return;

  list.innerHTML = '';
  state.createPostTags.forEach((tag, idx) => {
    const chip = document.createElement('div');
    chip.className = 'bg-primary/10 text-primary px-3 py-1 rounded-full flex items-center gap-1 border border-primary/20 text-xs font-bold';
    chip.innerHTML = `
      <span>${tag}</span>
      <span class="material-symbols-outlined text-sm cursor-pointer select-none font-bold">close</span>
    `;
    chip.querySelector('.material-symbols-outlined').addEventListener('click', () => {
      state.createPostTags.splice(idx, 1);
      renderCreatePostTags();
    });
    list.appendChild(chip);
  });
}

function handleImageUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(evt) {
    uploadedImageBase64 = evt.target.result;
    
    // Show preview
    const previewContainer = document.getElementById('upload-state-preview');
    const emptyContainer = document.getElementById('upload-state-empty');
    const previewImg = document.getElementById('media-img-preview');
    
    if (previewContainer && previewImg && emptyContainer) {
      previewImg.src = uploadedImageBase64;
      emptyContainer.classList.add('hidden');
      previewContainer.classList.remove('hidden');
    }
  };
  reader.readAsDataURL(file);
}

function handlePublishPost() {
  const desc = document.getElementById('post-description').value.trim();
  const loc = document.getElementById('post-location-input').value.trim() || "India";
  const visibility = document.getElementById('post-visibility').value;

  if (!desc) {
    showToast("Please describe your work details", "error");
    return;
  }

  // Create new post
  const newPost = {
    id: `feed-${Date.now()}`,
    authorName: state.profile.name,
    authorTitle: "Smart Home Expert",
    authorAvatar: state.profile.avatar,
    timeAgo: "Just now",
    content: desc,
    mediaUrl: uploadedImageBase64 || "https://lh3.googleusercontent.com/aida-public/AB6AXuAbbPGIO5t4OAh87xCrW9euQZtLoOt3vU03BRRfzHlX4CALHCVdEtENY4Xq29OMPCLULfR6nQKHnAPsn1kUQNGaos5h7bIW4PHrfDabrV91xkUGXFT8pPdX9pO7vlPhFem1P6owFqsFfJrgveKb3r7T1uL1xPGapcgviRPTfAQ2U8Kr5jlmw01JCPVpvwxB5a_qOAQP6_YlfZCHK90iWy69TRZKZvyqS9vYN0esbuH_pxw3rObkUGWa2ecKYV7o6yMZt7k1Bs2OjbhI", // fallback to portfolio image
    verifiedWork: false,
    tags: [...state.createPostTags],
    likes: 0,
    commentsCount: 0,
    comments: [],
    liked: false
  };

  const updatedFeed = [newPost, ...state.feed];
  updateState('feed', updatedFeed);
  
  toggleCreatePostSheet(false);
  showToast("Work Showcase Posted!");
  switchView('feed');
}

// ==========================================
// CHAT & MESSAGING SYSTEM
// ==========================================
function renderChats() {
  const container = document.getElementById('chats-list-container');
  if (!container) return;

  container.innerHTML = '';
  state.chats.forEach(chat => {
    const lastMsg = chat.messages[chat.messages.length - 1];
    const previewText = lastMsg ? lastMsg.text : 'No messages yet';
    const previewTime = lastMsg ? lastMsg.time : '';

    const div = document.createElement('div');
    div.className = 'flex items-center gap-md py-md cursor-pointer hover:bg-surface-container/20 active:bg-surface-container/40 transition-colors px-md rounded-xl mt-xs select-none';
    div.innerHTML = `
      <div class="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border border-outline-variant/20 bg-surface-container">
        <img alt="${chat.name}" class="w-full h-full object-cover" src="${chat.avatar}" />
      </div>
      <div class="flex-grow min-w-0">
        <div class="flex justify-between items-baseline mb-0.5">
          <h3 class="font-bold text-on-surface text-sm truncate">${chat.name}</h3>
          <span class="text-[10px] text-secondary font-medium">${previewTime}</span>
        </div>
        <p class="text-xs text-secondary truncate max-w-[200px]">${previewText}</p>
      </div>
      <span class="material-symbols-outlined text-secondary/30 text-[18px]">chevron_right</span>
    `;
    div.addEventListener('click', () => openChatWindow(chat.id));
    container.appendChild(div);
  });
}

function openDirectChat(name, avatar, title) {
  // Find or create chat
  let chat = state.chats.find(c => c.name === name);
  if (!chat) {
    chat = {
      id: `chat-${Date.now()}`,
      name: name,
      avatar: avatar,
      title: title || "Worker Connection",
      messages: [
        { sender: "other", text: `Hi, thank you for connecting. How can I help you today?`, time: "Just now" }
      ],
      typingReplies: [
        "Let me know what works for you.",
        "Sure, I can share my estimations shortly.",
        "Sounds good!"
      ]
    };
    const updatedChats = [chat, ...state.chats];
    updateState('chats', updatedChats);
  }

  // Switch to messages tab and open chat window
  switchView('messages');
  openChatWindow(chat.id);
}

function openChatWindow(chatId) {
  state.activeChatId = chatId;
  const chat = state.chats.find(c => c.id === chatId);
  if (!chat) return;

  const container = document.getElementById('chat-window-container');
  const avatar = document.getElementById('chat-header-avatar');
  const name = document.getElementById('chat-header-name');
  const title = document.getElementById('chat-header-title');

  if (!container) return;

  avatar.src = chat.avatar;
  name.innerText = chat.name;
  title.innerText = chat.title;

  container.classList.remove('hidden');
  renderChatHistory(chat);
}

function closeChatWindow() {
  const container = document.getElementById('chat-window-container');
  if (container) container.classList.add('hidden');
  state.activeChatId = null;
  // re-render chat list to update previews
  renderChats();
}

function renderChatHistory(chat) {
  const history = document.getElementById('chat-messages-history');
  if (!history) return;

  history.innerHTML = '';
  chat.messages.forEach(msg => {
    const bubble = document.createElement('div');
    const isMe = msg.sender === 'me';
    
    bubble.className = `max-w-[75%] rounded-2xl px-lg py-3 text-sm leading-relaxed ${
      isMe 
        ? 'bg-primary text-on-primary self-end rounded-br-none shadow-[0px_4px_12px_rgba(0,90,180,0.1)]' 
        : 'bg-surface-container text-on-surface self-start rounded-bl-none border border-outline-variant/10'
    }`;
    
    bubble.innerHTML = `
      <p class="select-text">${msg.text}</p>
      <span class="block text-[9px] text-right mt-1 opacity-70">${msg.time}</span>
    `;
    
    history.appendChild(bubble);
  });

  // Scroll to bottom
  setTimeout(() => {
    history.scrollTop = history.scrollHeight;
  }, 50);
}

function handleSendMessage(e) {
  e.preventDefault();
  const input = document.getElementById('chat-input-field');
  if (!input) return;

  const text = input.value.trim();
  if (!text) return;

  const chat = state.chats.find(c => c.id === state.activeChatId);
  if (!chat) return;

  // Append my message
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const myMsg = { sender: 'me', text, time: timeStr };
  
  const updatedChats = state.chats.map(c => {
    if (c.id === chat.id) {
      return { ...c, messages: [...c.messages, myMsg] };
    }
    return c;
  });
  updateState('chats', updatedChats);
  input.value = '';
  renderChatHistory(state.chats.find(c => c.id === chat.id));

  // Trigger Mock Reply
  triggerMockReply(chat.id);
}

function triggerMockReply(chatId) {
  const typingIndicator = document.getElementById('chat-typing-indicator');
  const typingName = document.getElementById('chat-typing-name');
  const chat = state.chats.find(c => c.id === chatId);
  
  if (!chat || !typingIndicator || !typingName) return;

  typingName.innerText = chat.name.split(' ')[0];
  typingIndicator.classList.remove('hidden');
  
  // Scroll to bottom to show indicator
  const history = document.getElementById('chat-messages-history');
  if (history) history.scrollTop = history.scrollHeight;

  setTimeout(() => {
    // Hide indicator
    typingIndicator.classList.add('hidden');

    // Get reply
    const replies = chat.typingReplies || ["Sounds good!"];
    const replyText = replies.length > 0 
      ? replies[Math.floor(Math.random() * replies.length)]
      : "Okay, got it.";

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const replyMsg = { sender: 'other', text: replyText, time: timeStr };

    const updatedChats = state.chats.map(c => {
      if (c.id === chatId) {
        return { ...c, messages: [...c.messages, replyMsg] };
      }
      return c;
    });
    updateState('chats', updatedChats);
    
    // Render if chat is still active
    if (state.activeChatId === chatId) {
      renderChatHistory(state.chats.find(c => c.id === chatId));
    }
  }, 1800); // 1.8 seconds delay
}

// ==========================================
// WORKER PROFILE VIEW
// ==========================================
function renderProfile() {
  const avatar = document.getElementById('profile-avatar');
  const name = document.getElementById('profile-name');
  const role = document.getElementById('profile-role');
  const rating = document.getElementById('profile-rating');
  const reviews = document.getElementById('profile-reviews');
  const bio = document.getElementById('profile-bio');
  const jobsDone = document.getElementById('profile-jobs-done');
  const connections = document.getElementById('profile-connections');
  const endorsements = document.getElementById('profile-endorsements');

  const skillsContainer = document.getElementById('profile-skills-container');
  const portfolioContainer = document.getElementById('profile-portfolio-container');

  const followBtn = document.getElementById('profile-follow-btn');
  const msgBtn = document.getElementById('profile-msg-btn');

  if (!avatar || !name) return;

  const prof = state.profile;
  avatar.src = prof.avatar;
  name.innerText = prof.name;
  role.innerText = prof.role;
  rating.innerText = prof.rating;
  reviews.innerText = `(${prof.reviewsCount} reviews)`;
  bio.innerText = prof.bio;
  jobsDone.innerText = prof.jobsDone;
  connections.innerText = prof.connections;
  endorsements.innerText = prof.endorsements;

  // Setup buttons
  if (msgBtn) {
    msgBtn.onclick = () => openDirectChat(prof.name, prof.avatar, prof.role);
  }

  if (followBtn) {
    const isCurrentlyFollowing = state.following.includes(prof.name);
    
    // Initial Render
    if (isCurrentlyFollowing) {
      followBtn.className = "group px-4 py-3 bg-surface-container text-secondary text-sm font-bold rounded-full border border-outline-variant/30 active:scale-95 transition-all flex-1 flex items-center justify-center gap-1.5 hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-900/20 dark:hover:text-red-400 dark:hover:border-red-800";
      followBtn.innerHTML = `<span class="group-hover:hidden flex items-center gap-1.5"><span class="material-symbols-outlined text-[16px]">check</span> Following</span><span class="hidden group-hover:block">Unfollow</span>`;
    } else {
      followBtn.className = "px-4 py-3 bg-primary text-on-primary text-sm font-bold rounded-full shadow-lg shadow-primary/10 hover:bg-primary-container active:scale-95 transition-all flex-1 flex items-center justify-center gap-1.5";
      followBtn.innerHTML = `Follow`;
    }

    // Click Handler
    followBtn.onclick = async () => {
      const currentlyFollowing = state.following.includes(prof.name);
      
      if (currentlyFollowing) {
        if (!confirm(`Are you sure you want to unfollow ${prof.name}?`)) return;
      }

      const originalHTML = followBtn.innerHTML;
      const originalClasses = followBtn.className;
      followBtn.disabled = true;
      followBtn.className = "px-4 py-3 bg-surface-container-high text-secondary text-sm font-bold rounded-full opacity-70 cursor-not-allowed flex-1 flex items-center justify-center gap-1.5";
      followBtn.innerHTML = `<span class="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>`;

      try {
        if (currentlyFollowing) {
          await ApiService.fetch(`/api/users/${encodeURIComponent(prof.name)}/follow`, { method: 'DELETE' });
          const newFollowing = state.following.filter(f => f !== prof.name);
          updateState('following', newFollowing);
          showToast(`Unfollowed ${prof.name}`);
          
          prof.connections = (parseInt(prof.connections.replace(/,/g, '')) - 1).toLocaleString();
          connections.innerText = prof.connections;
          
          followBtn.className = "px-4 py-3 bg-primary text-on-primary text-sm font-bold rounded-full shadow-lg shadow-primary/10 hover:bg-primary-container active:scale-95 transition-all flex-1 flex items-center justify-center gap-1.5";
          followBtn.innerHTML = `Follow`;
        } else {
          await ApiService.fetch(`/api/users/${encodeURIComponent(prof.name)}/follow`, { method: 'POST' });
          const newFollowing = [...state.following, prof.name];
          updateState('following', newFollowing);
          showToast(`You are now following this worker.`, 'success');
          
          prof.connections = (parseInt(prof.connections.replace(/,/g, '')) + 1).toLocaleString();
          connections.innerText = prof.connections;
          
          followBtn.className = "group px-4 py-3 bg-surface-container text-secondary text-sm font-bold rounded-full border border-outline-variant/30 active:scale-95 transition-all flex-1 flex items-center justify-center gap-1.5 hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-900/20 dark:hover:text-red-400 dark:hover:border-red-800";
          followBtn.innerHTML = `<span class="group-hover:hidden flex items-center gap-1.5"><span class="material-symbols-outlined text-[16px]">check</span> Following</span><span class="hidden group-hover:block">Unfollow</span>`;
        }
      } catch (error) {
        followBtn.className = originalClasses;
        followBtn.innerHTML = originalHTML;
        showToast(`Failed to update follow status.`, 'error');
      }
      followBtn.disabled = false;
      
      // Keep feed in sync
      if (state.activeFeedTab === 'following' && currentlyFollowing) {
         renderFeed(true);
      }
    };
  }

  // Skills
  skillsContainer.innerHTML = '';
  prof.skills.forEach(skill => {
    const span = document.createElement('span');
    span.className = 'skill-chip px-md py-2 rounded-lg text-label-lg font-medium border border-outline-variant/30 bg-surface-container-low text-primary select-none';
    span.innerText = skill;
    skillsContainer.appendChild(span);
  });

  // Portfolio
  portfolioContainer.innerHTML = '';
  prof.portfolio.forEach(item => {
    const div = document.createElement('div');
    div.className = 'aspect-square rounded-xl overflow-hidden shadow-sm relative group cursor-pointer border border-outline-variant/15';
    div.innerHTML = `
      <img alt="${item.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" src="${item.image}" />
      <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <span class="text-white text-xs font-semibold truncate">${item.title}</span>
      </div>
      <div class="absolute inset-0 bg-black/10 active:bg-black/35 transition-colors"></div>
    `;
    div.addEventListener('click', () => openGalleryLightbox(item));
    portfolioContainer.appendChild(div);
  });
}

function openGalleryLightbox(item) {
  const container = document.getElementById('gallery-lightbox');
  const img = document.getElementById('gallery-img');
  const title = document.getElementById('gallery-title');

  if (!container || !img) return;

  img.src = item.image;
  title.innerText = item.title;
  container.classList.remove('hidden');
}

function closeGalleryLightbox() {
  const container = document.getElementById('gallery-lightbox');
  if (container) container.classList.add('hidden');
}

// ==========================================
// HIRE ME DIRECT PROPOSAL SYSTEM
// ==========================================
function openHireMeModal() {
  const modal = document.getElementById('hire-me-modal-container');
  const targetName = document.getElementById('hire-target-name');
  if (!modal || !targetName) return;

  targetName.innerText = state.profile.name;
  modal.classList.remove('hidden');
}

function closeHireMeModal() {
  const modal = document.getElementById('hire-me-modal-container');
  if (modal) modal.classList.add('hidden');
}

function handleSendProposal(e) {
  e.preventDefault();
  const title = document.getElementById('hire-job-title').value.trim();
  const pay = document.getElementById('hire-job-pay').value.trim();
  const desc = document.getElementById('hire-job-desc').value.trim();

  if (!title || !pay || !desc) {
    showToast("Please fill in all proposal fields", "error");
    return;
  }

  closeHireMeModal();
  showToast("Proposal Offer Sent!");

  // Create messaging connection with worker
  const proposalMsg = `Direct Job Offer proposal:\n**Title**: ${title}\n**Offered Pay**: ${pay}\n**Details**: ${desc}`;
  
  // Create a chat with Arjun Sharma
  let chat = state.chats.find(c => c.name === state.profile.name);
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const myMsg = { sender: 'me', text: proposalMsg, time: timeStr };

  if (chat) {
    const updatedChats = state.chats.map(c => {
      if (c.id === chat.id) {
        return { ...c, messages: [...c.messages, myMsg] };
      }
      return c;
    });
    updateState('chats', updatedChats);
  } else {
    chat = {
      id: `chat-${Date.now()}`,
      name: state.profile.name,
      avatar: state.profile.avatar,
      title: "Smart Home Expert",
      messages: [myMsg],
      typingReplies: [
        "Thank you for the proposal! I'll review it and get back to you shortly.",
        "That budget sounds fair. Let's arrange a call.",
        "Sounds like an exciting project. I'm definitely interested."
      ]
    };
    const updatedChats = [chat, ...state.chats];
    updateState('chats', updatedChats);
  }

  // Clear form
  document.getElementById('hire-me-form').reset();

  // Redirect client to open chat window
  setTimeout(() => {
    switchView('messages');
    openChatWindow(chat.id);
    // Trigger Reply
    triggerMockReply(chat.id);
  }, 300);
}

// ==========================================
// EDIT PROFILE SYSTEM
// ==========================================
function openEditProfileModal() {
  const container = document.getElementById('edit-profile-modal-container');
  if (!container) return;

  const prof = state.profile;
  document.getElementById('edit-prof-name').value = prof.name;
  document.getElementById('edit-prof-bio').value = prof.bio;
  document.getElementById('edit-prof-skills').value = prof.skills.join(', ');
  document.getElementById('edit-prof-stat-jobs').value = prof.jobsDone;
  document.getElementById('edit-prof-stat-conn').value = prof.connections;
  document.getElementById('edit-prof-stat-endo').value = prof.endorsements;

  container.classList.remove('hidden');
}

function closeEditProfileModal() {
  const container = document.getElementById('edit-profile-modal-container');
  if (container) container.classList.add('hidden');
}

function handleSaveProfile(e) {
  e.preventDefault();
  const name = document.getElementById('edit-prof-name').value.trim();
  const bio = document.getElementById('edit-prof-bio').value.trim();
  const skillsStr = document.getElementById('edit-prof-skills').value.trim();
  const jobsDone = document.getElementById('edit-prof-stat-jobs').value.trim() || "0";
  const connections = document.getElementById('edit-prof-stat-conn').value.trim() || "0";
  const endorsements = document.getElementById('edit-prof-stat-endo').value.trim() || "0";

  if (!name || !bio) {
    showToast("Name and bio are required", "error");
    return;
  }

  const skills = skillsStr ? skillsStr.split(',').map(s => s.trim()).filter(s => s !== '') : [];

  const updatedProfile = {
    ...state.profile,
    name,
    bio,
    skills,
    jobsDone,
    connections,
    endorsements
  };

  updateState('profile', updatedProfile);
  
  // Re-render and close
  renderProfile();
  closeEditProfileModal();
  showToast("Profile Saved Successfully!");
}

function handleProfileAvatarUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(evt) {
    const base64 = evt.target.result;
    
    const updatedProfile = {
      ...state.profile,
      avatar: base64
    };
    updateState('profile', updatedProfile);
    
    // Update other instances where Arjun's avatar is used in the feed
    const updatedFeed = state.feed.map(post => {
      if (post.authorName === state.profile.name) {
        return { ...post, authorAvatar: base64 };
      }
      return post;
    });
    updateState('feed', updatedFeed);
    
    // Update chats list where Arjun's avatar is used (if any)
    const updatedChats = state.chats.map(chat => {
      if (chat.name === state.profile.name) {
        return { ...chat, avatar: base64 };
      }
      return chat;
    });
    updateState('chats', updatedChats);

    renderProfile();
    showToast("Profile picture updated!");
  };
  reader.readAsDataURL(file);
}

// ==========================================
// INTERACTIVE FEATURES & OVERLAYS (ENABLING ALL ICON FEATURES)
// ==========================================

// 1. CALLING OVERLAY SYSTEM
let callTimer = null;
function openCallOverlay(name, avatar) {
  const container = document.getElementById('call-overlay-container');
  const avatarImg = document.getElementById('call-avatar');
  const nameTxt = document.getElementById('call-name');
  if (!container || !avatarImg || !nameTxt) return;

  avatarImg.src = avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuAtgc7h8rggTMnezzxskuOtxYRC4QZAqZwauVBizXVfiWEh1R0yGLBstfK5ItSthalYnz3GAcidfndxVGyo6LJfp2mj6hQ1XRYucIpc8epp_S046ULBKIk1NjcrU5LeXIckXJa6hmieE2_vOd0jZIoQoHq2xPzhBB_dY7at0bsJ50hzVRb7AvrAzn4c2MjXld0_OV8mevIJTEAxKbZbZ6sKkr1rVbGKAVVSKeCaG_PNi5ChvTUKnT4LiixWDqqbnDgI9FOirq9ArHt";
  nameTxt.innerText = name;
  container.classList.remove('hidden');

  // Auto terminate call after 6 seconds to simulate user end / no response
  if (callTimer) clearTimeout(callTimer);
  callTimer = setTimeout(() => {
    endCall(true);
  }, 6000);
}

function endCall(isTimeout = false) {
  const container = document.getElementById('call-overlay-container');
  if (container) container.classList.add('hidden');
  if (callTimer) {
    clearTimeout(callTimer);
    callTimer = null;
  }
  showToast(isTimeout ? "No answer" : "Call ended", isTimeout ? "info" : "success");
}

// 2. NOTIFICATIONS BOTTOM SHEET
function toggleNotificationsSheet(show) {
  const container = document.getElementById('notifications-sheet-container');
  if (container) {
    if (show) container.classList.remove('hidden');
    else container.classList.add('hidden');
  }
}

// 3. POST OPTIONS BOTTOM SHEET
let selectedPostForOptions = null;
function openPostOptions(post) {
  selectedPostForOptions = post;
  const container = document.getElementById('post-options-sheet-container');
  if (container) container.classList.remove('hidden');
}

function closePostOptions() {
  const container = document.getElementById('post-options-sheet-container');
  if (container) container.classList.add('hidden');
  selectedPostForOptions = null;
}

// 4. NEW MESSAGE BOTTOM SHEET
function toggleNewMessageSheet(show) {
  const container = document.getElementById('new-message-sheet-container');
  if (!container) return;

  if (show) {
    container.classList.remove('hidden');
    renderNewMessageContacts();
  } else {
    container.classList.add('hidden');
  }
}

function renderNewMessageContacts() {
  const list = document.getElementById('new-message-contacts-list');
  if (!list) return;

  list.innerHTML = '';
  
  // Contacts we can message (stories/feed authors or default list)
  const contacts = [
    { name: "Priya S.", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAvqXxQAADDj2gFTjvSLoBQIxqWpnzp3VIMmjq3Xc5RC-f2nZgYlRfy_ZGcSzpFIoC9Zk3Xd5vje8CyhAlKXD-Tnu4sj9ncltqH2-ICD0eI1BNVSrnPYtRvZA3Rx3UleSfdS47y5YJCkrJyQe-5vEaMnWZ10fauggNwqU8kD2YT-xskoZyc7F99Py04dIpVL3umsEmJBtNmIdmrJzWrP3a2Jd4N9YV1RYDjP0D2gc_0YcOXo2379SO3GUsWU01Yp-GHX9zG26YpMHxS", trade: "Interior Design Specialist" },
    { name: "Rohan K.", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBSNI8ErWW6rZgTe9yzZpYOiNH_7Hqbnf0kErZgYUHT1jl5z-cE2WUP6UuP4-CI_RqdztrTVpz3SxoqGBA0ZjV_XAHR5P7r-Jvw4EF_Zcq1KrKNmrMEAPwj3U1D63NR5nN-GiL8v1HKzVy3E0VUv4hMQdLqNqTDipMwRaRh8Ylp-Ga0nBQDmxfsmbDsFx0MQVB7AEdaLhCVJpMNjLJIFLPZjpsJWMJXrDWYekYfZ4gQCYhA-GKabyYUIavxhF5IcIHsU49YhcqQqaHn", trade: "Plumbing Technician" },
    { name: "Amit M.", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCfxb-620UjTlMeQ7Te_kIDAy9XKbI3gnd2l_ivE0Ob98C9x8bY6IPlKER0cEyFNoVNP7bzG9k4FWMRxAbhpgW2PD7EewJ8U8C2vxgTiZ7-titSJvwejWUNdUsasM9LgXzR4OyHVym-H7LLS1QEvkt1jXJXhaAbzG7hhmKmjR7iNrm_avSIXnEiGmhqG1komqjHvZmHVK0Dru_qsj75QL9mcnyCCCfQn6vdLvoCbLp10Tju5oXO4nv-KeRwPYxoxE8jGbGdmQOwk7RI", trade: "HVAC Mechanic" },
    { name: "Vikram Singh", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuALs8liAJfjbLidgUNfggRcyjgG10awIhtUwcL9DxBr2zUlC7HwrnXxZsZ4DI0Sw3iwBhL7_l0eFfRlJbbtnujlWjuDVaC4nUsPCqeLtsIV0r-7DozqEPZ1yS8M7OSQKSdhJ84gjIwSSqSpL4IZncvslmEwSxfocmAQg_rkTMZMQ4-Xo0K32NBMTI5fWU5NSnbOOSj8umcZZ8qrP6Uqnudg8rdhe9zpZ-ljgvl00yEARctOfhj-AA4BagogufU4etoA3DlWMRmpcsJR", trade: "Electrical Contractor" }
  ];

  contacts.forEach(c => {
    const item = document.createElement('div');
    item.className = 'flex items-center gap-md py-md px-md rounded-xl hover:bg-surface-container/30 active:bg-surface-container/50 transition-colors cursor-pointer select-none';
    item.innerHTML = `
      <div class="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-outline-variant/10 bg-surface-container">
        <img alt="${c.name}" class="w-full h-full object-cover" src="${c.avatar}" />
      </div>
      <div class="flex-grow">
        <h4 class="font-bold text-on-surface text-sm">${c.name}</h4>
        <p class="text-xs text-secondary mt-0.5">${c.trade}</p>
      </div>
      <span class="material-symbols-outlined text-primary text-[20px]">chat_bubble</span>
    `;
    item.addEventListener('click', () => {
      toggleNewMessageSheet(false);
      openDirectChat(c.name, c.avatar, c.trade);
    });
    list.appendChild(item);
  });
}

// 5. CHAT ATTACHMENTS (IMAGE MESSAGES)
function handleChatAttachmentUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(evt) {
    const base64 = evt.target.result;
    const chat = state.chats.find(c => c.id === state.activeChatId);
    if (!chat) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Create image message bubble
    const imgText = `<img src="${base64}" class="rounded-lg max-w-full h-32 md:h-40 object-cover mt-xs border border-outline-variant/20 cursor-pointer" onclick="window.open('${base64}')" />`;
    const imageMsg = { sender: 'me', text: imgText, time: timeStr };

    const updatedChats = state.chats.map(c => {
      if (c.id === chat.id) {
        return { ...c, messages: [...c.messages, imageMsg] };
      }
      return c;
    });
    updateState('chats', updatedChats);
    
    // Reset file input
    e.target.value = "";
    
    // Render and scroll
    renderChatHistory(state.chats.find(c => c.id === chat.id));
    
    // Trigger automated response
    triggerMockReply(chat.id);
  };
  reader.readAsDataURL(file);
}

// 6. CHAT SEARCH
function triggerChatSearch() {
  const query = prompt("Search conversations by contact name:");
  if (query === null) return; // cancelled
  
  const searchQuery = query.toLowerCase().trim();
  const container = document.getElementById('chats-list-container');
  if (!container) return;

  const filteredChats = state.chats.filter(chat => chat.name.toLowerCase().includes(searchQuery));
  
  if (filteredChats.length === 0) {
    container.innerHTML = `
      <div class="text-center py-xl space-y-md">
        <span class="material-symbols-outlined text-[48px] text-secondary/30">search_off</span>
        <p class="text-sm text-secondary">No conversations match "${query}"</p>
        <button onclick="window.location.reload()" class="text-primary text-xs font-bold hover:underline">Reset Search</button>
      </div>
    `;
    return;
  }

  // Re-render conversation items using filtered list
  container.innerHTML = '';
  filteredChats.forEach(chat => {
    const lastMsg = chat.messages[chat.messages.length - 1];
    const previewText = lastMsg ? lastMsg.text : 'No messages yet';
    const previewTime = lastMsg ? lastMsg.time : '';

    const div = document.createElement('div');
    div.className = 'flex items-center gap-md py-md cursor-pointer hover:bg-surface-container/20 active:bg-surface-container/40 transition-colors px-md rounded-xl mt-xs select-none';
    div.innerHTML = `
      <div class="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border border-outline-variant/20 bg-surface-container">
        <img alt="${chat.name}" class="w-full h-full object-cover" src="${chat.avatar}" />
      </div>
      <div class="flex-grow min-w-0">
        <div class="flex justify-between items-baseline mb-0.5">
          <h3 class="font-bold text-on-surface text-sm truncate">${chat.name}</h3>
          <span class="text-[10px] text-secondary font-medium">${previewTime}</span>
        </div>
        <p class="text-xs text-secondary truncate max-w-[200px]">${previewText}</p>
      </div>
      <span class="material-symbols-outlined text-secondary/30 text-[18px]">chevron_right</span>
    `;
    div.addEventListener('click', () => openChatWindow(chat.id));
    container.appendChild(div);
  });
}


// ==========================================
// AI ASSISTANT, VOICE & LOCATION SYSTEMS
// ==========================================
const AIAssistant = {
  isListening: false,
  recognition: null,
  
  init() {
    if ('webkitSpeechRecognition' in window) {
      this.recognition = new webkitSpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      
      this.recognition.onstart = () => {
        this.isListening = true;
        document.getElementById('feed-mic-btn')?.classList.add('text-red-500', 'animate-pulse');
        document.getElementById('ai-voice-input-btn')?.classList.add('text-red-500', 'animate-pulse');
      };
      
      this.recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        if (document.getElementById('ai-assistant-container').classList.contains('hidden')) {
          document.getElementById('feed-search-input').value = text;
          this.parseIntent(text);
        } else {
          document.getElementById('ai-chat-input').value = text;
          this.handleChatSubmit(text);
        }
      };
      
      this.recognition.onend = () => {
        this.isListening = false;
        document.getElementById('feed-mic-btn')?.classList.remove('text-red-500', 'animate-pulse');
        document.getElementById('ai-voice-input-btn')?.classList.remove('text-red-500', 'animate-pulse');
      };
    }
  },
  
  startVoiceSearch() {
    if (!this.recognition) {
      showToast("Voice search not supported in this browser", "error");
      return;
    }
    if (this.isListening) {
      this.recognition.stop();
    } else {
      this.recognition.start();
    }
  },
  
  parseIntent(text) {
    const query = text.toLowerCase();
    showToast("AI is analyzing your request...", "info");
    
    setTimeout(() => {
      if (query.includes('job') || query.includes('work') || query.includes('hire')) {
        switchView('jobs');
        document.getElementById('jobs-search-input').value = text;
        renderJobs();
      } else if (query.includes('plumb') || query.includes('electric') || query.includes('repair')) {
        switchView('jobs');
        document.getElementById('jobs-search-input').value = text;
        renderJobs();
      } else {
        document.getElementById('feed-search-input').value = text;
        showToast("Search applied to feed!");
      }
    }, 1000);
  },
  
  appendMessage(text, isUser = false) {
    const history = document.getElementById('ai-chat-history');
    if (!history) return;
    
    const div = document.createElement('div');
    if (isUser) {
      div.className = 'self-end max-w-[85%] bg-primary text-white rounded-2xl rounded-tr-sm p-3 shadow-sm';
    } else {
      div.className = 'self-start max-w-[85%] bg-surface-container rounded-2xl rounded-tl-sm p-3 shadow-sm border border-outline-variant/10 flex gap-2';
    }
    
    div.innerHTML = `<p class="text-sm leading-relaxed">${text}</p>`;
    history.appendChild(div);
    history.scrollTop = history.scrollHeight;
  },
  
  showTyping() {
    const history = document.getElementById('ai-chat-history');
    const div = document.createElement('div');
    div.id = 'ai-typing-indicator';
    div.className = 'self-start max-w-[85%] bg-surface-container rounded-2xl rounded-tl-sm p-4 shadow-sm border border-outline-variant/10 flex gap-1 items-center mt-2';
    div.innerHTML = `
      <div class="w-1.5 h-1.5 bg-secondary rounded-full typing-dot"></div>
      <div class="w-1.5 h-1.5 bg-secondary rounded-full typing-dot"></div>
      <div class="w-1.5 h-1.5 bg-secondary rounded-full typing-dot"></div>
    `;
    history.appendChild(div);
    history.scrollTop = history.scrollHeight;
  },
  
  hideTyping() {
    const indicator = document.getElementById('ai-typing-indicator');
    if (indicator) indicator.remove();
  },
  
  handleChatSubmit(text) {
    if (!text.trim()) return;
    
    this.appendMessage(text, true);
    document.getElementById('ai-chat-input').value = '';
    this.showTyping();
    
    setTimeout(() => {
      this.hideTyping();
      const query = text.toLowerCase();
      let response = "I found some great options for you. Let me know what you want to do next!";
      
      if (query.includes('electrician') || query.includes('plumb')) {
        response = "I see you're looking for a specialist. I've filtered the Jobs section for you.";
        setTimeout(() => {
          toggleSheet('ai-assistant-container', false);
          switchView('jobs');
          document.getElementById('jobs-search-input').value = query;
          renderJobs();
        }, 3000);
      } else if (query.includes('theme') || query.includes('dark')) {
        response = "Sure, I can open the theme settings for you.";
        setTimeout(() => {
          toggleSheet('ai-assistant-container', false);
          toggleSheet('theme-sheet-container', true);
        }, 2000);
      }
      
      this.appendMessage(response, false);
    }, 1500);
  }
};

const LocationManager = {
  requestLocation() {
    if (navigator.geolocation) {
      showToast("Fetching location...", "info");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          updateState('userLocation', {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          showToast("Location updated! Distance tracking enabled.", "success");
          renderFeed();
          renderJobs();
        },
        (error) => {
          showToast("Location access denied or unavailable", "error");
        }
      );
    }
  }
};

// Start mock smart notifications
setInterval(() => {
  if (Math.random() > 0.7) {
    showToast("AI picked a new recommended job for you!", "info");
    document.getElementById('notif-badge')?.classList.remove('hidden');
  }
}, 30000);

// ==========================================
// EVENT LISTENERS BINDINGS & APP STARTUP
// ==========================================
// ==========================================
// AI & VOICE INTEGRATION
// ==========================================
const VoiceAssistant = {
  recognition: null,
  isRecording: false,

  init() {
    if ('webkitSpeechRecognition' in window) {
      this.recognition = new window.webkitSpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        this.handleIntent(transcript);
      };

      this.recognition.onerror = (event) => {
        console.error("[AIAssistant] Speech Recognition Error:", event.error);
        showToast("Voice search failed. Try again.", "error");
        this.stopRecording();
      };

      this.recognition.onend = () => this.stopRecording();
    }
  },

  startRecording() {
    if (this.recognition && !this.isRecording) {
      try {
        this.recognition.start();
        this.isRecording = true;
        showToast("Listening...", "info");
      } catch (e) {
        console.error(e);
      }
    } else if (!this.recognition) {
      showToast("Voice search not supported in this browser.", "error");
    }
  },

  stopRecording() {
    if (this.recognition && this.isRecording) {
      this.recognition.stop();
      this.isRecording = false;
    }
  },

  handleIntent(query) {
    const q = query.toLowerCase();
    showToast(`You said: "${query}"`, "success");

    // Intent Parser
    if (q.includes('electrician') || q.includes('plumber') || q.includes('carpenter') || q.includes('job') || q.includes('work')) {
      // Auto Navigation to Jobs
      switchView('jobs');
      const searchInput = document.getElementById('jobs-search-input');
      if (searchInput) {
        searchInput.value = query;
        // Trigger generic job filter if available
        showToast(`AI routed you to Jobs for: ${query}`, "info");
      }
    } else if (q.includes('rate') || q.includes('high') || q.includes('best')) {
      state.activeFeedTab = 'ai';
      switchView('feed');
      showToast(`AI sorted feed for best recommendations`, "info");
    } else {
      // Default to feed search
      switchView('feed');
      const feedSearch = document.getElementById('feed-search-input');
      if (feedSearch) feedSearch.value = query;
    }
  }
};

const TRADES = [
  "Electrician", "Plumber", "Carpenter", "Painter", "HVAC", 
  "Mechanic", "Driver", "Mason", "Cleaner", "Interior Designer", 
  "Welder", "AC Technician", "Gardener", "CCTV Installer", "RO Technician"
];

const TradeFilter = {
  init() {
    const container = document.getElementById('trade-chips-container');
    const closeBtn = document.getElementById('close-trade-filter');
    if (!container) return;

    // Render "All" option
    container.innerHTML = `
      <button data-trade="all" class="trade-chip px-3 py-1 ${state.selectedTrade === 'all' ? 'bg-primary text-on-primary' : 'bg-surface-container text-secondary'} rounded-full text-xs font-bold whitespace-nowrap transition-colors">All Trades</button>
    `;

    // Render trades
    TRADES.forEach(trade => {
      const isSelected = state.selectedTrade === trade.toLowerCase();
      container.innerHTML += `
        <button data-trade="${trade.toLowerCase()}" class="trade-chip px-3 py-1 ${isSelected ? 'bg-primary text-on-primary' : 'bg-surface-container text-secondary hover:bg-surface-container-high'} rounded-full text-xs font-bold whitespace-nowrap transition-colors">${trade}</button>
      `;
    });

    // Bind click events
    container.addEventListener('click', (e) => {
      const chip = e.target.closest('.trade-chip');
      if (!chip) return;
      
      const newTrade = chip.dataset.trade;
      if (newTrade !== state.selectedTrade) {
        state.selectedTrade = newTrade;
        setLocalStorage('jobdone_v2_trade', newTrade);
        this.updateUI();
        
        // Reset infinite scrollers so they fetch with the new trade param
        if (feedScroller) { feedScroller.destroy(); feedScroller = null; }
        if (jobsScroller) { jobsScroller.destroy(); jobsScroller = null; }
        
        // Re-render active view
        if (state.currentView === 'feed') renderFeed();
        if (state.currentView === 'jobs') renderJobs();
      }
    });

    // Close button
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.toggle(false);
      });
    }
    
    // Initial UI state setup if trade is not 'all'
    if (state.selectedTrade !== 'all') {
       this.toggle(true);
    }
  },

  updateUI() {
    document.querySelectorAll('.trade-chip').forEach(chip => {
      if (chip.dataset.trade === state.selectedTrade) {
        chip.className = 'trade-chip px-3 py-1 bg-primary text-on-primary rounded-full text-xs font-bold whitespace-nowrap transition-colors';
      } else {
        chip.className = 'trade-chip px-3 py-1 bg-surface-container text-secondary rounded-full text-xs font-bold whitespace-nowrap transition-colors hover:bg-surface-container-high';
      }
    });
  },

  toggle(show) {
    const filterBar = document.getElementById('global-trade-filter');
    const mainContent = document.getElementById('feed-main-content');
    if (!filterBar || !mainContent) return;
    if (show) {
      filterBar.classList.remove('hidden');
      filterBar.classList.add('flex');
      mainContent.classList.replace('pt-20', 'pt-[100px]');
    } else {
      filterBar.classList.add('hidden');
      filterBar.classList.remove('flex');
      mainContent.classList.replace('pt-[100px]', 'pt-20');
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  TradeFilter.init();
  
  // 1. Navigation Tab Clicks
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const view = tab.dataset.view;
      switchView(view);
    });
  });

  // AI & New Header Bindings
  AIAssistant.init();
  
  const aiBtn = document.getElementById('feed-ai-btn');
  if (aiBtn) aiBtn.addEventListener('click', () => toggleSheet('ai-assistant-container', true));
  
  const micBtn = document.getElementById('feed-mic-btn');
  if (micBtn) micBtn.addEventListener('click', () => AIAssistant.startVoiceSearch());
  
  const locBtn = document.getElementById('feed-location-btn');
  if (locBtn) locBtn.addEventListener('click', () => LocationManager.requestLocation());
  
  const aiSendBtn = document.getElementById('ai-send-btn');
  const aiVoiceBtn = document.getElementById('ai-voice-input-btn');
  const aiInput = document.getElementById('ai-chat-input');
  
  if (aiInput) {
    aiInput.addEventListener('input', () => {
      if (aiInput.value.trim().length > 0) {
        aiSendBtn.classList.remove('hidden');
        aiVoiceBtn.classList.add('hidden');
      } else {
        aiSendBtn.classList.add('hidden');
        aiVoiceBtn.classList.remove('hidden');
      }
    });
    aiInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        AIAssistant.handleChatSubmit(aiInput.value);
        aiSendBtn.classList.add('hidden');
        aiVoiceBtn.classList.remove('hidden');
      }
    });
  }
  
  if (aiSendBtn) aiSendBtn.addEventListener('click', () => {
    AIAssistant.handleChatSubmit(aiInput.value);
    aiSendBtn.classList.add('hidden');
    aiVoiceBtn.classList.remove('hidden');
  });
  if (aiVoiceBtn) aiVoiceBtn.addEventListener('click', () => AIAssistant.startVoiceSearch());
  
  document.querySelectorAll('.ai-suggestion-btn').forEach(btn => {
    btn.addEventListener('click', (e) => AIAssistant.handleChatSubmit(e.target.innerText));
  });

  document.getElementById('ai-close-btn')?.addEventListener('click', () => toggleSheet('ai-assistant-container', false));
  document.getElementById('ai-backdrop')?.addEventListener('click', () => toggleSheet('ai-assistant-container', false));


  // 2. Center "Create" button click (open bottom sheet)
  const tabCreate = document.getElementById('tab-create');
  if (tabCreate) {
    tabCreate.addEventListener('click', () => {
      toggleCreatePostSheet(true);
    });
  }

  // 3. Create Post sheet close handlers
  document.getElementById('create-post-close-btn').addEventListener('click', () => toggleCreatePostSheet(false));
  document.getElementById('create-post-backdrop').addEventListener('click', () => toggleCreatePostSheet(false));
  document.getElementById('create-post-close-handle').addEventListener('click', () => toggleCreatePostSheet(false));

  // File Upload preview bindings
  const mediaTrigger = document.getElementById('media-upload-trigger');
  const mediaInput = document.getElementById('media-file-input');
  if (mediaTrigger && mediaInput) {
    mediaTrigger.addEventListener('click', (e) => {
      if (e.target.closest('#remove-media-btn')) return; // ignore trigger on remove button
      mediaInput.click();
    });
    mediaInput.addEventListener('change', handleImageUpload);
  }
  
  const removeMediaBtn = document.getElementById('remove-media-btn');
  if (removeMediaBtn) {
    removeMediaBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      uploadedImageBase64 = "";
      mediaInput.value = "";
      document.getElementById('upload-state-preview').classList.add('hidden');
      document.getElementById('upload-state-empty').classList.remove('hidden');
    });
  }

  // Suggested tag buttons in Create Post form
  document.querySelectorAll('.tag-suggestion-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tagText = btn.innerText;
      if (!state.createPostTags.includes(tagText)) {
        state.createPostTags.push(tagText);
        renderCreatePostTags();
      }
    });
  });

  // Add tag on enter key inside Create Post tag input
  const tagInput = document.getElementById('post-tag-input');
  if (tagInput) {
    tagInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const text = tagInput.value.trim();
        if (text && !state.createPostTags.includes(text)) {
          state.createPostTags.push(text);
          renderCreatePostTags();
          tagInput.value = '';
        }
      }
    });
  }

  // Submit Post button trigger
  document.getElementById('create-post-submit-btn').addEventListener('click', handlePublishPost);

  // 4. Jobs view specific elements
  const searchInput = document.getElementById('jobs-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', renderJobs);
    searchInput.addEventListener('focus', () => {
      searchInput.parentElement.classList.add('ring-2', 'ring-primary/20');
    });
    searchInput.addEventListener('blur', () => {
      searchInput.parentElement.classList.remove('ring-2', 'ring-primary/20');
    });
  }

  // Job category chips selection
  document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.filter-chip').forEach(c => {
        c.classList.remove('bg-primary', 'text-on-primary');
        c.classList.add('bg-surface-container', 'text-secondary');
      });
      chip.classList.remove('bg-surface-container', 'text-secondary');
      chip.classList.add('bg-primary', 'text-on-primary');

      jobsCategoryFilter = chip.dataset.category;
      renderJobs();
    });
  });

  // Profile icon click in jobs tab (shortcuts to profile)
  const jobsProfileBtn = document.getElementById('jobs-profile-btn');
  if (jobsProfileBtn) {
    jobsProfileBtn.addEventListener('click', () => switchView('profile'));
  }

  // Feed search button (shortcuts to jobs search)
  const feedSearchBtn = document.getElementById('feed-search-btn');
  if (feedSearchBtn) {
    feedSearchBtn.addEventListener('click', () => switchView('jobs'));
  }

  // 5. Job Details modal close bindings
  document.getElementById('job-details-close-btn').addEventListener('click', closeJobDetails);
  document.getElementById('job-details-backdrop').addEventListener('click', closeJobDetails);
  document.getElementById('job-details-close-handle').addEventListener('click', closeJobDetails);
  document.getElementById('job-details-bookmark-btn').addEventListener('click', () => {
    showToast("Job Bookmarked!", "info");
  });

  // 6. Chat Overlay Window bindings
  document.getElementById('chat-window-back-btn').addEventListener('click', closeChatWindow);
  document.getElementById('chat-message-form').addEventListener('submit', handleSendMessage);
  document.getElementById('chat-header-hire-shortcut-btn').addEventListener('click', openHireMeModal);

  // 7. Story Viewer Modal close bindings
  document.getElementById('story-viewer-close-btn').addEventListener('click', closeStoryViewer);
  
  // Story navigation taps
  const navLeft = document.getElementById('story-nav-left');
  const navRight = document.getElementById('story-nav-right');
  if (navLeft && navRight) {
    navLeft.addEventListener('click', () => {
      if (state.activeStoryIndex - 1 >= 0) {
        openStoryViewer(state.activeStoryIndex - 1);
      }
    });
    navRight.addEventListener('click', () => {
      if (state.activeStoryIndex + 1 < state.stories.length) {
        openStoryViewer(state.activeStoryIndex + 1);
      } else {
        closeStoryViewer();
      }
    });
  }

  // 8. Profile View Actions
  const profileAvatarContainer = document.getElementById('profile-avatar-container');
  const profileAvatarInput = document.getElementById('profile-avatar-input');
  if (profileAvatarContainer && profileAvatarInput) {
    profileAvatarContainer.addEventListener('click', () => {
      profileAvatarInput.click();
    });
    profileAvatarInput.addEventListener('change', handleProfileAvatarUpload);
  }

  const hireBtn = document.getElementById('profile-hire-btn');
  if (hireBtn) hireBtn.addEventListener('click', openHireMeModal);

  const profileMsgBtn = document.getElementById('profile-msg-btn');
  if (profileMsgBtn) {
    profileMsgBtn.addEventListener('click', () => {
      openDirectChat(state.profile.name, state.profile.avatar, state.profile.bio);
    });
  }

  const profileBackBtn = document.getElementById('profile-back-btn');
  if (profileBackBtn) {
    profileBackBtn.addEventListener('click', () => switchView('feed'));
  }

  const profileShareBtn = document.getElementById('profile-share-btn');
  if (profileShareBtn) {
    profileShareBtn.addEventListener('click', shareProfile);
  }

  // Portfolio Lightbox close
  document.getElementById('gallery-close-btn').addEventListener('click', closeGalleryLightbox);

  // 9. Hire Me proposal modal close/submit
  document.getElementById('hire-me-close-btn').addEventListener('click', closeHireMeModal);
  document.getElementById('hire-me-backdrop').addEventListener('click', closeHireMeModal);
  document.getElementById('hire-me-close-handle').addEventListener('click', closeHireMeModal);
  document.getElementById('hire-me-submit-btn').addEventListener('click', handleSendProposal);

  // 10. Edit Profile modal triggers & handlers
  document.getElementById('profile-edit-btn').addEventListener('click', openEditProfileModal);
  document.getElementById('edit-profile-close-btn').addEventListener('click', closeEditProfileModal);
  document.getElementById('edit-profile-backdrop').addEventListener('click', closeEditProfileModal);
  document.getElementById('edit-profile-close-handle').addEventListener('click', closeEditProfileModal);
  document.getElementById('edit-profile-save-btn').addEventListener('click', handleSaveProfile);

  // 11. Notifications Sheet triggers & handlers
  const feedNotifBtn = document.getElementById('feed-notif-btn');
  if (feedNotifBtn) feedNotifBtn.addEventListener('click', () => toggleNotificationsSheet(true));
  
  const jobsNotifBtn = document.getElementById('jobs-notif-btn');
  if (jobsNotifBtn) jobsNotifBtn.addEventListener('click', () => toggleNotificationsSheet(true));

  const notifCloseBtn = document.getElementById('notifications-close-btn');
  if (notifCloseBtn) notifCloseBtn.addEventListener('click', () => toggleNotificationsSheet(false));
  
  const notifBackdrop = document.getElementById('notifications-backdrop');
  if (notifBackdrop) notifBackdrop.addEventListener('click', () => toggleNotificationsSheet(false));
  
  const notifCloseHandle = document.getElementById('notifications-close-handle');
  if (notifCloseHandle) notifCloseHandle.addEventListener('click', () => toggleNotificationsSheet(false));

  // 12. Post Options Sheet triggers & handlers
  const postOptShare = document.getElementById('post-opt-share');
  if (postOptShare) {
    postOptShare.addEventListener('click', () => {
      if (selectedPostForOptions) sharePost(selectedPostForOptions);
      closePostOptions();
    });
  }

  const postOptHide = document.getElementById('post-opt-hide');
  if (postOptHide) {
    postOptHide.addEventListener('click', () => {
      if (selectedPostForOptions) {
        const updatedFeed = state.feed.filter(p => p.id !== selectedPostForOptions.id);
        updateState('feed', updatedFeed);
        renderFeed();
        showToast("Post hidden from feed", "info");
      }
      closePostOptions();
    });
  }

  const postOptReport = document.getElementById('post-opt-report');
  if (postOptReport) {
    postOptReport.addEventListener('click', () => {
      showToast("Post reported. Thank you!", "success");
      closePostOptions();
    });
  }

  const postOptCancel = document.getElementById('post-opt-cancel');
  if (postOptCancel) postOptCancel.addEventListener('click', closePostOptions);

  const postOptBackdrop = document.getElementById('post-options-backdrop');
  if (postOptBackdrop) postOptBackdrop.addEventListener('click', closePostOptions);

  const postOptCloseHandle = document.getElementById('post-options-close-handle');
  if (postOptCloseHandle) postOptCloseHandle.addEventListener('click', closePostOptions);

  // 13. New Message Sheet triggers & handlers
  const msgNewBtn = document.getElementById('msg-new-btn');
  if (msgNewBtn) msgNewBtn.addEventListener('click', () => toggleNewMessageSheet(true));

  const msgSearchBtn = document.getElementById('msg-search-btn');
  if (msgSearchBtn) msgSearchBtn.addEventListener('click', triggerChatSearch);

  const msgNewCloseBtn = document.getElementById('new-message-close-btn');
  if (msgNewCloseBtn) msgNewCloseBtn.addEventListener('click', () => toggleNewMessageSheet(false));

  const msgNewBackdrop = document.getElementById('new-message-backdrop');
  if (msgNewBackdrop) msgNewBackdrop.addEventListener('click', () => toggleNewMessageSheet(false));

  const msgNewCloseHandle = document.getElementById('new-message-close-handle');
  if (msgNewCloseHandle) msgNewCloseHandle.addEventListener('click', () => toggleNewMessageSheet(false));

  // 14. Chat Window Actions (Calling & Attachments)
  const chatCallBtn = document.getElementById('chat-call-btn');
  if (chatCallBtn) {
    chatCallBtn.addEventListener('click', () => {
      const activeChat = state.chats.find(c => c.id === state.activeChatId);
      if (activeChat) {
        openCallOverlay(activeChat.name, activeChat.avatar);
      }
    });
  }

  const endCallBtn = document.getElementById('end-call-btn');
  if (endCallBtn) endCallBtn.addEventListener('click', () => endCall());

  const chatAttachBtn = document.getElementById('chat-attach-btn');
  const chatAttachInput = document.getElementById('chat-attach-input');
  if (chatAttachBtn && chatAttachInput) {
    chatAttachBtn.addEventListener('click', () => chatAttachInput.click());
    chatAttachInput.addEventListener('change', handleChatAttachmentUpload);
  }

  // 15. Profile View Action bindings
  const profileSettingsBtn = document.getElementById('profile-settings-btn');
  if (profileSettingsBtn) {
    profileSettingsBtn.addEventListener('click', () => {
      switchView('settings');
    });
  }

  // 16. Settings View Action bindings
  const settingsBackBtn = document.getElementById('settings-back-btn');
  if (settingsBackBtn) {
    settingsBackBtn.addEventListener('click', () => switchView('profile'));
  }

  // Helper for bottom sheets
  window.toggleSheet = function(sheetId, show) {
    const sheet = document.getElementById(sheetId);
    if (!sheet) return;
    if (show) {
      sheet.classList.remove('hidden');
    } else {
      sheet.classList.add('hidden');
    }
  };

  const bindSheetClose = (sheetId, closeBtnId, backdropId, handleId) => {
    [closeBtnId, backdropId, handleId].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('click', () => toggleSheet(sheetId, false));
    });
  };

  bindSheetClose('language-sheet-container', 'language-close-btn', 'language-backdrop', 'language-close-handle');
  bindSheetClose('theme-sheet-container', 'theme-close-btn', 'theme-backdrop', 'theme-close-handle');
  bindSheetClose('accent-sheet-container', 'accent-close-btn', 'accent-backdrop', 'accent-close-handle');

  const langBtn = document.getElementById('settings-lang-btn');
  if (langBtn) langBtn.addEventListener('click', () => toggleSheet('language-sheet-container', true));

  const themeBtn = document.getElementById('settings-theme-btn');
  if (themeBtn) themeBtn.addEventListener('click', () => toggleSheet('theme-sheet-container', true));
  
  document.querySelectorAll('.theme-opt-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const themeVal = e.currentTarget.dataset.theme;
      if (themeVal) {
        ThemeManager.applyTheme(themeVal);
        setTimeout(() => toggleSheet('theme-sheet-container', false), 200);
      }
    });
  });

  const accentBtn = document.getElementById('settings-accent-btn');
  if (accentBtn) {
    accentBtn.addEventListener('click', () => {
      // Build accent grid if not built
      const grid = document.getElementById('accent-color-grid');
      if (grid && grid.children.length === 0) {
        const colors = [
          {id: 'orange', hex: '#e65100'},
          {id: 'blue', hex: '#005ab4'},
          {id: 'green', hex: '#2e7d32'},
          {id: 'purple', hex: '#6a1b9a'},
          {id: 'red', hex: '#c62828'},
          {id: 'yellow', hex: '#f57f17'},
          {id: 'pink', hex: '#d81b60'},
          {id: 'black', hex: '#212121'}
        ];
        
        colors.forEach(c => {
          const cBtn = document.createElement('button');
          cBtn.className = `accent-opt-btn w-12 h-12 rounded-full mx-auto flex items-center justify-center transition-transform active:scale-90`;
          cBtn.style.backgroundColor = c.hex;
          cBtn.dataset.accent = c.id;
          if (c.id === ThemeManager.accent) {
            cBtn.classList.add('border-primary', 'border-2');
          }
          cBtn.addEventListener('click', () => {
            ThemeManager.applyAccent(c.id);
            setTimeout(() => toggleSheet('accent-sheet-container', false), 200);
          });
          grid.appendChild(cBtn);
        });
      }
      toggleSheet('accent-sheet-container', true);
    });
  }

  // Smart Notifications Generator
  const simulateSmartNotifications = () => {
    setInterval(() => {
      const isJob = Math.random() > 0.5;
      if (isJob && state.jobs.length > 0) {
        const job = state.jobs[Math.floor(Math.random() * state.jobs.length)];
        showToast(`AI Match: ${job.title} at ${job.company} matches your skills!`, 'info');
      } else if (state.feed.length > 0) {
        const post = state.feed[Math.floor(Math.random() * state.feed.length)];
        showToast(`Trending: ${post.authorName} just posted in your area!`, 'info');
      }
    }, 45000); // every 45 seconds
  };

  // Initialize and launch app
  ThemeManager.init();
  LanguageManager.init();
  VoiceAssistant.init();
  PwaService.register();
  
  // Bind Header actions
  const feedMicBtn = document.getElementById('feed-mic-btn');
  if (feedMicBtn) {
    feedMicBtn.addEventListener('click', () => {
      VoiceAssistant.startRecording();
    });
  }

  const feedLocationBtn = document.getElementById('feed-location-btn');
  if (feedLocationBtn) {
    feedLocationBtn.addEventListener('click', () => {
      LocationService.requestLocation(
        (coords) => {
          state.userLocation = coords;
          showToast("Location updated successfully", "success");
          // Re-sort feed based on distance if needed
          state.activeFeedTab = 'nearby';
          renderFeed();
        },
        () => showToast("Could not determine location", "error")
      );
    });
  }

  switchView('feed');
  simulateSmartNotifications();
});
