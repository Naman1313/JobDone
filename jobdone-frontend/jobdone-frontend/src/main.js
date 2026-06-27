import './style.css';
import { initialStories, initialJobs, initialFeed, initialChats, ArjunProfile } from './data.js';

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
  stories: getLocalStorage('jobdone_stories', initialStories),
  jobs: getLocalStorage('jobdone_jobs', initialJobs),
  feed: getLocalStorage('jobdone_feed', initialFeed),
  chats: getLocalStorage('jobdone_chats', initialChats),
  profile: getLocalStorage('jobdone_profile', ArjunProfile),
  currentView: 'feed',
  activeChatId: null,
  activeStoryIndex: 0,
  storyTimer: null,
  createPostTags: ['Plumbing', 'Installation'] // In-memory tags for Create Post form
};

// Update and save helpers
function updateState(key, value) {
  state[key] = value;
  setLocalStorage(`jobdone_${key}`, value);
}

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
  window.scrollTo({ top: 0, behavior: 'instant' });

  // Run initializers
  if (viewName === 'feed') renderFeed();
  if (viewName === 'jobs') renderJobs();
  if (viewName === 'messages') renderChats();
  if (viewName === 'profile') renderProfile();
}

// ==========================================
// FEED VIEW INITIALIZATION & ACTIONS
// ==========================================
function renderFeed() {
  const storiesContainer = document.getElementById('stories-container');
  const feedItems = document.getElementById('feed-items');
  if (!storiesContainer || !feedItems) return;

  // 1. Render Stories
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
    <span class="text-xs font-semibold text-secondary">Share</span>
  `;
  ownStory.addEventListener('click', () => toggleCreatePostSheet(true));
  storiesContainer.appendChild(ownStory);

  // Workers stories cards
  state.stories.forEach((story, index) => {
    const card = document.createElement('div');
    card.className = 'flex flex-col items-center flex-shrink-0 gap-1 cursor-pointer';
    card.innerHTML = `
      <div class="w-[72px] h-[72px] rounded-full p-1 border-2 border-primary flex items-center justify-center bg-white shadow-soft">
        <div class="w-full h-full rounded-full overflow-hidden bg-surface-container">
          <img alt="${story.name}" class="w-full h-full object-cover" src="${story.avatar}" />
        </div>
      </div>
      <span class="text-xs font-medium text-secondary truncate max-w-[70px]">${story.name}</span>
    `;
    card.addEventListener('click', () => openStoryViewer(index));
    storiesContainer.appendChild(card);
  });

  // 2. Render Feed Posts
  feedItems.innerHTML = '';
  state.feed.forEach(post => {
    const article = document.createElement('article');
    article.className = 'animate-slide-up bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,90,180,0.04)] overflow-hidden border border-outline-variant/20';
    
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
        <div class="relative aspect-video w-full">
          <img alt="Work Sample" class="w-full h-full object-cover" src="${post.mediaUrl}" />
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

    article.innerHTML = `
      <div class="p-md flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full overflow-hidden bg-surface-container cursor-pointer" id="feed-avatar-${post.id}">
            <img alt="${post.authorName}" class="w-full h-full object-cover" src="${post.authorAvatar}" />
          </div>
          <div>
            <h3 class="font-bold text-on-surface text-sm cursor-pointer" id="feed-author-${post.id}">${post.authorName}</h3>
            <p class="text-xs font-medium text-secondary">${post.authorTitle} • ${post.timeAgo}</p>
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
              <span class="text-xs font-semibold select-none">${post.likes}</span>
            </button>
            <button class="comment-trigger-btn flex items-center gap-1.5 text-secondary hover:text-primary transition-all duration-200 active:scale-90" data-post-id="${post.id}">
              <span class="material-symbols-outlined text-[20px]">chat_bubble</span>
              <span class="text-xs font-semibold select-none">${post.commentsCount}</span>
            </button>
            <button class="share-post-btn flex items-center gap-1.5 text-secondary hover:text-primary transition-all duration-200 active:scale-90" data-post-id="${post.id}">
              <span class="material-symbols-outlined text-[20px]">share</span>
            </button>
          </div>
          
          <button class="feed-msg-btn px-4 py-2 bg-primary text-on-primary text-xs font-bold rounded-full shadow-lg shadow-primary/10 hover:bg-primary-container active:scale-95 transition-all" data-author-name="${post.authorName}" data-author-avatar="${post.authorAvatar}" data-author-title="${post.authorTitle}">
            Message
          </button>
        </div>
      </div>
    `;

    // Bind event handlers inside post
    const likeBtn = article.querySelector('.like-btn');
    likeBtn.addEventListener('click', () => toggleLikePost(post.id));

    const sharePostBtn = article.querySelector('.share-post-btn');
    sharePostBtn.addEventListener('click', () => sharePost(post));

    const msgBtn = article.querySelector('.feed-msg-btn');
    msgBtn.addEventListener('click', () => {
      const authorName = msgBtn.dataset.authorName;
      const authorAvatar = msgBtn.dataset.authorAvatar;
      const authorTitle = msgBtn.dataset.authorTitle;
      openDirectChat(authorName, authorAvatar, authorTitle);
    });

    const commentBtn = article.querySelector('.comment-trigger-btn');
    commentBtn.addEventListener('click', () => promptAddComment(post.id));

    const feedMoreBtn = article.querySelector('.feed-more-btn');
    if (feedMoreBtn) {
      feedMoreBtn.addEventListener('click', () => openPostOptions(post));
    }

    // Profile click navigation (Navigate to Arjun Sharma profile if clicked Arjun)
    const avatarClick = article.querySelector(`#feed-avatar-${post.id}`);
    const authorClick = article.querySelector(`#feed-author-${post.id}`);
    
    const navToProfile = () => {
      if (post.authorName === 'Arjun Sharma') {
        switchView('profile');
      } else {
        // Mock showing details of other workers
        showToast(`Viewing ${post.authorName}'s portfolio`, 'info');
        openDirectChat(post.authorName, post.authorAvatar, post.authorTitle);
      }
    };
    avatarClick.addEventListener('click', navToProfile);
    authorClick.addEventListener('click', navToProfile);

    feedItems.appendChild(article);
  });
}

