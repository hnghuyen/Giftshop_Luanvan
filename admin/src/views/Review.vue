<template>
  <AdminLayout>
    <div class="container mt-4">

      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="fw-bold mb-0" style="color: #E04338;">Quản lý đánh giá</h2>
        <div class="d-flex gap-2 flex-wrap">
          <input 
            type="text" 
            class="form-control form-control-sm" 
            placeholder="Tìm kiếm theo từ khóa..." 
            v-model="searchQuery"
          />
          <select class="form-select form-select-sm" v-model="selectedRating">
            <option value="">Lọc theo số sao</option>
            <option v-for="star in [5,4,3,2,1]" :key="star" :value="star">{{ star }} sao</option>
          </select>
          <input type="date" class="form-control form-control-sm" v-model="startDate" />
          <input type="date" class="form-control form-control-sm" v-model="endDate" />
        </div>
      </div>

      <!-- Table container -->
      <div class="table-responsive shadow-sm rounded bg-white p-2">
        <table class="table table-hover align-middle">
          <thead class="table-light text-center">
            <tr>
              <th style="width: 15%">Người dùng</th>
              <th style="width: 15%">Sản phẩm</th>
              <th style="width: 10%">Số sao</th>
              <th style="width: 35%">Bình luận</th>
              <th style="width: 15%">Ngày</th>
              <th style="width: 10%">Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="review in filteredReviews" 
              :key="review._id"
            >
              <td>{{ review.userId?.name || '—' }}</td>
              <td>{{ review.productId?.name || '—' }}</td>
              <td class="text-center">{{ review.rating }}</td>
              <td>{{ review.comment || '—' }}</td>
              <td>{{ formatDate(review.createdAt) }}</td>
              <td class="text-center">
                <button 
                  class="btn btn-sm btn-danger" 
                  @click="deleteReview(review._id)"
                >
                  Xóa
                </button>
              </td>
            </tr>
            <tr v-if="filteredReviews.length === 0">
              <td colspan="6" class="text-center text-muted">Không có đánh giá nào</td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  </AdminLayout>
</template>



<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout.vue'

const reviews = ref([]);
const searchQuery = ref('');
const selectedRating = ref('');
const startDate = ref('');
const endDate = ref('');

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const fetchReviews = async () => {
  const token = localStorage.getItem('adminToken')
  const res = await axios.get('http://localhost:5000/api/admin/reviews/all', {
    headers: { Authorization: `Bearer ${token}` }
  })
  reviews.value = res.data;
};

const deleteReview = async (id) => {
  const confirmDelete = confirm('Bạn có chắc muốn xóa đánh giá này?');
  if (!confirmDelete) return;

  const token = localStorage.getItem('adminToken'); 
  try {
    await axios.delete(`http://localhost:5000/api/admin/reviews/delete/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    reviews.value = reviews.value.filter(r => r._id !== id);
    alert('Xóa đánh giá thành công!');
  } catch (err) {
    console.error('Lỗi khi xóa đánh giá:', err);
    alert('Không thể xóa đánh giá.');
  }
};

// computed để lọc
const filteredReviews = computed(() => {
  return reviews.value.filter(r => {
    const keyword = searchQuery.value.toLowerCase();
    const matchesKeyword = 
      r.userId?.name?.toLowerCase().includes(keyword) ||
      r.productId?.name?.toLowerCase().includes(keyword) ||
      r.comment?.toLowerCase().includes(keyword);

    const matchesRating = selectedRating.value 
      ? r.rating === parseInt(selectedRating.value) 
      : true;

    const createdAt = new Date(r.createdAt);
    const matchesStart = startDate.value ? createdAt >= new Date(startDate.value) : true;
    const matchesEnd = endDate.value ? createdAt <= new Date(endDate.value) : true;

    return matchesKeyword && matchesRating && matchesStart && matchesEnd;
  });
});

onMounted(() => {
  fetchReviews();
});
</script>

<style scoped>
.table-responsive {
  background: #fff;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}

.table-hover tbody tr:hover {
  background-color: #ffe8e0;
}

input, select {
  min-width: 120px;
}
</style>