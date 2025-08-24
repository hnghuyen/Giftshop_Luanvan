<template>
  <div>

    <div class="checkout-container">
      <div class="container py-4">
      <h2 class="text-center fw-bold pb-3" style="color: #E04338;">ĐẶT HÀNG</h2>

      <div v-if="cart && cart.items.length">
        <ul class="list-group mb-3">
          <ul class="checkout-list mb-3">
            <li v-for="item in cart.items" :key="item.productId._id" class="checkout-item p-3 mb-2 rounded shadow-sm bg-light d-flex align-items-center">
              <!-- Ảnh sản phẩm -->
              <img
                :src="item.productId.images && item.productId.images.length > 0 
                        ? `http://localhost:5000${item.productId.images[0]}` 
                        : '/placeholder.png'"
                alt="product image"
                class="rounded me-3"
                style="width: 80px; height: 80px; object-fit: cover;"
              />

              <!-- Thông tin sản phẩm -->
              <div class="flex-grow-1 text-start">
                <h6 class="mb-1">{{ item.productId.name }}</h6>
                <small v-if="item.customOptions">
                  <div v-for="(val, key) in item.customOptions" :key="key" class="text-muted">
                    <strong>{{ key }}:</strong> {{ findLabelForChoice(key, val, item.productId?.options || []) }}
                  </div>
                </small>
                <div class="mt-1">Số lượng: {{ item.quantity }}</div>
              </div>

              <!-- Giá -->
              <div class="fw-bold ms-3 text-end">
                {{ ((item.price || item.productId.price) * item.quantity).toLocaleString() }} đ
              </div>
            </li>
          </ul>

        </ul>

        <div v-if="selectedCoupon && totalPrice > discountedPrice" class="text-end text-success mb-2">
          Giảm giá ({{ selectedCoupon.code }}): -{{ (totalPrice - discountedPrice).toLocaleString() }} đ
        </div>
                <div class="mb-3">
          <label>Địa chỉ giao hàng:</label>
          <input type="text" class="form-control" v-model="shippingAddress" />
        </div>

        <div class="mb-3">
          <label>Số điện thoại:</label>
          <input type="text" class="form-control" v-model="phoneNumber" />
        </div>

        <!-- Hình thức thanh toán -->
        <div class="mb-3">
          <label class="form-label">Phương thức thanh toán:</label>
          <div class="payment-method-box p-3 rounded">
            <div class="form-check">
              <input
                class="form-check-input"
                type="radio"
                name="paymentMethod"
                value="COD"
                v-model="paymentMethod"
                id="payment-cod"
              />
              <label class="form-check-label" for="payment-cod">
                <i class="bi bi-truck me-1"></i> Thanh toán khi nhận hàng (COD)
              </label>
            </div>
          </div>
        </div>

        <div class="total-checkout text-end mt-4">
          <h6>Tổng cộng: {{ totalPrice.toLocaleString() }} đ</h6>

          <div v-if="selectedCoupon">
            <div class="fw-bold mb-1" v-if="!canUseCoupon(selectedCoupon)" style="color: #FFA500;">
              Mã {{ selectedCoupon.code }} yêu cầu đơn hàng từ {{ selectedCoupon.minOrderValue.toLocaleString() }} đ
            </div>
            <div class="fw-bold mb-1 text-success" v-else>
              Giảm: {{ (totalPrice - discountedPrice).toLocaleString() }} đ
            </div>
            <div class="fw-bold mb-2" v-if="canUseCoupon(selectedCoupon)">
              Thành tiền: {{ discountedPrice.toLocaleString() }} đ
            </div>
          </div>

          <button class="my-btn" @click="submitOrder">
            Đặt hàng
          </button>
        </div>
      </div>

      <div v-else>
        <p>Không có sản phẩm trong giỏ hàng.</p>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { computed } from 'vue';


const auth = useAuthStore()
const router = useRouter()
const selectedCoupon = ref(null)
const coupons = ref([])

const cart = ref(null)
const shippingAddress = ref('')
const phoneNumber = ref('')
const paymentMethod = ref('COD') // mặc định COD

