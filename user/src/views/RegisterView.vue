 <template>
  <div class="min-h-screen flex flex-col">

    <div>
      <div class="flex-grow register-container d-flex align-items-center justify-content-center">
      <div class="register-box p-4 rounded shadow w-100" style="max-width: 620px; background-color: rgba(255, 255, 255, 0.9);">
        <h2 class="text-center fw-bold pb-3" style="color: #E04338;">ĐĂNG KÝ</h2>
        <form @submit.prevent="handleRegister">
          <div class="mb-3 row align-items-center">
            <label for="name" class="col-sm-3 col-form-label fw-bold text-start">Họ tên:</label>
            <div class="col-sm-9">
              <input
                type="text"
                class="form-control"
                id="name"
                v-model="name"
                required
              />
            </div>
          </div>

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
                  class="btn btn-outline-secondary"
                  type="button"
                  @click="showPassword = !showPassword"
                >
                  <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'">Hiện</i>
                </button>
              </div>
              <small class="text-muted">
                Mật khẩu phải có ít nhất 6 ký tự, 1 chữ cái.
              </small>
              <p v-if="passwordError" class="text-danger mb-0">{{ passwordError }}</p>
            </div>
          </div>

          <div class="mb-3 row align-items-center">
            <label for="confirmPassword" class="col-sm-3 col-form-label fw-bold text-start">Nhập lại:</label>
            <div class="col-sm-9">
              <div class="input-group">
                <input
                  :type="showConfirmPassword ? 'text' : 'password'"
                  class="form-control"
                  id="confirmPassword"
                  v-model="confirmPassword"
                  required
                />
                <button
                  class="btn btn-outline-secondary"
                  type="button"
                  @click="showConfirmPassword = !showConfirmPassword"
                >
                  <i :class="showConfirmPassword ? 'bi bi-eye-slash' : 'bi bi-eye'">Hiện</i>
                </button>
              </div>
              <p v-if="confirmPasswordError" class="text-danger mb-0">{{ confirmPasswordError }}</p>
            </div>
          </div>

          <div class="text-center">
            <button type="submit" class="my-btn w-50">Đăng ký</button>
          </div>

          <p v-if="errorMessage" class="text-danger text-center mt-2">
            {{ errorMessage }}
          </p>
        </form>

        <div class="mt-3 text-center">
          <p>Đã có tài khoản?</p>
          <router-link to="/login" class="my-btn w-50">Đăng nhập</router-link>
        </div>

      </div>
    </div>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import Footer from '@/components/Footer.vue';

const router = useRouter();

const name = ref('');
const email = ref('');
const password = ref('');

const emailError = ref('');
const passwordError = ref('');
const errorMessage = ref('');
const role = ref('user'); 
const showPassword = ref(false);

const confirmPassword = ref('');
const confirmPasswordError = ref('');
const showConfirmPassword = ref(false)

const validateEmail = () => {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  emailError.value = pattern.test(email.value) ? '' : 'Email không hợp lệ';
};

const validatePassword = () => {
  const isLongEnough = password.value.length >= 6;
  const hasLetter = /[a-zA-Z]/.test(password.value);
  // const hasNumber = /[0-9]/.test(password.value);
  // const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password.value);

  if (!isLongEnough) {
    passwordError.value = 'Mật khẩu phải ít nhất 6 ký tự';
  } else if (!hasLetter) {
    passwordError.value = 'Mật khẩu phải chứa ít nhất 1 chữ cái';
  } else {
    passwordError.value = '';
  }
};

const validateConfirmPassword = () => {
  confirmPasswordError.value =
    confirmPassword.value === password.value ? '' : 'Mật khẩu nhập lại không khớp';
};

const handleRegister = async () => {
  validateEmail();
  validatePassword();
  validateConfirmPassword();
  if (emailError.value || passwordError.value || confirmPasswordError.value) return;
  try {
    const res = await axios.post('http://localhost:5000/api/users/register', {
      name: name.value,
      email: email.value,
      password: password.value,
      role: role.value,
    });

    const user = res.data.user || {
      name: res.data.name,
      email: res.data.email,
      role: res.data.role,
      _id: res.data._id,
    };
    const token = res.data.token;

    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('userToken', token); 

    alert('Đăng ký thành công!');
    router.push('/');
  } catch (err) {
    console.error("❌ Đăng ký lỗi:", err.response?.data || err.message);
    errorMessage.value = err.response?.data?.message || 'Đăng ký thất bại!';
  }
};


</script>

<style scoped>
.register-container {
  background: url('../assets/bg/bg1.jpg') no-repeat center center/cover;
  height: 90vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
