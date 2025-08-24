<template>
  <div class="user-bg-wrapper py-5">
    <div class="container">
      <div class="card-box mx-auto p-4">
        <h2 class="text-center fw-bold pb-3" style="color: #E04338;">THÔNG TIN NGƯỜI DÙNG</h2>

        <div v-if="user && !isEditing && !isChangingPassword" class="container border rounded p-3 shadow-sm">
          <div class="row info-row">
            <div class="col-md-4 fw-bold">Họ tên:</div>
            <div class="col-md-8">{{ user.name }}</div>
          </div>

          <div class="row info-row">
            <div class="col-md-4 fw-bold">Email:</div>
            <div class="col-md-8">{{ user.email }}</div>
          </div>

          <div class="row info-row">
            <div class="col-md-4 fw-bold">Giới tính:</div>
            <div class="col-md-8">{{ user.gender || 'Chưa cập nhật' }}</div>
          </div>

          <div class="row info-row">
            <div class="col-md-4 fw-bold">Số điện thoại:</div>
            <div class="col-md-8">{{ user.phone || 'Chưa cập nhật' }}</div>
          </div>

          <div class="row info-row">
            <div class="col-md-4 fw-bold">Địa chỉ:</div>
            <div class="col-md-8">{{ user.address || 'Chưa cập nhật' }}</div>
          </div>

          <div class="mt-3">
            <button @click="startEditing" class="btn btn-outline-primary me-2">Cập nhật thông tin</button>
            <button @click="deleteAccount" class="btn btn-outline-danger ">Xóa tài khoản</button>
          </div>
          <!-- <button @click="startChangingPassword" class="btn btn-outline-warning">Đổi mật khẩu</button> -->
        </div>

        <div v-else-if="user && isEditing">
          <form @submit.prevent="updateInfo">
            <div class="mb-3">
              <label class="form-label">Họ tên</label>
              <input v-model="form.name" class="form-control" type="text" />
            </div>
            <div class="mb-3">
              <label class="form-label">Giới tính</label>
              <select v-model="form.gender" class="form-control">
                <option value="">-- Chọn --</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">Số điện thoại</label>
              <input v-model="form.phone" class="form-control" type="text" />
              <div v-if="phoneError" class="text-danger">{{ phoneError }}</div>
            </div>

            <div class="mb-3">
              <label class="form-label">Địa chỉ</label>
              <input v-model="form.address" class="form-control" type="text" />
            </div>
            <button type="submit" class="my-btn me-2">Lưu thay đổi</button>
            <button type="button" @click="cancelEdit" class="btn btn-secondary" >Hủy</button>
          </form>
        </div>

        <div v-else-if="isChangingPassword">
          <form @submit.prevent="changePassword">
            <div class="mb-3">
              <label class="form-label">Mật khẩu cũ</label>
              <input v-model="oldPassword" type="password" class="form-control" required>
            </div>
            <div class="mb-3">
              <label class="form-label">Mật khẩu mới</label>
              <input v-model="newPassword" type="password" class="form-control" required>
            </div>
            <button type="submit" class="btn btn-warning me-2">Xác nhận đổi</button>
            <button type="button" @click="cancelChangePassword" class="btn btn-secondary">Hủy</button>
          </form>
        </div>

        <div v-else>
          <p>Đang tải dữ liệu người dùng...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import axiosInstance from '@/stores/axiosInstance'

const user = ref(null)
const isEditing = ref(false)
const form = reactive({
  name: '',
  gender: '',
  phone: '',
  address: ''
})

const isChangingPassword = ref(false)
const oldPassword = ref("")
const newPassword = ref("")
const phoneError = ref("")

const startChangingPassword = () => {
  isChangingPassword.value = true
}

const cancelChangePassword = () => {
  isChangingPassword.value = false
  oldPassword.value = ""
  newPassword.value = ""
}

const changePassword = async () => {
  try {
    await axiosInstance.put("/users/change-password", {
      oldPassword: oldPassword.value,
      newPassword: newPassword.value
    });
    
    alert("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");

    // Xóa token và thông tin user
    localStorage.removeItem('userToken');
    localStorage.removeItem('userInfo');

    // Chuyển hướng sang login
    window.location.href = "/login";

  } catch (error) {
    alert(error.response?.data?.message || "Đổi mật khẩu thất bại");
  }
};


const fetchUserInfo = async () => {
  try {
    const res = await axiosInstance.get('/users/me')
    user.value = res.data
    Object.assign(form, res.data)
  } catch (error) {
    console.error('Lỗi khi lấy thông tin người dùng:', error)
  }
}


const startEditing = () => {
  isEditing.value = true
}

const cancelEdit = () => {
  isEditing.value = false
  Object.assign(form, user.value) // reset 
}

const updateInfo = async () => {
  // Regex: bắt đầu bằng 0 và 10 số hoặc +84 và 9 số
  const phoneRegex = /^(0\d{9}|\+84\d{9})$/;
  if (!phoneRegex.test(form.phone)) {
    phoneError.value = "Số điện thoại không hợp lệ. Vui lòng nhập đúng định dạng.";
    return;
  } else {
    phoneError.value = "";
  }

  try {
    await axiosInstance.put('/users/update', form);
    await fetchUserInfo();
    isEditing.value = false;
    alert('Cập nhật thành công!');
  } catch (error) {
    console.error('Lỗi cập nhật thông tin:', error);
    alert('Cập nhật thất bại!');
  }
};


const deleteAccount = async () => {
  const confirmDelete = confirm('Bạn có chắc chắn muốn xóa tài khoản không? Hành động này không thể hoàn tác!');
  if (!confirmDelete) return;

  try {
    await axiosInstance.delete('/users/delete-account');
    alert('Tài khoản của bạn đã bị xóa.');

    // Xóa token & chuyển hướng về trang chủ hoặc đăng nhập
    localStorage.removeItem('userToken');
    window.location.href = '/home';
  } catch (error) {
    console.error('Lỗi khi xóa tài khoản:', error);
    alert('Xóa tài khoản thất bại. Vui lòng thử lại.');
  }
}


onMounted(() => {
  fetchUserInfo()
})
</script>

<style scoped>
.user-bg-wrapper {
  min-height: 100vh;
  background: url('../assets/bg/bg1.jpg') no-repeat center center;
  background-size: cover;
  display: flex;
  /* align-items: center; */
  justify-content: center;
}

.card-box {
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  width: 100%;
}
.info-row {
  border-bottom: 1px solid #fff3f2; /* viền dưới */
  padding: 8px 0;
}
.info-row:nth-child(odd) {
  background-color: #ffedec; /* nền xám nhạt xen kẽ */
}

</style>