const fetchCart = async () => {
  try {
    const res = await axios.get(`http://localhost:5000/api/cart/${auth.user._id}`)
    cart.value = res.data
  } catch (error) {
    alert('Không thể tải giỏ hàng.')
  }
}

const findLabelForChoice = (key, value, options = []) => {
  if (!Array.isArray(options)) return value;

  const opt = options.find(o => o.name === key);
  const choice = opt?.choices?.find(c => c.value === value);
  return choice?.label || value;
};


const discountedPrice = computed(() => {
  if (!selectedCoupon.value) return totalPrice.value;

  // Đủ điều kiện mới áp dụng
  if (totalPrice.value < selectedCoupon.value.minOrderValue) return totalPrice.value;

  let discount = 0;
  if (selectedCoupon.value.discountType === 'percentage') {
    discount = totalPrice.value * (selectedCoupon.value.discountValue / 100);
  } else if (selectedCoupon.value.discountType === 'amount') {
    discount = selectedCoupon.value.discountValue;
  }

  const final = totalPrice.value - discount;
  return final > 0 ? final : 0;
});


const submitOrder = async () => {
  if (!shippingAddress.value.trim() || !phoneNumber.value.trim()) {
    return alert('Vui lòng nhập đầy đủ thông tin!');
  }

  const orderItems = cart.value.items.map(item => ({
    product: item.productId._id,
    quantity: item.quantity,
    price: item.price || item.productId.price,
    customOptions: item.customOptions || {}
  }));

  try {
    await axios.post('http://localhost:5000/api/users/orders', {
      orderItems,
      shippingAddress: shippingAddress.value,
      phoneNumber: phoneNumber.value,
      paymentMethod: paymentMethod.value,
      totalPrice: totalPrice.value,
      couponCode: selectedCoupon.value?.code || null,
    }, {
      headers: { Authorization: `Bearer ${auth.token}` }
    });

    alert('Đặt hàng thành công!');
    router.push('/orders');
  } catch (err) {
    console.error(err);
    alert('Không thể đặt hàng.');
  }
};


const totalPrice = computed(() => {
  if (!cart.value) return 0;
  return cart.value.items.reduce((sum, item) => {
    const price = item.price || item.productId.price;
    return sum + price * item.quantity;
  }, 0);
});

const canUseCoupon = (coupon) => {
  return totalPrice.value >= coupon.minOrderValue;
};


const fetchCoupons = async () => {
  try {
    const res = await axios.get('http://localhost:5000/api/users/coupons/available', {
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    });
    coupons.value = res.data;
  } catch (error) {
    console.error('Không thể tải mã giảm giá:', error);
  }
}

const fetchUserInfo = async () => {
  try {
    const res = await axios.get(`http://localhost:5000/api/users/info/${auth.user._id}`);
    if (res.data) {
      shippingAddress.value = res.data.address || '';
      phoneNumber.value = res.data.phone || '';
    }
  } catch (error) {
    console.error('Không lấy được thông tin người dùng:', error);
  }
};

onMounted(() => {
  if (!auth.user) {
    router.push('/login');
    return;
  }

  const selected = JSON.parse(sessionStorage.getItem('selectedItems') || '[]');
    if (selected.length > 0) {
      cart.value = { items: selected };
    } else {
      alert("Bạn chưa chọn sản phẩm nào từ giỏ hàng!");
      router.push("/cart");
      return;
    }

  const savedCoupon = JSON.parse(sessionStorage.getItem('selectedCoupon') || 'null');
  if (savedCoupon) {
    selectedCoupon.value = savedCoupon;
  }

  // Các dữ liệu khác
  fetchUserInfo();
  fetchCoupons();
});

</script>

<style scoped>
.payment-method-box {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
}

.container{
  margin-top: 15px;
  width: 80%;
  background:  #f0f0f0;
  padding: 30px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
  border: 2px solid #ccc;
}

.checkout-list {
  padding: 0;
  list-style: none;
}

.checkout-item {
  background-color: #f8f9fa; /* khung xám nhạt */
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.checkout-item img {
  border-radius: 8px;
}

.checkout-item h6 {
  margin: 0;
}

.checkout-item small div {
  font-size: 0.85rem;
}

.checkout-item .fw-bold {
  min-width: 100px;
}

</style>

