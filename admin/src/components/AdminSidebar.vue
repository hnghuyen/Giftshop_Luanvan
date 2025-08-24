<template>
  <div class="d-flex" style="min-height: 100vh">
    <!-- Sidebar -->
    <div class="admin-sidebar p-3" style="width: 250px; background-color: #F7e3e3; color: #e04338">
      <h4 class="text-uppercase text-center mb-4">Quản trị</h4>
      <ul class="nav flex-column">
        <li class="nav-item" v-for="item in menuItems" :key="item.name">
          <router-link
              class="nav-link text-dark"
              :class="{ active: current === item.route }"
              :to="{ name: item.route }"
          >
            {{ item.label }}
          </router-link>
        </li>
      </ul>
    </div>

    <!-- Nội dung -->
    <div class="flex-grow-1 p-4">
      <router-view />
    </div>
  </div>
</template>


<script setup>
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const current = ref(route.name)

watch(route, (newRoute) => {
  current.value = newRoute.name
})

const menuItems = [
  { label: 'Trang chủ', route: 'home' },
  { label: 'Quản lý danh mục', route: 'category' },
  { label: 'Quản lý sản phẩm', route: 'product' },
  { label: 'Quản lý đơn hàng', route: 'order' },
  { label: 'Quản lý đánh giá', route: 'review' },
  { label: 'Quản lý người dùng', route: 'users' },
  { label: 'Quản lý kho hàng', route: 'inventory' },
  { label: 'Mã giảm giá', route: 'coupon' },
  { label: 'Thống kê doanh thu', route: 'revenue' }
]

const navigateTo = (routeName) => {
  router.push({ name: routeName })
}
</script>

<style scoped>
.admin-sidebar .nav-link {
  padding: 10px 15px;
  cursor: pointer;
  transition: 0.2s;
}

.admin-sidebar .nav-link:hover {
  background-color: #f9b5b5;
  border-radius: 5px;
}

.admin-sidebar .nav-link.active {
  background-color: #f48585;
  font-weight: bold;
  border-radius: 5px;
}

.admin-sidebar {
  position: fixed;      /* dính cố định */
  top: 0;
  left: 0;
  height: 100vh;        /* full màn hình */
  width: 250px;
  background-color: #F7e3e3;
  color: #e04338;
}

.admin-content {
  margin-left: 250px;
  padding: 20px;
}
</style>
