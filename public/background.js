// Initialize context menu
chrome.runtime.onInstalled.addListener(() => {
  // Create context menu item
  chrome.contextMenus.create({
    id: 'saveToMultiClip',
    title: 'Copy to MultiClip Pro',
    contexts: ['selection']
  });

  // Initialize storage with default values
  chrome.storage.local.get(['clips', 'isPremium'], (result) => {
    if (!result.clips) {
      chrome.storage.local.set({ clips: [] });
    }
    if (result.isPremium === undefined) {
      chrome.storage.local.set({ isPremium: false });
    }
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'saveToMultiClip' && info.selectionText) {
    saveClip(info.selectionText, 'context-menu');
  }
});

// Save clip to storage and show notification
async function saveClip(text, source) {
  if (!text.trim()) return;

  const timestamp = new Date().toISOString();
  const clip = {
    id: Date.now().toString(),
    text,
    timestamp,
    source,
    isPinned: false
  };

  try {
    const { clips = [], isPremium = false } = await chrome.storage.local.get(['clips', 'isPremium']);
    
    // Check for duplicates
    const isDuplicate = clips.some(existingClip => existingClip.text === text);
    if (!isDuplicate) {
      // Add new clip at the beginning
      clips.unshift(clip);

      // Remove unpinned clips if over limit for free users
      if (!isPremium) {
        const maxClips = 20;
        const unpinnedClips = clips.filter(clip => !clip.isPinned);
        if (unpinnedClips.length > maxClips) {
          // Keep only pinned clips and the first maxClips unpinned clips
          const pinnedClips = clips.filter(clip => clip.isPinned);
          const recentUnpinnedClips = unpinnedClips.slice(0, maxClips);
          clips.length = 0; // Clear array
          clips.push(...pinnedClips, ...recentUnpinnedClips);
        }
      }
      
      await chrome.storage.local.set({ clips });
      showNotification('Text copied to MultiClip Pro');
    }
  } catch (error) {
    console.error('Error saving clip:', error);
    showNotification('Error saving to MultiClip Pro');
  }
}

// Show notification
function showNotification(message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: '/icon48.png',
    title: 'MultiClip Pro',
    message: message
  });
}

// Keep service worker active
chrome.runtime.onStartup.addListener(() => {
  console.log('Service worker started');
});

// Handle any errors
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Extension installed');
  } else if (details.reason === 'update') {
    console.log('Extension updated');
  }
});
