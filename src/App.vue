<template>
  <div class="container p-4 min-w-[450px] min-h-[600px] transition-colors duration-200"
       :class="isDarkMode ? 'bg-gray-900' : 'bg-gray-50'">
    <!-- Header -->
    <header class="flex justify-between items-center mb-6 pb-4" 
            :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
      <div>
        <h1 class="text-2xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-800'">
          MultiClip Pro
        </h1>
        <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
          Your Enhanced Clipboard Manager
        </p>
      </div>
      
      <!-- Theme Toggle -->
      <button @click="toggleTheme" 
              class="p-2 rounded-full transition-colors"
              :class="isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-200'">
        <span class="material-icons text-xl" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
          {{ isDarkMode ? 'light_mode' : 'dark_mode' }}
        </span>
      </button>
    </header>

    <!-- Clips List -->
    <div class="space-y-2">
      <div v-for="(clip, index) in clips" 
           :key="clip.timestamp" 
           class="group p-4 rounded-lg transition-all relative"
           :class="isDarkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'">
        <!-- Divider line except for last item -->
        <div v-if="index < clips.length - 1" 
             class="absolute bottom-0 left-4 right-4 h-px"
             :class="isDarkMode ? 'bg-gray-700' : 'bg-gray-200'">
        </div>
        
        <!-- Clip Content -->
        <div class="flex justify-between items-start gap-4">
          <p class="line-clamp-2 flex-grow text-sm"
             :class="isDarkMode ? 'text-gray-300' : 'text-gray-800'">
            {{ clip.text }}
          </p>
          
          <!-- Action Buttons -->
          <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button @click="copyToClipboard(clip.text)" 
                    class="p-1.5 rounded transition-colors"
                    :class="isDarkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-blue-400' : 'hover:bg-gray-100 text-gray-500 hover:text-blue-600'">
              <span class="material-icons text-lg">content_copy</span>
            </button>
            <button @click="deleteClip(clip.timestamp)"
                    class="p-1.5 rounded transition-colors"
                    :class="isDarkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-red-400' : 'hover:bg-gray-100 text-gray-500 hover:text-red-600'">
              <span class="material-icons text-lg">delete</span>
            </button>
          </div>
        </div>
        
        <!-- Timestamp -->
        <span class="text-xs mt-2 block"
              :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'">
          {{ formatTimestamp(clip.timestamp) }}
        </span>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="clips.length === 0" 
         class="text-center py-10"
         :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">
      <span class="material-icons text-4xl mb-2">content_paste</span>
      <p>No clips yet. Copy some text to get started!</p>
    </div>

    <!-- Success Notification -->
    <div v-if="showNotification"
         class="fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg text-white bg-green-500 transition-all duration-200"
         :class="{ 'opacity-0': !showNotification }">
      Copied to clipboard!
    </div>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      clips: [],
      isDarkMode: false,
      showNotification: false
    }
  },
  methods: {
    async loadClips() {
      try {
        const { clips = [] } = await chrome.storage.local.get('clips');
        this.clips = clips;
      } catch (error) {
        console.error('Error loading clips:', error);
      }
    },
    async copyToClipboard(text) {
      try {
        await navigator.clipboard.writeText(text);
        this.showNotification = true;
        setTimeout(() => {
          this.showNotification = false;
        }, 2000);
      } catch (error) {
        console.error('Error copying to clipboard:', error);
      }
    },
    async deleteClip(timestamp) {
      try {
        const updatedClips = this.clips.filter(clip => clip.timestamp !== timestamp);
        await chrome.storage.local.set({ clips: updatedClips });
        this.clips = updatedClips;
      } catch (error) {
        console.error('Error deleting clip:', error);
      }
    },
    formatTimestamp(timestamp) {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInHours = (now - date) / (1000 * 60 * 60);

      if (diffInHours < 24) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else if (diffInHours < 48) {
        return 'Yesterday';
      } else {
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      }
    },
    toggleTheme() {
      this.isDarkMode = !this.isDarkMode;
      chrome.storage.local.set({ isDarkMode: this.isDarkMode });
    }
  },
  async mounted() {
    // Load dark mode preference
    const { isDarkMode = false } = await chrome.storage.local.get('isDarkMode');
    this.isDarkMode = isDarkMode;

    // Load clips
    this.loadClips();

    // Listen for storage changes
    chrome.storage.onChanged.addListener((changes) => {
      if (changes.clips) {
        this.clips = changes.clips.newValue || [];
      }
    });
  }
}
</script>

<style>
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Smooth transitions */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

/* Custom hover state for dark mode */
.bg-gray-750 {
  background-color: #2d374d;
}
</style>
