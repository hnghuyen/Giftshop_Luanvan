<template>
  <div>

    <div class="login-container">
      <div class="login-box">
        <h2 class="text-center fw-bold pb-3" style="color: #E04338;">ĐĂNG NHẬP</h2>
        <form @submit.prevent="handleLogin">
          <div class="mb-3 row align-items-center">
            <label for="email" class="col-sm-3 col-form-label fw-bold text-start">Email:</label>
            <div class="col-sm-9">
              <input
                type="email"
                class="form-control"
                id="email"
                v-model="email"
                @blur="validateEmail"
                required
              />
              <p v-if="emailError" class="text-danger mb-0">{{ emailError }}</p>
            </div>
          </div>

          <div class="mb-3 row align-items-center">
            <label for="password" class="col-sm-3 col-form-label fw-bold text-start">Mật khẩu:</label>
            <div class="col-sm-9">
              <div class="input-group">
                <input
                  :type="showPassword ? 'text' : 'password'"
                  class="form-control"
                  id="password"
                  v-model="password"
                  @blur="validatePassword"
                  required
                />
                <button
                  type="button"
                  class="btn btn-outline-secondary"
                  @click="togglePassword"
                >
                  {{ showPassword ? "Ẩn" : "Hiện" }}
                </button>
              </div>
              <p v-if="passwordError" class="text-danger mb-0">{{ passwordError }}</p>
            </div>
          </div>

          <!-- Nút đăng nhập -->
          <div class="text-center">
            <button
              type="submit"
              class="my-btn w-50"
              :disabled="loading"
            >
              <span
                v-if="loading"
                class="spinner-border spinner-border-sm"
              ></span>
              Đăng nhập
            </button>
          </div>

          <!-- Thông báo lỗi -->
          <p v-if="errorMessage" class="text-danger text-center mt-2">
            {{ errorMessage }}
          </p>
        </form>

      </div>
    </div>

  </div>
</template>

<script>
import axios from "axios";
import { useAuthStore } from "@/stores/auth";
import Navbar from "@/components/Navbar.vue";
import Footer from "@/components/Footer.vue";

export default {
  components: {
    Navbar,
    Footer,
  },
  data() {
    return {
      email: "",
      password: "",
      emailError: "",
      passwordError: "",
      errorMessage: "",
      loading: false,
      showPassword: false,
      auth: null, 
    };
  },
  created() {
    this.auth = useAuthStore(); 
  },
  methods: {
    validateEmail() {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      this.emailError = emailPattern.test(this.email)
        ? ""
        : "Email không hợp lệ!";
    },
    validatePassword() {
      this.passwordError =
        this.password.length < 6 ? "Mật khẩu phải có ít nhất 6 ký tự!" : "";
    },
    togglePassword() {
      this.showPassword = !this.showPassword;
    },
    async handleLogin() {
      this.validateEmail();
      this.validatePassword();

      if (this.emailError || this.passwordError) return;

      this.loading = true;
      this.errorMessage = "";

      try {
        const res = await axios.post("http://localhost:5000/api/users/login", {
          email: this.email,
          password: this.password,
        });

        if (res.data && res.data.token) {
          const user = res.data.user;
          const token = res.data.token;

          user._id = user.id;
          delete user.id;

          // ✅ lưu token + user vào store
          this.auth.login(user, token);

          this.$router.push("/home");
        }
      } catch (error) {
        this.errorMessage =
          error.response?.data?.message ||
          "Đăng nhập thất bại. Vui lòng thử lại!";
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>


<style scoped>
.login-container {
  background: url('../assets/bg/bg1.jpg') no-repeat center center/cover;
  height: 90vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-box {
  background: rgba(255, 255, 255, 0.9);
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
  width: 500px;
  border: 2px solid #ccc;
}
</style>
