<template>
<div class="container py-4">
  <h2 class="text-center fw-bold pb-3" style="color: #E04338;">CHI TIẾT ĐƠN HÀNG</h2>
  <div v-if="order">

    <div class="order-tracking my-4 position-relative">

      <div v-if="order.status === 'Đã giao hàng'" 
        style="color: red; font-weight: bold; z-index: 10; position: relative;" class="text-end">
        Vui lòng chọn "Đã nhận hàng" khi bạn nhận được đơn nhé!
      </div>

      <div v-if="order.status === 'Đã giao hàng'" class="mb-2 text-end">
        <button @click="confirmReceived" class="my-btn">
          Đã nhận hàng
        </button>
      </div>

      <!-- Thanh tiến trình -->
      <div class="progress-container position-relative">
        <div class="progress-bar"></div>
        <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
        <div class="steps d-flex justify-content-between">
          <div v-for="(step, index) in steps" :key="index" class="step"
              :class="{ active: step === order.status, completed: isStepCompleted(step) }">
            <div class="circle">{{ index + 1 }}</div>
            <div class="label">{{ step }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Khung thông tin + sản phẩm -->
    <div class="row">
      <!-- Thông tin đơn hàng -->
      <div class="col-12 mb-3">
        <div class="p-3 border rounded bg-light">
          <div class="d-flex  justify-content-between text-start">
            <div>
              <p><strong>Trạng thái:</strong> {{ order.status }}</p>
              <p><strong>Ngày đặt:</strong> {{ new Date(order.createdAt).toLocaleString() }}</p>
              <p><strong>Địa chỉ giao hàng:</strong> {{ order.shippingAddress }}</p>
              <p><strong>Số điện thoại:</strong> {{ order.phoneNumber }}</p>
            </div>
            
          </div>
        </div>
      </div>

      <div class="col-md-8">
        <ul class="list-group">
          <li class="list-group-item" v-for="(item, index) in order.orderItems" :key="index">
            <div class="row align-items-center">

              <!-- Cột 1: Hình ảnh + thông tin -->
              <div class="col-md-7 d-flex align-items-start">
                <!-- Hình ảnh sản phẩm -->
                <img
                  :src="item.product?.images && item.product.images.length > 0 
                          ? `http://localhost:5000${item.product.images[0]}` 
                          : '/placeholder.png'"
                  alt="product image"
                  class="rounded me-3"
                  style="width: 80px; height: 80px; object-fit: cover;"
                />

                <!-- Thông tin sản phẩm -->
                <div class="text-start">
                  <router-link v-if="item.product?.isActive" 
                              :to="`/product/${item.product._id}`" 
                              class="fw-bold" style="color: #E04338;">
                    {{ item.product.name }}
                  </router-link>
                  <span v-else class="text-danger fw-bold">
                    {{ item.product?.name || 'Sản phẩm ngừng kinh doanh' }}
                  </span>
                  <div>Số lượng: {{ item.quantity }}</div>
                  <div>Giá: {{ item.price.toLocaleString() }} đ</div>

                  <!-- Tùy chọn thiết kế -->
                  <div v-if="item.customOptions && Object.keys(item.customOptions).length > 0" class="mt-1">
                    <small class="text-muted"><strong style="color: #E04338">Tùy chọn thiết kế:</strong></small>
                    <ul class="mb-0 ps-3 text-start">
                      <li v-for="(value, key) in item.customOptions" :key="key" style="font-style: italic;">
                        {{ key }}: {{ findLabelForChoice(key, value, item.product?.options || []) }}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <!-- Cột 2: Tổng tiền -->
              <div class="col-md-3 text-end fw-bold">
                {{ (item.quantity * item.price).toLocaleString() }} đ
              </div>

              <!-- Cột 3: Nút đánh giá -->
              <div class="col-md-2 text-end">
                <div v-if="order.status === 'Hoàn thành' && item.product?.isActive">
                  <button v-if="!reviewedProductIds.includes(String(item.product._id))"
                          class="btn btn-primary btn-sm" 
                          @click="openReviewModal(item.product._id)">
                    Đánh giá
                  </button>
                  <router-link v-else class="btn btn-outline-primary btn-sm"
                              :to="`/product/${item.product._id}`">
                    Xem đánh giá
                  </router-link>
                </div>
              </div>

            </div>
          </li>
        </ul>
      </div>

      <!-- Giá, mã giảm giá, tổng tiền -->
      <div class="col-md-4">
        <div class="p-3 border rounded bg-light h-100">
          <p><strong>Giá gốc:</strong> {{ order.originalPrice?.toLocaleString() }} đ</p>
          <p v-if="order.couponCode"><strong>Mã giảm giá đã sử dụng:</strong> {{ order.couponCode }}</p>
          <p v-if="order.discountAmount && order.discountAmount > 0"><strong>Giảm giá:</strong> -{{ order.discountAmount.toLocaleString() }} đ</p>
          <h5 style="color: #E04338;">Tổng tiền: {{ order.totalPrice.toLocaleString() }} đ</h5>
        </div>
      </div>
    </div>
  </div>

  <div v-else>
    <p>Đang tải đơn hàng...</p>
  </div>

  <!-- Modal đánh giá -->
  <ReviewModal
    v-if="showModal"
    :productId="selectedProductId"
    :orderId="order._id"
    :existingReview="getExistingReview(selectedProductId)"
    @close="showModal = false"
    @update="onReviewUpdated"
  />
</div>

</template>

  
<script setup>
  import { ref, onMounted, computed } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import axios from 'axios'
  import { useAuthStore } from '@/stores/auth'
  import ReviewModal from '../components/ReviewModal.vue';
  
  const route = useRoute()
  const router = useRouter()
  const auth = useAuthStore()
  
const order = ref({
  status: "",
  createdAt: new Date().toISOString(),
  shippingAddress: "",
  phoneNumber: "",
  orderItems: [],
  totalPrice: 0,
  originalPrice: 0,
  discountAmount: 0,
  couponCode: "",
  reviews: []
});

  const showModal = ref(false);
  const selectedProductId = ref(null);

  
const steps = [
  "Chờ xác nhận",
  "Đã xác nhận",
  "Chờ lấy hàng",
  "Đã lấy hàng",
  "Đang giao",
  "Đã giao hàng",
  "Hoàn thành"
];
const isStepCompleted = (step) => {
  const currentIndex = steps.indexOf(order.value?.status);
  const stepIndex = steps.indexOf(step);
  return stepIndex < currentIndex;
};

// tính % tiến trình để tô thanh
const progressPercent = computed(() => {
  const currentIndex = steps.indexOf(order.value?.status);
  const totalSteps = steps.length - 1;
  return (currentIndex / totalSteps) * 100;
});

  
  // Danh sách sản phẩm đã đánh giá
  const reviewedProductIds = ref([])

  const fetchOrder = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/users/orders/${route.params.id}`, {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      })
      order.value = res.data

      // Lấy danh sách sản phẩm đã đánh giá trong đơn này
      reviewedProductIds.value = order.value.reviews?.map(r => String(r.productId)) || []
    } catch (err) {
      console.error(err)
      alert('Không thể tải đơn hàng.')
      router.push('/orders')
    }
  }
const openReviewModal = (productId) => {
  selectedProductId.value = productId;
  showModal.value = true;
};
// Sau khi đánh giá thành công, thêm productId vào reviewedProductIds
const onReviewSubmitted = (productId) => {
  reviewedProductIds.value.push(productId)
  showModal.value = false
}

const onReviewUpdated = (review) => {
  const productIdStr = String(review.productId); // ép về string
  if (!reviewedProductIds.value.includes(productIdStr)) {
    reviewedProductIds.value.push(productIdStr);
  }
  showModal.value = false;
}

const getExistingReview = (productId) => {
  return order.value?.reviews?.find(r => r.productId === productId) || null
}

const findLabelForChoice = (key, value, options = []) => {
  // Nếu value là object { label, value }
  if (value && typeof value === 'object' && value.label) return value.label;

  // Nếu value là string, tìm label trong options
  const opt = options.find(o => o.name === key);
  const choice = opt?.choices?.find(c => c.value === value);
  return choice?.label || value;
};

const confirmReceived = async () => {
  const confirm = window.confirm('Bạn chắc chắn đã nhận được hàng?');
  if (!confirm) return;

  try {
    await axios.post(`http://localhost:5000/api/users/orders/${order.value._id}/complete`, {}, {
      headers: { Authorization: `Bearer ${auth.token}` }
    });
    alert('Cảm ơn bạn đã xác nhận!');
    fetchOrder(); // refresh lại trang
  } catch (err) {
    alert('Lỗi xác nhận đơn hàng');
    console.error(err);
  }
};
  
  onMounted(() => {
    if (!auth.user) {
      router.push('/login')
    } else {
      fetchOrder()
    }
  })
  </script>
  

<style scoped>
.progress-container {
  position: relative;
  width: 100%;
  margin: 30px 0;
}

.progress-bar {
  position: absolute;
  top: 12px; /* giữa vòng tròn 30px với line 6px */
  left: 0;
  width: 100%;
  height: 6px;
  background: #ddd;
  border-radius: 3px;
}

.progress-fill {
  position: absolute;
  top: 12px; /* y hệt progress-bar */
  left: 0;
  height: 6px;
  background: #4caf50;
  border-radius: 3px;
  transition: width 0.4s ease;
}


.steps {
  display: flex;
  justify-content: space-between;
  position: relative;
}

.step {
  text-align: center;
  z-index: 2; /* nằm trên line */
}

.circle {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  transition: 0.3s;
}

.step.completed .circle {
  background: #4caf50;
  color: #fff;
}

.step.current .circle {
  background: #e04338;
  color: #fff;
}

.label {
  margin-top: 8px;
  font-size: 13px;
}


</style>