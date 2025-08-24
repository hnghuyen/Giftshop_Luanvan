<template>
  <div class="chat-wrapper">
    <button v-if="!isOpen" @click="isOpen = true" class="chat-toggle">
      Chat với Gifty
    </button>

    <div v-else class="chat-window shadow">
      <div class="chat-header bg-success text-white d-flex justify-content-between align-items-center p-2">
        <span><strong>Gifty ChatBot</strong></span>
        <button @click="isOpen = false" class="btn btn-sm btn-light">✕</button>
      </div>
      <ChatBox />
    </div>
  </div>
</template>

<script>
import ChatBox from './ChatBox.vue';

export default {
  name: 'FloatingChat',
  components: { ChatBox },
  data() {
    return {
      isOpen: false,
    };
  },
};
</script>

<style scoped>
.chat-wrapper {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
}

.chat-toggle {
  background-color: #d46a62;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 50px;
  font-weight: bold;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.chat-window {
  width: 650px;
  max-height: 500px;
  background: white;
  border-radius: 12px;
  overflow: hidden;
}
</style>
