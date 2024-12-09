// Custom functionality for MultiClip Pro

// Theme management
class ThemeManager {
  constructor() {
    this.themes = {
      light: {
        primary: '#3B82F6',
        background: '#F9FAFB',
        text: '#1F2937'
      },
      dark: {
        primary: '#60A5FA',
        background: '#1F2937',
        text: '#F9FAFB'
      }
    };
    this.currentTheme = 'light';
  }

  async initialize() {
    const { theme } = await chrome.storage.local.get('theme');
    if (theme) {
      this.applyTheme(theme);
    }
  }

  applyTheme(themeName) {
    const theme = this.themes[themeName];
    if (!theme) return;

    document.documentElement.style.setProperty('--primary-color', theme.primary);
    document.documentElement.style.setProperty('--bg-primary', theme.background);
    document.documentElement.style.setProperty('--text-primary', theme.text);

    this.currentTheme = themeName;
    chrome.storage.local.set({ theme: themeName });
  }

  toggleTheme() {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.applyTheme(newTheme);
  }
}

// Notification system
class NotificationManager {
  show(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification fixed top-4 right-4 px-4 py-2 rounded shadow-lg z-50 ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    } text-white`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 300);
    }, 2000);
  }
}

// Clipboard manager
class ClipboardManager {
  constructor() {
    this.notificationManager = new NotificationManager();
  }

  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      this.notificationManager.show('Copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy:', error);
      this.notificationManager.show('Failed to copy text', 'error');
    }
  }

  truncateText(text, maxLength = 100) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
      month: 'short',
      day: 'numeric'
    }).format(date);
  }
}

// Initialize managers
const themeManager = new ThemeManager();
const clipboardManager = new ClipboardManager();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  themeManager.initialize();

  const searchInput = document.getElementById('searchInput');
  const clipsContainer = document.getElementById('clipsContainer');
  const clipTemplate = document.getElementById('clipTemplate');
  const premiumNotice = document.getElementById('premiumNotice');
  const upgradeBtn = document.getElementById('upgradeBtn');

  let allClips = [];
  let isPremium = false;

  // Load clips and premium status
  async function loadClips() {
    const { clips = [], isPremium: premium = false } = await chrome.storage.local.get(['clips', 'isPremium']);
    allClips = clips;
    isPremium = premium;
    renderClips(clips);
  }

  // Render clips
  function renderClips(clips) {
    clipsContainer.innerHTML = '';
    
    // Sort clips: pinned first, then by timestamp
    clips.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.timestamp) - new Date(a.timestamp);
    });

    clips.forEach(clip => {
      const clipElement = clipTemplate.content.cloneNode(true);
      const clipItem = clipElement.querySelector('.clip-item');
      const textDiv = clipElement.querySelector('.text-gray-900');
      const timeDiv = clipElement.querySelector('.text-gray-500');
      const pinButton = clipElement.querySelector('.pin-button');

      // Set clip content
      textDiv.textContent = clip.text;
      timeDiv.textContent = new Date(clip.timestamp).toLocaleString();

      // Update pin button state
      if (clip.isPinned) {
        pinButton.classList.add('text-blue-600');
        pinButton.classList.remove('text-gray-400');
      }

      // Copy on click
      clipItem.addEventListener('click', (e) => {
        if (e.target !== pinButton && !pinButton.contains(e.target)) {
          navigator.clipboard.writeText(clip.text);
          showToast('Copied to clipboard!');
        }
      });

      // Pin functionality
      pinButton.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (!isPremium) {
          showPremiumNotice();
          return;
        }
        
        const updatedClips = allClips.map(c => {
          if (c.id === clip.id) {
            return { ...c, isPinned: !c.isPinned };
          }
          return c;
        });
        
        await chrome.storage.local.set({ clips: updatedClips });
        loadClips();
      });

      clipsContainer.appendChild(clipElement);
    });
  }

  // Search functionality
  searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredClips = allClips.filter(clip => 
      clip.text.toLowerCase().includes(searchTerm)
    );
    renderClips(filteredClips);
  });

  // Premium notice
  function showPremiumNotice() {
    premiumNotice.classList.remove('hidden');
    setTimeout(() => {
      premiumNotice.classList.add('hidden');
    }, 3000);
  }

  // Toast notification
  function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg text-sm';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 2000);
  }

  // Upgrade button
  upgradeBtn.addEventListener('click', () => {
    // Implement upgrade flow here
    chrome.storage.local.set({ isPremium: true }, () => {
      isPremium = true;
      showToast('Upgraded to Premium!');
    });
  });

  // Listen for storage changes
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.clips || changes.isPremium) {
      loadClips();
    }
  });

  // Initial load
  loadClips();
});

// Export managers for use in Vue components
window.multiClipManagers = {
  theme: themeManager,
  clipboard: clipboardManager
};