<template>
  <div class="container my-4" style="max-width: 600px;">
    <div class="card shadow rounded">
      <div class="card-body chat-box" style="max-height: 400px; overflow-y: auto;">
        <div v-for="(msg, index) in messages" :key="index" class="mb-2">
          <div :class="msg.from === 'user' ? 'text-end' : 'text-start'">
            <span :class="msg.from === 'user' ? 'badge bg-info' : 'badge bg-secondary'">
              {{ msg.text }}
            </span>
          </div>
        </div>
      </div>
      <div class="card-footer">
        <form @submit.prevent="sendMessage" class="d-flex gap-2">
          <input
            type="text"
            class="form-control"
            v-model="userInput"
            placeholder="Bạn cần tim món quà gì vậy á?"
            @keydown.enter.exact.prevent="sendMessage"
          />
          <button class="btn btn-success" type="submit">Gửi</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import axiosInstance from '@/stores/axiosInstance';

export default {
  name: 'ChatBox',
  data() {
    return {
      userInput: '',
      messages: [],
    };
  },
  methods: {
    async sendMessage() {
      const input = this.userInput.trim();
      if (!input) return;

      this.messages.push({ from: 'user', text: input });

      try {
        const res = await axiosInstance.post('/chat', { message: input });
        this.messages.push({ from: 'bot', text: res.data.reply });
      } catch (err) {
        console.error('Chat lỗi:', err);
        this.messages.push({ from: 'bot', text: 'Tớ đang bị lỗi 😢' });
      }

      this.userInput = '';
    },
  },
};
</script>

<style scoped>
.chat-box {
  background-color: #f9f9f9;
  padding: 10px;
  border-radius: 8px;
}
</style>
