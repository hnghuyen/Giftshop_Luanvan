<template>
  <div class="layout-wrapper d-flex flex-column min-vh-100">
    <div class="container py-4 flex-grow-1">
      <h2 class="text-center fw-bold pb-3" style="color: #E04338;">ĐƠN HÀNG</h2>

      <div v-if="orders.length > 0">
        <div
          v-for="(order, index) in orders"
          :key="order._id"
          class="card order-card mb-2 shadow-sm"
          :class="index % 2 === 0 ? 'bg-light-orange' : 'bg-light-green'"
        >
          <div class="card-body p-2">
            <div class="d-flex justify-content-between align-items-start flex-wrap">
              <div class="order-info">
                <p class="mb-1"><strong>Mã đơn:</strong> {{ order._id }}</p>
                <p class="mb-1"><strong>Ngày đặt:</strong> {{ new Date(order.createdAt).toLocaleString() }}</p>
                <p class="mb-1">
                  <strong>Trạng thái:</strong>
                  <span :class="statusClass(order.status)">{{ order.status }}</span>
                </p>
                <p class="mb-1"><strong>Tổng tiền:</strong> {{ order.totalPrice.toLocaleString() }} đ</p>
              </div>

              <div class="order-actions d-flex gap-1 mt-2 mt-md-0">
                <router-link :to="`/orders/${order._id}`" class="btn btn-primary btn-sm">
                  Xem chi tiết
                </router-link>

                <button
                  v-if="order.status === 'Chờ xác nhận'"
                  class="btn btn-danger btn-sm"
                  @click="cancelOrder(order._id)"
                >
                  Hủy đơn
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else>
        <p>Bạn chưa có đơn hàng nào.</p>
      </div>
    </div>
  </div>
</template>
  
<script setup>
  import { ref, onMounted } from 'vue'
  import axios from 'axios'
  import { useAuthStore } from '@/stores/auth'
  import { useRouter } from 'vue-router'
  import Footer from '@/components/Footer.vue'
  
  const orders = ref([])
  const auth = useAuthStore()
  const router = useRouter()
  
  const fetchOrders = async () => {
    // console.log("🔐 Token gửi đi:", auth.token);
    try {
      const res = await axios.get('http://localhost:5000/api/users/orders', {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      })
      orders.value = res.data
    } catch (error) {
      console.error(error)
      alert('Không thể tải danh sách đơn hàng.')
    }
  }
  
  const cancelOrder = async (orderId) => {
    if (!confirm('Bạn có chắc muốn hủy đơn hàng này?')) return
  
    try {
      await axios.put(`http://localhost:5000/api/users/orders/${orderId}/cancel`, {}, {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      })
      alert('Đã hủy đơn hàng.')
      fetchOrders()
    } catch (error) {
      alert('Hủy đơn không thành công.')
    }
  }
  
  const statusClass = (status) => {
    switch (status) {
      case 'Chờ xác nhận':
        return 'text-warning'
      case 'Đã xác nhận':
      case 'Đang giao':
      case 'Chờ xử lý':
        return 'text-primary'
      case 'Hoàn thành':
        return 'text-success'
      case 'Đã hủy':
        return 'text-danger'
      default:
        return ''
    }
  }
  
  onMounted(() => {
    if (!auth.user) {
      router.push('/login')
    } else {
      fetchOrders()
    }
  })
</script>
  
<style scoped>
.order-card {
  border-radius: 8px;
  font-size: 1rem; 
}

.bg-light-orange {
  background-color: #fff1eb !important;
}

.bg-light-green {
  background-color: #e0f7f1 !important;
}

.order-info p {
  margin-bottom: 0.25rem; 
}

.order-actions .btn {
  font-size: 0.8rem;
  padding: 0.25rem 0.5rem;
}

@media (max-width: 576px) {
  .order-info, .order-actions {
    width: 100%;
  }
  .order-actions {
    justify-content: flex-start;
    margin-top: 0.5rem;
  }
}
</style>
  