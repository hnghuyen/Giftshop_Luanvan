<template>
  <div class="admin-layout d-flex">
    <!-- Sidebar -->
    <div class="sidebar">
      <AdminSidebar />
    </div>

    <!-- Main content -->
    <div class="main-content flex-grow-1 p-3">
      <slot />
    </div>
  </div>
</template>

<script setup>
import AdminSidebar from './AdminSidebar.vue'
</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
}

.sidebar {
  width: 240px;
  background-color: #f8f9fa;
  border-right: 1px solid #ddd;
}

.main-content {
  width: calc(100% - 240px);
  background-color: #fff;
}
</style>
