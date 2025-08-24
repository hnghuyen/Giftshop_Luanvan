<template>
  <div class="login-container">
    <div class="login-box">
      <h2 class="text-center fw-bold pb-3" style="color: #E04338">ĐĂNG NHẬP ADMIN</h2>
      <form @submit.prevent="handleLogin">
        <div class="mb-3">
          <label for="email" class="form-label fw-bold">Email:</label>
          <input 
            type="email" 
            class="form-control" 
            id="email" 
            v-model="email" 
            @blur="validateEmail"
            required 
          >
          <p v-if="emailError" class="text-danger">{{ emailError }}</p>
        </div>
        <div class="mb-3 position-relative">
          <label for="password" class="form-label fw-bold">Mật khẩu:</label>
          <div class="input-group">
            <input 
              :type="showPassword ? 'text' : 'password'"
              class="form-control" 
              id="password" 
              v-model="password" 
              @blur="validatePassword"
              required 
            >
            <button type="button" class="btn btn-outline-secondary" @click="togglePassword">
              {{ showPassword ? 'Ẩn' : 'Hiện' }}
            </button>
          </div>
          <p v-if="passwordError" class="text-danger">{{ passwordError }}</p>
        </div>
        <div class="text-center">
          <button type="submit" class="btn w-100" :disabled="loading" style="background-color: #E04338; color: white;">
            <span v-if="loading" class="spinner-border spinner-border-sm"></span>
            Đăng nhập
          </button>
        </div>
        <p v-if="errorMessage" class="text-danger text-center mt-2">
          {{ errorMessage }}
        </p>
      </form>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      email: "",
      password: "",
      emailError: "",
      passwordError: "",
      errorMessage: "",
      loading: false,
      showPassword: false,
    };
  },
  methods: {
    validateEmail() {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      this.emailError = emailPattern.test(this.email) ? "" : "Email không hợp lệ!";
    },
    validatePassword() {
      this.passwordError = this.password.length < 6 ? "Mật khẩu phải có ít nhất 6 ký tự!" : "";
    },
    togglePassword() {
      this.showPassword = !this.showPassword;
    },
    async handleLogin() {
      if (this.emailError || this.passwordError) return;
      this.loading = true;
      this.errorMessage = "";

      try {
        const response = await axios.post("http://localhost:5000/api/admin/login", {
          email: this.email,
          password: this.password,
        });

        if (response.data && response.data.token) {
          localStorage.setItem("adminToken", response.data.token);
          localStorage.setItem("adminName", response.data.admin.name); 
          this.$router.push("/home");
        }
      } catch (error) {
        this.errorMessage = error.response?.data?.message || "Đăng nhập thất bại. Vui lòng thử lại!";
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.login-container {
  background: url('@/assets/bg1.webp') no-repeat center center/cover;
  height: 90vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-box {
  background: #F7e3e3;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
  width: 400px;
  border: 2px solid #ccc;
}

.btn-success {
  transition: 0.3s;
}
.btn-success:hover {
  background-color: #fc6c62;
  opacity: 0.9;
}
</style>
