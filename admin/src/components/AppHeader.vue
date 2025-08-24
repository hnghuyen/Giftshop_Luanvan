<template>
  <nav class="navbar navbar-expand-lg navbar-light" style="background-color: #F7e3e3;">
    <div class="container-fluid px-3">
      <a @click="goToHome" class="navbar-brand d-flex align-items-center" style="cursor: pointer;">
        <img src="../assets/Logo.png" alt="Logo" width="40" height="40" class="me-2">
        <span style="color: #e04338; font-weight: bold">GIFTY HOUSE</span>
      </a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto">
          <li class="nav-item" v-if="!isAuthenticated">
            <router-link to="/register" class="nav-link">Đăng ký</router-link>
          </li>
          <li class="nav-item" v-if="!isAuthenticated">
            <router-link to="/login" class="nav-link">Đăng nhập</router-link>
          </li>
          <li class="nav-item d-flex align-items-center me-3 text-danger fw-bold" v-if="isAuthenticated">
            👤{{ adminName }}
          </li>
          <li class="nav-item" v-if="isAuthenticated">
            <button class="btn btn-danger" @click="handleLogout">Đăng xuất</button>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  data() {
    return {
      isAuthenticated: !!localStorage.getItem("adminToken"),
      adminName: localStorage.getItem("adminName") || "",
    };
  },
  methods: {
    goToHome() {
      if (this.isAuthenticated) {
        this.$router.push("/home");
      } else {
        this.$router.push("/");
      }
    },
    handleLogout() {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminName");
      this.isAuthenticated = false;
      this.adminName = "";
      this.$router.push("/");
    }
  },
  watch: {
    $route() {
      this.isAuthenticated = !!localStorage.getItem("adminToken");
      this.adminName = localStorage.getItem("adminName") || "";
    }
  }
};

</script>
