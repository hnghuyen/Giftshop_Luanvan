<template>
  <div class="register-container">
    <div class="register-box">
      <h2 class="text-center fw-bold pb-3" style="color: #E04338">ĐĂNG KÝ ADMIN</h2>
      <form @submit.prevent="handleRegister">
        <div class="mb-3">
          <label for="name" class="form-label fw-bold">Tên đầy đủ</label>
          <input 
            type="text" 
            class="form-control" 
            id="name" 
            v-model="name"
            required 
          >
        </div>
        <div class="mb-3">
          <label for="email" class="form-label fw-bold">Email</label>
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
        <div class="mb-3">
          <label for="password" class="form-label fw-bold">Mật khẩu</label>
          <input 
            type="password" 
            class="form-control" 
            id="password" 
            v-model="password" 
            @blur="validatePassword"
            required 
          >
          <p v-if="passwordError" class="text-danger">{{ passwordError }}</p>
        </div>

        <div class="text-center">
          <button type="submit" class="btn w-50" style="background-color: #E04338; color: white;">Đăng ký</button>
        </div>

        <p v-if="errorMessage" class="text-danger text-center mt-2">
          {{ errorMessage }}
        </p>
      </form>

      <p class="mt-3 text-center">
        Đã có tài khoản? <router-link to="/login">Đăng nhập</router-link>
      </p>
    </div>
  </div>
</template>

<script>
import { register } from "../services/authService";

export default {
  data() {
    return {
      name: "",
      email: "",
      password: "",
      emailError: "",
      passwordError: "",
      errorMessage: "",
    };
  },
  methods: {
    validateEmail() {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(this.email)) {
        this.emailError = "Email không hợp lệ!";
      } else {
        this.emailError = "";
      }
    },
    validatePassword() {
      if (this.password.length < 6) {
        this.passwordError = "Mật khẩu phải có ít nhất 6 ký tự!";
      } else {
        this.passwordError = "";
      }
    },
    async handleRegister() {
      this.validateEmail();
      this.validatePassword();

      if (this.emailError || this.passwordError) {
        return;
      }
      
      try {
        await register({
          name: this.name,
          email: this.email,
          password: this.password,
        });
        alert("Đăng ký thành công! Vui lòng đăng nhập.");
        this.$router.push("/login");
      } catch (error) {
        this.errorMessage = error.response?.data?.message || "Đăng ký thất bại!";
      }
    }
  }
};
</script>


<style scoped>
/* Thiết lập nền trang */
.register-container {
  background: url('@/assets/bg1.webp') no-repeat center center/cover;
  height: 90vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Hộp đăng nhập */
.register-box {
  background: #F7e3e3;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
  width: 600px;
  border: 2px solid #ccc;
}
</style>
