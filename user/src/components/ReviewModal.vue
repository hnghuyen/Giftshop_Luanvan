<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <h5 class="mb-3" style="color: #E04338;">ĐÁNH GIÁ SẢN PHẨM</h5>

      <!-- Chọn số sao -->
      <div class="mb-3">
        <label class="fw-bold">Đánh giá:</label>
        <div class="d-flex mt-1">
          <span
            v-for="n in 5"
            :key="n"
            class="star me-1"
            :class="{ 'selected': n <= (hoverRating || rating) }"
            @mouseover="hoverRating = n"
            @mouseleave="hoverRating = 0"
            @click="rating = n"
          >
            ★
          </span>
        </div>
      </div>

      <!-- Nhận xét -->
      <div class="mb-3">
        <label class="fw-bold">Nhận xét:</label>
        <textarea v-model="comment" class="form-control" rows="3" placeholder="Viết nhận xét của bạn..."></textarea>
      </div>

      <!-- Nút gửi/hủy -->
      <div class="text-end">
        <button class="btn btn-primary me-2" @click="submitReview">Gửi</button>
        <button class="btn btn-secondary" @click="$emit('close')">Hủy</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axiosInstance from '../stores/axiosInstance';

const props = defineProps({
  productId: String,
  orderId: String,
  existingReview: Object, // dùng để sửa
});

const rating = ref(props.existingReview?.rating || 5);
const hoverRating = ref(0);
const comment = ref(props.existingReview?.comment || '');
const emit = defineEmits(['close', 'update']); 

const submitReview = async () => {
  try {
    const token = localStorage.getItem("userToken");
    let updatedReview = null;

    if (props.existingReview?._id) {
      // Đang sửa
      const res = await axiosInstance.put(`/users/reviews/${props.existingReview._id}`, {
        rating: rating.value,
        comment: comment.value
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      updatedReview = res.data;
      alert('Cập nhật đánh giá thành công!');
    } else {
      // Đánh giá mới
      const res = await axiosInstance.post('/users/reviews', {
        productId: props.productId,
        orderId: props.orderId,
        rating: rating.value,
        comment: comment.value,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.alreadyReviewed) {
        alert('Bạn đã đánh giá sản phẩm này rồi.');
      } else {
        alert('Đánh giá thành công!');
      }
      updatedReview = res.data.review;
    }

    // Reset
    rating.value = 5;
    hoverRating.value = 0;
    comment.value = '';

    emit('update', updatedReview);
    emit('close');
  } catch (err) {
    alert('Lỗi khi gửi đánh giá');
    console.error(err);
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
}

.modal-content {
  background: white;
  padding: 24px;
  border-radius: 10px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

/* Sao đánh giá */
.star {
  font-size: 1.8rem;
  color: #ccc;
  cursor: pointer;
  transition: color 0.2s;
}

.star.selected {
  color: #FFD700;
}
</style>
