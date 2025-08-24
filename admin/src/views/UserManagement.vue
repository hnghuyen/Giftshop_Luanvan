<template>
  <AdminLayout>
    <div class="mg-container py-4">
      <div class="container-xl">

        <!-- Header -->
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h2 class="fw-bold mb-0" style="color: #E04338;">QUẢN LÝ NGƯỜI DÙNG</h2>
          <div class="d-flex gap-2">
            <input
              v-model="searchUser"
              type="text"
              class="form-control form-control-sm"
              placeholder="Tìm theo tên người dùng..."
            />
            <select v-model="sortOption" class="form-select form-select-sm">
              <option value="createdDesc">Mới nhất</option>
              <option value="createdAsc">Cũ nhất</option>
              <option value="nameAZ">Tên A-Z</option>
              <option value="nameZA">Tên Z-A</option>
            </select>
          </div>
        </div>

        <!-- Table container -->
        <div class="table-responsive">
          <table class="table table-hover align-middle shadow-sm rounded bg-white">
            <thead class="table-light text-center">
              <tr>
                <th style="width: 5%">STT</th>
                <th style="width: 15%">Họ tên</th>
                <th style="width: 15%">Email</th>
                <th style="width: 13%">Ngày tạo</th>
                <th style="width: 6%">Giới tính</th>
                <th style="width: 11%">SĐT</th>
                <th style="width: 20%">Địa chỉ</th>
                <th style="width: 15%">Hành động</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(user, index) in filteredUsers"
                :key="user._id"
                :class="{ 'table-muted': user.isBanned }"
                class="align-middle"
              >
                <td class="text-center">{{ index + 1 }}</td>
                <td>{{ user.name }}</td>
                <td>{{ user.email }}</td>
                <td>{{ formatDate(user.createdAt) }}</td>
                <td class="text-center">{{ user.gender || '—' }}</td>
                <td>{{ user.phone || '—' }}</td>
                <td>{{ user.address || '—' }}</td>
                <td class="text-center">
                  <button
                    class="btn btn-sm"
                    :class="user.isBanned ? 'btn-success' : 'btn-danger'"
                    @click="toggleBan(user)"
                  >
                    {{ user.isBanned ? 'Mở khóa' : 'Khóa tài khoản' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  </AdminLayout>
</template>

<style scoped>
.mg-container {
  background-color: #f8f9fa;
  min-height: 100vh;
}

.table-responsive {
  background: #fff;
  border-radius: 0.5rem;
  padding: 0.5rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}

.table-hover tbody tr:hover {
  background-color: #ffe8e0;
}

.table-muted {
  opacity: 0.6;
  text-decoration: line-through;
}
</style>


  
<script setup>
  import { ref, onMounted } from 'vue'
  import axios from 'axios'
  import AdminLayout from '../components/AdminLayout.vue'
  import {computed } from 'vue'

const users = ref([])
const searchUser = ref("")
const sortOption = ref("createdDesc") // mặc định: mới nhất

const filteredUsers = computed(() => {
  let result = [...users.value]

  // Tìm kiếm theo tên
  if (searchUser.value) {
    result = result.filter(u =>
      u.name?.toLowerCase().includes(searchUser.value.toLowerCase())
    )
  }

  // Sắp xếp
  if (sortOption.value === "createdAsc") {
    result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  } else if (sortOption.value === "createdDesc") {
    result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  } else if (sortOption.value === "nameAZ") {
    result.sort((a, b) => a.name.localeCompare(b.name))
  } else if (sortOption.value === "nameZA") {
    result.sort((a, b) => b.name.localeCompare(a.name))
  }

  return result
})
  
const formatDate = (dateStr) => {
  const d = new Date(dateStr)
  return d.toLocaleDateString("vi-VN")
}
  
  const fetchUsers = async () => {
  try {
    const token = localStorage.getItem('adminToken')
    const res = await axios.get('http://localhost:5000/api/admin/users/all', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    console.log('Dữ liệu users nhận được:', res.data)
    users.value = res.data
  } catch (err) {
    console.error('Lỗi khi lấy danh sách user:', err)
  }
}

  
  const deleteUser = async (id) => {
  if (confirm('Bạn có chắc muốn xóa người dùng này?')) {
    try {
      const token = localStorage.getItem('adminToken')
      await axios.delete(`http://localhost:5000/api/admin/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      users.value = users.value.filter(u => u._id !== id)
    } catch (err) {
      console.error('Xóa thất bại:', err)
    }
  }
}
const toggleBan = async (user) => {
  const action = user.isBanned ? 'mở khóa' : 'khóa'
  if (confirm(`Bạn có chắc muốn ${action} tài khoản của ${user.name}?`)) {
    try {
      const token = localStorage.getItem('adminToken')
      const res = await axios.put(
        `http://localhost:5000/api/admin/users/${user._id}/toggle-ban`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      user.isBanned = !user.isBanned
      alert(res.data.message)
    } catch (err) {
      console.error('Lỗi khi khóa/mở khóa tài khoản:', err)
      alert('Thao tác thất bại!')
    }
  }
}


  onMounted(fetchUsers)
</script>

<style scoped>
/* .mg-container {
  background: url('@/assets/bg2.jpg') no-repeat center center/cover;
  height: 100vh;
  width: 100vw; 
  overflow: hidden;
} */

.row-muted td {
  color: #b2b0b0 !important;
}
</style>

  