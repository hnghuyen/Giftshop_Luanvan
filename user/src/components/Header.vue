<template>
  <div class="text-dark text-sm py-2 px-4 d-flex justify-content-between align-items-center" style="background-color: #D46A62;">
 
    <div class="d-flex gap-3">
      <router-link to="/support" class="text-decoration-none nav-link-hover">Hỗ trợ</router-link>
      <router-link to="/about" class="text-decoration-none nav-link-hover">Giới thiệu</router-link>
    </div>

    <div class="d-flex gap-3">
      <router-link v-if="!auth.user" to="/register" class="text-decoration-none nav-link-hover">Đăng ký</router-link>
      <router-link v-if="!auth.user" to="/login" class="text-decoration-none nav-link-hover">Đăng nhập</router-link>
      <span v-else>Chào, {{ userName }}</span>
      <button v-if="auth.user" @click="handleLogout" class="btn btn-sm btn-outline-light">Đăng xuất</button>
    </div>
  </div>
</template>


<script setup>
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";

const auth = useAuthStore();
const router = useRouter();

const handleLogout = () => {
  auth.logout();
  router.push("/");
};

const userName = auth.user?.name || auth.user?.email || "";
</script>
