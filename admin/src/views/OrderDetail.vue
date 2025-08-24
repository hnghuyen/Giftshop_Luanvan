<template>
  <AdminLayout>
    <div class="py-4">
      <div class="container-xl">
        <h2 class="text-center fw-bold pb-3" style="color: #E04338">CHI TIẾT ĐƠN HÀNG</h2>

        <div v-if="order">
          <div class="mb-3">
            <strong>Mã đơn hàng:</strong> {{ order._id }}
          </div>
          <div class="mb-3">
            <strong>Người đặt:</strong> {{ order.user?.name }} ({{ order.user?.email }})
          </div>
          <div class="mb-3">
            <strong>Địa chỉ nhận hàng:</strong> {{ order.shippingAddress }}
          </div>
          <div class="mb-3">
            <strong>Số điện thoại:</strong> {{ order.phoneNumber }}
          </div>
          <div class="mb-3">
            <strong>Trạng thái:</strong>
            <span :class="statusClass(order.status)">{{ order.status }}</span>
          </div>
          <div class="mb-3">
            <strong>Ngày đặt:</strong> {{ formatDate(order.createdAt) }}
          </div>
          <div class="mb-3" style="color: #E04338">
            <strong>TỔNG ĐƠN HÀNG CẦN THANH TOÁN: {{ formatCurrency(order.totalPrice) }} </strong>
          </div>

          <div class="mb-3" v-if="order.couponCode">
            <strong>Mã giảm giá:</strong> {{ order.couponCode }} <br />
            <strong>Số tiền đã giảm:</strong> -{{ formatCurrency(order.discountAmount) }}
          </div>

          <h5 class="mt-4">Danh sách sản phẩm:</h5>
          <table class="table table-bordered table-hover align-middle">
            <thead class="table-light">
              <tr class="text-center">
                <th style="width: 5%">STT</th>
                <th style="width: 40%">Tên sản phẩm</th>
                <th style="width: 10%">Số lượng</th>
                <th style="width: 15%">Giá</th>
                <th style="width: 15%">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in order.orderItems" :key="index">
                <td class="text-center">{{ index + 1 }}</td>
                <td>
                  {{ item?.product?.name || 'Không xác định' }}
                  <div v-if="item.customOptions && Object.keys(item.customOptions).length > 0" class="mt-1 ms-2">
                    <small><strong>Tùy chọn thiết kế:</strong></small>
                    <ul class="mb-0">
                      <li v-for="(value, key) in item.customOptions" :key="key">
                        {{ key }}: {{ findLabelForChoice(key, value, item.product?.options || []) }}
                      </li>
                    </ul>
                  </div>
                </td>
                <td class="text-center">{{ item.quantity }}</td>
                <td>{{ formatCurrency(item.price) }}</td>
                <td>{{ formatCurrency(item.price * item.quantity) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="text-center text-muted">Đang tải dữ liệu...</div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import AdminLayout from '../components/AdminLayout.vue'
  
  const route = useRoute()
  const order = ref(null)
  
  const fetchOrderDetail = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const res = await axios.get(`http://localhost:5000/api/admin/orders/${route.params.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      order.value = res.data
    } catch (err) {
      alert('Lỗi khi tải chi tiết đơn hàng')
      console.error('Chi tiết lỗi:', err.response?.data || err.message)
    }
  }
  
  const statusClass = (status) => {
    switch (status) {
      case 'Chờ xác nhận':
        return 'text-warning'
      case 'Đã xác nhận':
        return 'text-primary'
      case 'Đã giao hàng':
        return 'text-success'
      case 'Đã hủy':
        return 'text-danger'
      default:
        return ''
    }
  }
  
  const formatCurrency = (val) => {
    if (!val && val !== 0) return '0 đ'
    return Number(val).toLocaleString('vi-VN') + ' đ'
  }
  
  const formatDate = (date) => {
    return new Date(date).toLocaleString('vi-VN')
  }
  
const findLabelForChoice = (key, value, options = []) => {
  // Nếu value đã là object { label, value } thì trả label trực tiếp
  if (value && typeof value === 'object' && value.label) return value.label;

  // Nếu value là string, tìm trong options
  const opt = options.find(o => o.name === key);
  const choice = opt?.choices?.find(c => c.value === value);
  return choice?.label || value;
};

  onMounted(fetchOrderDetail)
  </script>
  
  <style scoped>
  .container {
    max-width: 800px;
  }
  .container-xl {
  max-width: 1100px;
}
  </style>
  