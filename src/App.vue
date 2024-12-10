<template>
  <div class="flex flex-col min-w-[450px] min-h-[600px] transition-colors duration-200"
       :class="isDarkMode ? 'bg-gray-900' : 'bg-gray-50'">
    <!-- Fixed Header -->
    <header class="sticky top-0 z-10 px-6 py-4 shadow-md"
            :class="isDarkMode ? 'bg-gray-800' : 'bg-blue-600'">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold text-white">
          MultiClip Pro
        </h1>
        
        <!-- Settings Button -->
        <router-link to="/settings" 
                    class="p-2 rounded-full transition-colors text-white hover:bg-white/10">
          <span class="material-icons text-xl">settings</span>
        </router-link>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-grow p-6 overflow-y-auto">
      <router-view v-if="$route.path === '/settings'" />
      
      <!-- Clips List (show only on home page) -->
      <div v-else class="space-y-3">
        <div v-for="(clip, index) in clips" 
             :key="clip.timestamp" 
             class="group p-4 rounded-lg transition-all relative"
             :class="isDarkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'">
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
          <p class="text-xs mt-2" :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'">
            {{ formatTimestamp(clip.timestamp) }}
          </p>
        </div>
      </div>
    </main>

    <!-- Fixed Footer -->
    <footer class="px-6 py-3 text-center text-sm shadow-md"
            :class="isDarkMode ? 'bg-gray-800 text-white' : 'bg-blue-600 text-white'">
      Created by Owen Maina
    </footer>
  </div>
</template>

<script>
import { onMounted } from 'vue'
import useThemeStore from './stores/theme'

export default {
  name: 'App',
  data() {
    return {
      clips: [],
      isDarkMode: false
    }
  },
  methods: {
    async loadClips() {
      const { clips = [] } = await chrome.storage.local.get('clips');
      this.clips = clips;
    },
    async copyToClipboard(text) {
      try {
        await navigator.clipboard.writeText(text);
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    },
    async deleteClip(timestamp) {
      this.clips = this.clips.filter(clip => clip.timestamp !== timestamp);
      await chrome.storage.local.set({ clips: this.clips });
    },
    formatTimestamp(timestamp) {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInHours = (now - date) / (1000 * 60 * 60);
      
      if (diffInHours < 24) {
        return date.toLocaleTimeString();
      } else {
        return date.toLocaleDateString();
      }
    }
  },
  setup() {
    const themeStore = useThemeStore();
    
    onMounted(() => {
      // Initialize theme from localStorage
      const savedTheme = localStorage.getItem('theme') || 'light';
      themeStore.setTheme(savedTheme);
    });

    return {
      themeStore
    }
  },
  async mounted() {
    // Load dark mode preference and clips
    const { isDarkMode = false } = await chrome.storage.local.get('isDarkMode');
    this.isDarkMode = isDarkMode;
    await this.loadClips();

    // Listen for storage changes
    chrome.storage.onChanged.addListener((changes) => {
      if (changes.clips) {
        this.clips = changes.clips.newValue || [];
      }
      if (changes.isDarkMode) {
        this.isDarkMode = changes.isDarkMode.newValue;
      }
    });
  }
}
</script>

<style>
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

.bg-gray-750 {
  background-color: #2d374d;
}

/* Custom scrollbar for the main content */
main::-webkit-scrollbar {
  width: 8px;
}

main::-webkit-scrollbar-track {
  background: transparent;
}

main::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 4px;
}

main::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.7);
}
</style>
