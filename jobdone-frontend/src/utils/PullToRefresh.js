export class PullToRefresh {
  constructor(container, onRefresh) {
    this.container = container;
    this.onRefresh = onRefresh;
    this.startY = 0;
    this.currentY = 0;
    this.isPulling = false;
    this.threshold = 80;
    
    // Create Indicator
    this.indicator = document.createElement('div');
    this.indicator.className = 'fixed top-16 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center bg-surface shadow-lg rounded-full w-10 h-10 transform -translate-y-20 transition-transform duration-300 pointer-events-none border border-outline-variant/10';
    this.indicator.innerHTML = `<span class="material-symbols-outlined text-primary transition-transform duration-200">refresh</span>`;
    document.body.appendChild(this.indicator);
    
    this.icon = this.indicator.querySelector('span');

    this.initEvents();
  }

  initEvents() {
    this.container.addEventListener('touchstart', (e) => {
      // Only pull if we are at the very top of the page
      if (window.scrollY === 0) {
        this.startY = e.touches[0].clientY;
        this.isPulling = true;
        this.indicator.style.transition = 'none';
      }
    }, { passive: true });

    this.container.addEventListener('touchmove', (e) => {
      if (!this.isPulling) return;
      
      this.currentY = e.touches[0].clientY;
      const pullDist = this.currentY - this.startY;
      
      if (pullDist > 0 && window.scrollY === 0) {
        // Prevent default only when pulling down
        if (e.cancelable) e.preventDefault();
        
        const translateY = Math.min(pullDist * 0.4, this.threshold) - 60; // Max pull limit
        this.indicator.style.transform = `translate(-50%, ${translateY}px)`;
        
        // Rotate icon
        const rotation = Math.min(pullDist * 2, 360);
        this.icon.style.transform = `rotate(${rotation}deg)`;
      }
    }, { passive: false });

    this.container.addEventListener('touchend', () => {
      if (!this.isPulling) return;
      this.isPulling = false;
      this.indicator.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
      
      const pullDist = this.currentY - this.startY;
      if (pullDist >= this.threshold && window.scrollY === 0) {
        // Refresh triggered
        this.indicator.style.transform = `translate(-50%, 20px)`;
        this.icon.classList.add('animate-spin');
        
        // Call refresh callback
        this.onRefresh().finally(() => {
          this.icon.classList.remove('animate-spin');
          this.indicator.style.transform = `translate(-50%, -100px)`; // Hide
        });
      } else {
        // Cancelled
        this.indicator.style.transform = `translate(-50%, -100px)`; // Hide
      }
      
      this.startY = 0;
      this.currentY = 0;
    }, { passive: true });
  }

  destroy() {
    this.indicator.remove();
  }
}
