<template>
  <div class="settings">
    <h1>Settings</h1>
    <div class="settings-content">
      <div class="setting-item">
        <label>Theme</label>
        <select v-model="currentTheme" @change="updateTheme">
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>
      <div class="setting-item">
        <label>Max Clipboard History</label>
        <input type="number" v-model="settings.maxHistory" min="1" max="100">
      </div>
      <button @click="saveSettings" class="save-button">Save Settings</button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import useThemeStore from '../stores/theme'

export default {
  name: 'Settings',
  setup() {
    const router = useRouter()
    const themeStore = useThemeStore()
    const currentTheme = ref(themeStore.theme.value)
    
    const updateTheme = () => {
      themeStore.setTheme(currentTheme.value)
    }

    return {
      currentTheme,
      updateTheme,
      router
    }
  },
  data() {
    return {
      settings: {
        maxHistory: 50
      }
    }
  },
  methods: {
    saveSettings() {
      localStorage.setItem('maxHistory', this.settings.maxHistory)
      // Navigate back to home after saving
      this.router.push('/')
    }
  },
  mounted() {
    this.settings.maxHistory = parseInt(localStorage.getItem('maxHistory')) || 50
  }
}
</script>

<style scoped>
.settings {
  padding: 2rem;
  color: var(--text-color);
}

.settings-content {
  max-width: 600px;
  margin: 0 auto;
  background-color: var(--bg-secondary);
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.setting-item {
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

label {
  font-weight: bold;
  margin-right: 1rem;
}

select, input {
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  width: 200px;
  background-color: var(--bg-input);
  color: var(--text-color);
}

.save-button {
  background-color: #42b883;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  width: 100%;
  transition: background-color 0.3s;
}

.save-button:hover {
  background-color: #3aa876;
}
</style>
