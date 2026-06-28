export class InfiniteScroller {
  constructor(container, options) {
    this.container = container;
    this.options = options;
    this.fetchData = options.fetchData;
    this.renderItem = options.renderItem;
    this.renderSkeleton = options.renderSkeleton;
    this.emptyMessage = options.emptyMessage || 'No items found.';
    this.endMessage = options.endMessage || "You're all caught up!";
    
    this.items = [];
    this.cursor = null;
    this.hasMore = true;
    this.isLoading = false;
    
    // Insert sentinel right after container
    this.sentinel = document.createElement('div');
    this.sentinel.className = 'w-full flex items-center justify-center min-h-[60px] pb-8';
    this.container.insertAdjacentElement('afterend', this.sentinel);
    
    this.observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !this.isLoading && this.hasMore) {
        this.loadNext();
      }
    }, { rootMargin: '800px' }); // Prefetch when 800px away from bottom
    
    this.observer.observe(this.sentinel);
    
    // Virtualization Observer (Memory Optimization)
    this.virtualObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const el = entry.target;
        if (!entry.isIntersecting) {
          if (el.dataset.rendered === 'true' && el.offsetHeight > 0) {
            el.style.height = `${el.offsetHeight}px`; // Fix height
            el.dataset.html = el.innerHTML; // Save DOM as string
            el.innerHTML = ''; // Clear DOM to save memory
            el.dataset.rendered = 'false';
          }
        } else {
          if (el.dataset.rendered === 'false') {
            el.innerHTML = el.dataset.html;
            el.dataset.html = '';
            el.style.height = 'auto'; 
            el.dataset.rendered = 'true';
            
            // Allow lazy loaded images to re-trigger
            el.querySelectorAll('img[data-src]').forEach(img => {
              img.src = img.dataset.src;
            });
          }
        }
      });
    }, { rootMargin: '1500px' }); // Keep DOM within 1.5 viewport height
  }

  async loadNext() {
    this.isLoading = true;
    
    let skeletons = [];
    if (this.renderSkeleton) {
      this.sentinel.innerHTML = '';
      for (let i=0; i<3; i++) {
        const sk = document.createElement('div');
        sk.className = 'w-full';
        sk.innerHTML = this.renderSkeleton();
        this.container.appendChild(sk);
        skeletons.push(sk);
      }
    } else {
      this.sentinel.innerHTML = `<div class="w-8 h-8 rounded-full border-4 border-outline-variant/30 border-t-primary animate-spin"></div>`;
    }

    try {
      const response = await this.fetchData(this.cursor);
      
      // Cleanup Skeletons
      skeletons.forEach(sk => sk.remove());
      this.sentinel.innerHTML = '';

      const newItems = response.data.items || [];
      this.cursor = response.data.nextCursor;
      this.hasMore = !!this.cursor;

      newItems.forEach(item => {
        const domItem = document.createElement('div');
        domItem.className = 'virtual-item-container transition-opacity duration-300';
        domItem.dataset.id = item.id;
        domItem.dataset.rendered = 'true';
        
        domItem.innerHTML = this.renderItem(item);
        
        this.container.appendChild(domItem);
        this.items.push(item);
        
        this.virtualObserver.observe(domItem);
      });

      if (!this.hasMore && this.items.length > 0) {
        this.sentinel.innerHTML = `<div class="py-8 flex flex-col items-center opacity-70">
          <span class="material-symbols-outlined text-3xl text-secondary mb-2">check_circle</span>
          <span class="text-secondary font-bold text-sm">${this.endMessage}</span>
        </div>`;
      } else if (!this.hasMore && this.items.length === 0) {
        this.sentinel.innerHTML = `<div class="py-12 flex flex-col items-center">
          <span class="material-symbols-outlined text-4xl text-secondary mb-2">search_off</span>
          <span class="text-secondary font-bold text-sm">${this.emptyMessage}</span>
        </div>`;
      }

    } catch (e) {
      console.error(e);
      skeletons.forEach(sk => sk.remove());
      this.sentinel.innerHTML = `
        <div class="flex flex-col items-center py-4">
          <span class="text-secondary text-sm mb-2">Failed to load content</span>
          <button class="text-primary font-bold py-1.5 px-4 rounded-full border border-primary hover:bg-primary/10 active:scale-95 transition-all">Retry</button>
        </div>`;
      this.sentinel.querySelector('button').onclick = () => this.loadNext();
    } finally {
      this.isLoading = false;
    }
  }
  
  reset() {
    this.container.innerHTML = '';
    this.items = [];
    this.cursor = null;
    this.hasMore = true;
    this.sentinel.innerHTML = '';
    this.virtualObserver.disconnect();
    this.loadNext();
  }
  
  destroy() {
    this.observer.disconnect();
    this.virtualObserver.disconnect();
    this.sentinel.remove();
  }
}
