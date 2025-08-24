<template>
  <div class="d-flex">
    <!-- Sidebar bên trái -->
    <div style="width: 250px; flex-shrink: 0;">
      <AdminSidebar />
    </div>

    <!-- Nội dung chính bên phải -->
    <div class="flex-grow-1 p-4" style="background: url('/src/assets/bg.jpg') no-repeat center center/cover; min-height: 100vh;">
      <h2 class="text-center fw-bold text-dark">TRANG QUẢN TRỊ</h2>

      <div class="row mt-4">
        <div class="col-md-4" v-for="card in stats" :key="card.label">
          <div class="card text-center shadow" :class="card.bg">
            <div class="card-body text-white">
              <h5 class="card-title">{{ card.label }}</h5>
              <h3>{{ card.value }}</h3>
            </div>
          </div>
        </div>
      </div>

      <p class="text-danger text-center mt-5 bg-light p-3 rounded">
        Nếu có sự cố kỹ thuật, vui lòng liên hệ kỹ thuật viên: <strong>0123 456 789 hoặc 0967 444 555</strong>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import AdminSidebar from '../components/AdminSidebar.vue'

const stats = ref([])

const fetchStats = async () => {
  try {
    const token = localStorage.getItem('adminToken')

    if (!token) {
      alert('Bạn chưa đăng nhập với tư cách admin!')
      return
    }

    const res = await axios.get('http://localhost:5000/api/admin/stats/all', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    stats.value = [
      { label: 'Người dùng', value: res.data.userCount, bg: 'bg-primary' },
      { label: 'Sản phẩm', value: res.data.productCount, bg: 'bg-success' },
      { label: 'Đơn hàng tháng này', value: res.data.orderCount, bg: 'bg-warning' }
    ]
  } catch (err) {
    alert('Lỗi khi lấy thống kê!')
    console.error('Chi tiết lỗi:', err.response?.data || err.message)
  }
}

onMounted(fetchStats)
</script>

<style scoped>
.card {
  border-radius: 1rem;
}
</style>