function toggleLikePost(postId) {
  const updatedFeed = state.feed.map(post => {
    if (post.id === postId) {
      const liked = !post.liked;
      const likes = liked ? post.likes + 1 : post.likes - 1;
      return { ...post, liked, likes };
    }
    return post;
  });
  updateState('feed', updatedFeed);
  renderFeed();
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
    openDirectChat(story.name, story.avatar, story.skills.join(' • '));
  };

  // Start progress bar
  if (state.storyTimer) clearInterval(state.storyTimer);
  let percent = 0;
  progress.style.width = '0%';
  
  state.storyTimer = setInterval(() => {
    percent += 2;
    progress.style.width = `${percent}%`;
    
    if (percent >= 100) {
      clearInterval(state.storyTimer);
      // Auto advance or close
      if (state.activeStoryIndex + 1 < state.stories.length) {
        openStoryViewer(state.activeStoryIndex + 1);
      } else {
        closeStoryViewer();
      }
    }
  }, 100); // 5 seconds story duration
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
// ==========================================
let jobsCategoryFilter = 'all';

function renderJobs() {
  const jobsList = document.getElementById('jobs-list');
  const searchInput = document.getElementById('jobs-search-input');
  if (!jobsList) return;

  const searchQuery = searchInput ? searchInput.value.toLowerCase().trim() : '';

  jobsList.innerHTML = '';
  
  // Filter jobs
  const filteredJobs = state.jobs.filter(job => {
    const matchesCategory = jobsCategoryFilter === 'all' || job.category.toLowerCase() === jobsCategoryFilter.toLowerCase();
    const matchesSearch = job.title.toLowerCase().includes(searchQuery) || job.company.toLowerCase().includes(searchQuery) || job.description.toLowerCase().includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  if (filteredJobs.length === 0) {
    jobsList.innerHTML = `
      <div class="text-center py-xl space-y-md">
        <span class="material-symbols-outlined text-[64px] text-secondary/30">search_off</span>
        <h3 class="font-bold text-on-surface text-lg">No Jobs Found</h3>
        <p class="text-sm text-secondary px-lg">Try resetting filters or checking your spelling.</p>
      </div>
    `;
    return;
  }

  filteredJobs.forEach(job => {
    const card = document.createElement('div');
    card.className = `bg-surface-container-lowest rounded-xl p-md shadow-[0px_4px_20px_rgba(0,93,184,0.06)] border border-outline-variant/30 active:scale-[0.99] transition-all duration-200 cursor-pointer`;
    
    card.innerHTML = `
      <div class="flex justify-between items-start mb-xs select-none">
        <div class="flex gap-md">
          <div class="w-12 h-12 rounded-lg bg-surface-container overflow-hidden flex-shrink-0 border border-outline-variant/10">
            <img class="w-full h-full object-cover" src="${job.companyLogo}" />
          </div>
          <div>
            <h3 class="font-bold text-headline-md text-on-surface leading-snug">${job.title}</h3>
            <div class="flex items-center gap-1 mt-0.5">
              <span class="text-sm font-medium text-secondary">${job.company}</span>
              ${job.verified ? `
                <span class="material-symbols-outlined text-[16px] text-primary" style="font-variation-settings: 'FILL' 1;">verified</span>
                <span class="text-primary font-bold text-[9px] uppercase tracking-wider">Verified</span>
              ` : ''}
            </div>
          </div>
        </div>
        <button class="bookmark-job-btn material-symbols-outlined text-secondary hover:text-primary transition-colors">bookmark</button>
      </div>
      
      <div class="flex flex-wrap gap-xs my-md">
        <div class="flex items-center gap-1 bg-surface-container-low px-2 py-0.5 rounded border border-outline-variant/10">
          <span class="material-symbols-outlined text-[16px] text-secondary">location_on</span>
          <span class="text-xs text-secondary font-medium">${job.location}</span>
        </div>
        <div class="flex items-center gap-1 bg-surface-container-low px-2 py-0.5 rounded border border-outline-variant/10">
          <span class="material-symbols-outlined text-[16px] text-secondary">schedule</span>
          <span class="text-xs text-secondary font-medium">${job.type}</span>
        </div>
      </div>
      
      <div class="flex justify-between items-center pt-md border-t border-outline-variant/20">
        <div class="flex flex-col">
          <span class="text-[10px] text-secondary uppercase font-bold tracking-wider">Pay Rate</span>
          <span class="font-bold text-primary-container text-sm">${job.payRate}</span>
        </div>
        
        <div class="flex gap-sm">
          <button class="view-job-details-btn px-sm py-2 bg-surface-container text-secondary rounded-full font-bold text-xs hover:bg-surface-container-high transition-colors">
            Details
          </button>
          <button class="apply-job-btn px-lg py-2 ${job.applied ? 'bg-secondary text-white' : 'bg-primary text-on-primary'} rounded-full font-bold text-xs active:scale-95 transition-transform shadow-lg shadow-primary/10" ${job.applied ? 'disabled' : ''}>
            ${job.applied ? 'Applied' : 'Quick Apply'}
          </button>
        </div>
      </div>
    `;

    // Click handler for body
    card.addEventListener('click', (e) => {
      if (e.target.closest('.apply-job-btn') || e.target.closest('.bookmark-job-btn')) {
        return; // handle separately
      }
      openJobDetails(job);
    });

    // Bookmark trigger
    card.querySelector('.bookmark-job-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      showToast("Job Bookmarked!", "info");
    });

    // Detail button trigger
    card.querySelector('.view-job-details-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      openJobDetails(job);
    });

    // Apply button trigger
    const applyBtn = card.querySelector('.apply-job-btn');
    applyBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      applyToJob(job.id);
    });

    jobsList.appendChild(card);
  });
}

function applyToJob(jobId) {
  const updatedJobs = state.jobs.map(job => {
    if (job.id === jobId) {
      return { ...job, applied: true, applicationsCount: job.applicationsCount + 1 };
    }
    return job;
  });
  updateState('jobs', updatedJobs);
  renderJobs();
  showToast("Application Sent Successfully!");

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
// EVENT LISTENERS BINDINGS & APP STARTUP
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  
  // 1. Navigation Tab Clicks
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const view = tab.dataset.view;
      switchView(view);
    });
  });

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
      showToast("Profile Settings under development", "info");
    });
  }

  // Initialize and launch app
  switchView('feed');
});
