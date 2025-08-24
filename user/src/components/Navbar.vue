<template>
  <nav class="navbar navbar-expand-lg navbar-light shadow-sm px-4" style="background-color: #D46A62; font-family: 'Nunito', sans-serif;">
    <div class="container-fluid">
      <!-- Logo -->
      <router-link
        class="navbar-brand fw-bold text-white d-flex align-items-center"
        :to="{ name: 'Home' }"
      >
        <img src="@/assets/logo.png" alt="Gifty House" width="40" class="me-2" />
        GIFTY HOUSE
      </router-link>

      <!-- Toggle (mobile) -->
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarSupportedContent"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- Nội dung navbar -->
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav ms-auto mb-2 mb-lg-0 me-3">
          <li class="nav-item">
            <router-link class="nav-link nav-link-hover" to="/products">Sản phẩm</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link nav-link-hover" to="/my-design">Thiết kế</router-link>
          </li>
          <li class="nav-item" v-if="user">
            <router-link class="nav-link nav-link-hover" to="/profile">Tài khoản</router-link>
          </li>
          <li class="nav-item" v-if="user">
            <router-link class="nav-link nav-link-hover" to="/orders">Đơn hàng</router-link>
          </li>
        </ul>

        <!-- Tìm kiếm -->
        <form class="d-flex me-3" @submit.prevent="handleSearch">
          <input
            class="form-control me-2"
            type="search"
            placeholder="Tìm kiếm sản phẩm..."
            v-model="searchKeyword"
          />
          <button class="btn btn-outline-light bg-light" type="submit">🔍</button>
        </form>

        <router-link to="/cart" class="nav-link-hover position-relative me-2">
            <i class="bi bi-cart3 fs-5"></i> Giỏ hàng
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'  

const router = useRouter()
const searchKeyword = ref('')

const auth = useAuthStore()
const { user } = storeToRefs(auth) 

const handleSearch = () => {
  const keyword = searchKeyword.value.trim()
  if (!keyword) return
  router.push({ name: 'SearchResult', query: { keyword } })
}
</script>
