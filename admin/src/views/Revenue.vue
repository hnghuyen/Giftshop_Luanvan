<template>
  <AdminLayout>
    <div class="container">
      <h2 class="text-center fw-bold mb-4" style="color: #E04338;">BÁO CÁO DOANH THU</h2>

      <!-- Bộ lọc thời gian -->
      <div class="row mb-4">
        <div class="col-md-3">
          <label>Ngày bắt đầu:</label>
          <input type="date" class="form-control" v-model="startDate" />
        </div>
        <div class="col-md-3">
          <label>Ngày kết thúc:</label>
          <input type="date" class="form-control" v-model="endDate" />
        </div>
        <div class="col-md-3 d-flex align-items-end">
          <button class="btn btn-primary" @click="fetchReport">Xem thống kê</button>
        </div>
      </div>

      <!-- Thống kê tổng quan -->
      <div class="summary-stats mb-4">
        <div v-for="item in summaryStats" :key="item.label" class="d-flex justify-content-between p-2 border-bottom">
          <span class="fw-bold text-muted">{{ item.label }}:</span>
          <span class="fw-bold">{{ item.value }}</span>
        </div>
      </div>

      <!-- Top khách hàng
      <h4 class="mt-3 mb-3" style="color: #E04338;">Top khách hàng chi tiêu nhiều nhất</h4>
      <table class="table table-bordered table-hover">
        <thead class="table-light">
          <tr>
            <th>Họ tên</th>
            <th>Email</th>
            <th>Tổng chi tiêu</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="customer in report.topCustomers || []" :key="customer._id">
            <td>{{ customer.user.name }}</td>
            <td>{{ customer.user.email }}</td>
            <td>{{ formatPrice(customer.totalSpent) }}</td>
          </tr>
        </tbody>
      </table> -->

      <!-- Top sản phẩm -->
      <h4 class="mt-5 mb-3" style="color: #E04338;">SỐ LƯỢT BÁN</h4>

        <table class="table table-bordered table-hover align-middle">
          <thead class="table-light">
            <tr>
              <th>STT</th>
              <th>Sản phẩm</th>
              <th>Số lượng đã bán</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(product, index) in report.bestSellingProducts || []" :key="product._id">
              <td>{{ index + 1 }}</td>
              <td class="d-flex align-items-center">
                <img 
                  :src="product.product.images?.[0] ? `http://localhost:5000${product.product.images[0]}` : '/placeholder.png'"
                  alt="product image"
                  class="rounded me-2"
                  style="width: 50px; height: 50px; object-fit: cover;"
                />
                <span>{{ product.product.name }}</span>
              </td>
              <td class="fw-bold text-center">{{ product.totalSold }}</td>
            </tr>
          </tbody>
        </table>

    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import AdminLayout from '../components/AdminLayout.vue'

const report = ref({})
const summaryStats = ref([])

const startDate = ref('')
const endDate = ref('')

const formatPrice = (val) =>
  new Intl.NumberFormat('vi-VN').format(val || 0) + '₫'

const fetchReport = async () => {
  try {
    const token = localStorage.getItem('adminToken')
    const res = await axios.get('http://localhost:5000/api/admin/stats/report', {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        startDate: startDate.value || undefined,
        endDate: endDate.value || undefined
      }
    })

    report.value = res.data

    summaryStats.value = [
      { label: 'Tổng doanh thu', value: formatPrice(res.data.totalRevenue) },
      { label: 'Đơn hoàn thành', value: res.data.completedOrders },
      { label: 'Sản phẩm đã bán', value: res.data.totalProductsSold },
      { label: 'Đơn bị hủy', value: res.data.canceledOrders }
    ]
  } catch (err) {
    alert('Không thể tải báo cáo doanh thu.')
    console.error('Lỗi khi gọi API doanh thu:', err)
  }
}

onMounted(fetchReport)
</script>

<style scoped>
.summary-stats {
  max-width: 500px;
  margin: 0 auto; /* canh giữa */
  background-color: #fff5f5;
  border-radius: 8px;
  box-shadow: 0px 2px 6px rgba(0,0,0,0.1);
}
.summary-stats div {
  padding: 10px 15px;
}
</style>