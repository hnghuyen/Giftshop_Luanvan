<template>
  <AdminLayout>
    <div class="py-4">
      <div class="container-xl">
        <h2 class="text-center fw-bold pb-3" style="color: #E04338">QUẢN LÝ ĐƠN HÀNG</h2>

        <!-- Filter row bên phải -->
        <div class="d-flex justify-content-end gap-2 mb-3 flex-wrap">
          <input
            type="text"
            v-model="searchTerm"
            @input="handleSearch"
            class="form-control filter-input"
            placeholder="Tìm kiếm khách hàng/mã đơn..."
          />
          <select v-model="selectedStatus" @change="handleSearch" class="form-select filter-input">
            <option value="">Tất cả trạng thái</option>
            <option value="Chờ xác nhận">Chờ xác nhận</option>
            <option value="Đã xác nhận">Đã xác nhận</option>
            <option value="Chờ lấy hàng">Chờ lấy hàng</option>
            <option value="Đã lấy hàng">Đã lấy hàng</option>
            <option value="Đã giao hàng">Đã giao hàng</option>
            <option value="Hoàn thành">Hoàn thành</option>
            <option value="Đã hủy">Đã hủy</option>
          </select>
        </div>

        <div class="table-responsive shadow-sm rounded">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light text-center">
              <tr>
                <th style="width:5%">STT</th>
                <th style="width:15%">Người đặt</th>
                <th style="width:20%">Email</th>
                <th style="width:15%">Ngày đặt</th>
                <th style="width:15%">Tổng tiền</th>
                <th style="width:10%">Trạng thái</th>
                <th style="width:20%">Hành động</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(order, index) in orders" :key="order._id">
                <td class="text-center">{{ index + 1 }}</td>
                <td>{{ order.user?.name }}</td>
                <td>{{ order.user?.email }}</td>
                <td>{{ new Date(order.createdAt).toLocaleString() }}</td>
                <td>{{ order.totalPrice.toLocaleString() }} đ</td>
                <td class="text-center">
                  <span :class="statusClass(order.status)" class="status-badge">{{ order.status }}</span>
                </td>
                <td class="d-flex flex-wrap gap-1 justify-content-center">
                  <router-link :to="`/admin/orders/${order._id}`" class="btn btn-info btn-sm">Chi tiết</router-link>
                  <button v-if="order.status==='Chờ xác nhận'" class="btn btn-success btn-sm" @click="confirmOrder(order._id)">Xác nhận</button>
                  <button v-if="order.status==='Chờ xác nhận'" class="btn btn-warning btn-sm" @click="cancelOrder(order._id)">Hủy</button>
                  <button v-if="order.status==='Đã xác nhận'" class="btn btn-info btn-sm" @click="markPendingPickup(order._id)">Chờ lấy hàng</button>
                  <button v-if="order.status==='Chờ lấy hàng'" class="btn btn-success btn-sm" @click="markPickedUp(order._id)">Đã lấy hàng</button>
                  <button v-if="order.status==='Đã lấy hàng'" class="btn btn-primary btn-sm" @click="markDelivered(order._id)">Giao hàng</button>
                  <button class="btn btn-outline-secondary btn-sm" @click="previewOrderPDF(order._id)">Hóa đơn</button>
                  <button class="btn btn-outline-secondary btn-sm" @click="previewOrderCOD(order._id)">COD</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <nav v-if="totalPages > 1" class="mt-3">
          <ul class="pagination justify-content-center">
            <li class="page-item" :class="{ disabled: page === 1 }">
              <button class="page-link" @click="page--; fetchOrders()">Trước</button>
            </li>
            <li v-for="p in totalPages" :key="p" class="page-item" :class="{ active: page===p }">
              <button class="page-link" @click="page=p; fetchOrders()">{{ p }}</button>
            </li>
            <li class="page-item" :class="{ disabled: page===totalPages }">
              <button class="page-link" @click="page++; fetchOrders()">Sau</button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </AdminLayout>
</template>

<style scoped>
.filter-input {
  min-width: 140px;
  max-width: 250px;
  height: 36px;
  font-size: 0.875rem;
}

.table-responsive {
  background: #fff;
  border-radius: 0.5rem;
}

.table-hover tbody tr:hover {
  background-color: #fff2eb;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.85rem;
  font-weight: 500;
}

