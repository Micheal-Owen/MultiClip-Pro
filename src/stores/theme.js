import { ref } from 'vue'

const useThemeStore = () => {
  const theme = ref(localStorage.getItem('theme') || 'light')

  const setTheme = async (newTheme) => {
    theme.value = newTheme
    localStorage.setItem('theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
    
    // Sync with Chrome storage
    if (chrome && chrome.storage) {
      await chrome.storage.local.set({ isDarkMode: newTheme === 'dark' })
    }
  }

  // Initialize theme
  const initTheme = async () => {
    if (chrome && chrome.storage) {
      const { isDarkMode = false } = await chrome.storage.local.get('isDarkMode')
      setTheme(isDarkMode ? 'dark' : 'light')
    } else {
      setTheme(theme.value)
    }
  }

  initTheme()

  return {
    theme,
    setTheme
  }
}

export default useThemeStore
