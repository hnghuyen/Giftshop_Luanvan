import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('userToken') || null, // ✅ đổi tên key
  }),

  actions: {
    login(userData, token) {
      this.user = userData
      this.token = token
      localStorage.setItem('user', JSON.stringify(userData))
      localStorage.setItem('userToken', token) // ✅ đổi tên key
    },
    logout() {
      this.user = null
      this.token = null
      localStorage.removeItem('user')
      localStorage.removeItem('userToken') // ✅ đổi tên key
    },
    getToken() {
      return this.token || localStorage.getItem('userToken') // ✅ đổi tên key
    }
  }
})