.status-badge.Chờ\ xác\ nhận { background-color: #ffc107; color: #fff; }
.status-badge.Đã\ xác\ nhận { background-color: #17a2b8; color: #fff; }
.status-badge.Chờ\ lấy\ hàng { background-color: #007bff; color: #fff; }
.status-badge.Đã\ lấy\ hàng { background-color: #28a745; color: #fff; }
.status-badge.Đã\ giao\ hàng { background-color: #6c757d; color: #fff; }
.status-badge.Hoàn\ thành { background-color: #20c997; color: #fff; }
.status-badge.Đã\ hủy { background-color: #dc3545; color: #fff; }
</style>


<script setup>
import { onMounted, ref } from 'vue'
import axios from 'axios'
import AdminLayout from '../components/AdminLayout.vue'
  
  const orders = ref([])
  
const page = ref(1)
const totalPages = ref(1)
const limit = 10

const searchTerm = ref('')
const selectedStatus = ref('')

const handleSearch = () => {
  page.value = 1; // reset page về 1
  fetchOrders(page.value);
};


const fetchOrders = async (p = page.value) => {
  try {
    const token = localStorage.getItem('adminToken');
    const res = await axios.get(
      `http://localhost:5000/api/admin/orders/all?page=${p}&limit=${limit}&search=${searchTerm.value}&status=${selectedStatus.value}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    orders.value = res.data.orders;
    page.value = res.data.page;
    totalPages.value = res.data.totalPages;
  } catch (err) {
    console.error(err);
  }
};

  const confirmOrder = async (id) => {
    if (!confirm('Xác nhận đơn hàng này?')) return
    await handleAction(`confirm`, id)
  }
  
  const cancelOrder = async (id) => {
    if (!confirm('Hủy đơn hàng này?')) return
    await handleAction(`cancel`, id)
  }
  
  const markDelivered = async (id) => {
    if (!confirm('Đánh dấu đã giao hàng?')) return
    await handleAction(`deliver`, id)
  }

  const markPendingPickup = async (id) => {
  if (!confirm('Đánh dấu đơn hàng này là CHỜ LẤY HÀNG?')) return
  await handleAction(`ready`, id)
}

const markPickedUp = async (id) => {
  if (!confirm('Đánh dấu đơn hàng này là ĐÃ LẤY HÀNG?')) return
  await handleAction(`picked`, id)
}

  
  // const deleteOrder = async (id) => {
  //   if (!confirm('Bạn có chắc muốn xóa đơn hàng?')) return
  //   try {
  //     const token = localStorage.getItem('adminToken')
  //     await axios.delete(`http://localhost:5000/api/admin/orders/${id}`, {
  //       headers: { Authorization: `Bearer ${token}` }
  //     })
  //     fetchOrders()
  //   } catch (err) {
  //     alert('Lỗi khi xóa đơn hàng')
  //     console.error(err)
  //   }
  // }
  
  const handleAction = async (action, id) => {
    try {
      const token = localStorage.getItem('adminToken')
      await axios.put(`http://localhost:5000/api/admin/orders/${id}/${action}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchOrders()
    } catch (err) {
      alert(`Thao tác thất bại: ${action}`)
      console.error(err)
    }
  }
  
  const statusClass = (status) => {
  switch (status) {
    case 'Chờ xác nhận':
      return 'text-warning'
    case 'Đã xác nhận':
      return 'text-primary'
    case 'Chờ lấy hàng':
      return 'text-info'
    case 'Đã lấy hàng':
      return 'text-secondary'
    case 'Đã giao hàng':
      return 'text-success'
    case 'Đã hủy':
      return 'text-danger'
    default:
      return ''
  }
}

    const previewOrderPDF = async (orderId) => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await axios.get(
        `http://localhost:5000/api/admin/orders/${orderId}/export-pdf`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      )

      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
      window.open(url, '_blank') // Mở tab mới để xem trước
    } catch (error) {
      console.error(error)
      alert('Không thể xem trước PDF đơn hàng.')
    }
  }

  const previewOrderCOD = async (orderId) => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.get(`http://localhost:5000/api/admin/orders/${orderId}/export-cod`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      // Tạo URL object từ blob
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      
      // Mở PDF trong tab mới
      window.open(url, '_blank');
    } catch (err) {
      console.error(err);
      alert('Xem trước phiếu COD thất bại!');
    }
  };

  const downloadOrderPDF = async (orderId) => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await axios.get(
        `http://localhost:5000/api/admin/orders/${orderId}/export-pdf`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob' // Quan trọng để nhận file PDF
        }
      )

      // Tạo link tải file
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `order_${orderId}.pdf`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error(error)
      alert('Không thể xuất PDF đơn hàng.')
    }
  }
  
  onMounted(fetchOrders)
  </script>
  
  <style scoped>
  .container {
    max-width: 1100px;
  }
  </style>
  