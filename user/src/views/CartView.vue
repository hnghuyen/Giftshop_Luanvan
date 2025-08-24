<template>
  <div class="layout-wrapper d-flex flex-column min-vh-100">

    <div class="container py-5 flex-grow-1">
      <h2 class="text-center fw-bold pb-3" style="color: #E04338;">GIỎ HÀNG</h2>
      <div v-if="cart && cart.items.length">
        <div
          v-for="(item, index) in cart.items"
          :key="item._id"
          class="d-flex align-items-center border p-2 mb-2 rounded"
        >
          <!-- Checkbox -->
          <input type="checkbox" v-model="item.selected" class="form-check-input me-2 custom-checkbox" />

          <!-- Ảnh sản phẩm -->
          <img
            :src="item.productId.images && item.productId.images.length > 0 
                    ? `http://localhost:5000${item.productId.images[0]}` 
                    : '/placeholder.png'"
            alt="product image"
            class="rounded flex-shrink-0"
            style="width: 80px; height: 80px; object-fit: cover;"
          />

          <div class="flex-grow-1 ms-3 d-flex flex-column text-start">
            <h5 class="mb-1">{{ item.productId.name }}</h5>

            <div v-if="item.customOptions">
              <div 
                v-for="(val, key) in item.customOptions" 
                :key="key" 
                class="small text-muted"
              >
                <strong>{{ key }}:</strong>
                {{ findLabelForChoice(key, val, item.productId?.options || []) }}
              </div>
            </div>
          </div>
            <!-- Nút tăng giảm -->
            <div class="d-flex flex-column align-items-center">
              <div class="d-flex flex-row align-items-center">
                <button 
                  class="btn btn-sm btn-outline-secondary mb-0 mx-3" 
                  @click="updateQuantity(item, -1)"
                >-</button>

                <span>{{ item.quantity }}</span>

                <button 
                  class="btn btn-sm btn-outline-secondary mt-0 mx-3" 
                  @click="updateQuantity(item, 1)"
                >+</button>
              </div>

            <small v-if="item.stockMessage" class="text-danger">
              {{ item.stockMessage }}
            </small>
            </div>

          <!-- Giá -->
          <div class="fw-bold mx-3 flex-shrink-0">
            {{ (item.price * item.quantity).toLocaleString() }} đ
          </div>

          <!-- Nút xóa -->
          <div class="flex-shrink-0">
            <button class="btn btn-sm btn-danger" @click="removeFromCart(item.productId._id, item.customOptions)">Xóa</button>
          </div>
        </div>
      </div>
      <div v-else>
        <p>Giỏ hàng đang trống.</p>
      </div>

      <div v-if="cart && cart.items.length" class="text-end mt-4">
        <h6>
          Tổng cộng: {{ totalPrice.toLocaleString() }} đ
        </h6>

        <!-- Nếu có mã giảm giá khả dụng -->
        <div v-if="selectedCoupon">
          <div class="fw-bold mb-1" v-if="!canUseCoupon(selectedCoupon)" style="color: #FFA500;">
            Mã {{ selectedCoupon.code }} yêu cầu đơn hàng từ {{ selectedCoupon.minOrderValue.toLocaleString() }} đ
          </div>
          <div class="fw-bold mb-1 text-danger" v-else>
            Giảm: {{ (totalPrice - discountedTotal).toLocaleString() }} đ
          </div>
          <div class="fw-bold mb-2" v-if="canUseCoupon(selectedCoupon)">
            Thành tiền: {{ discountedTotal.toLocaleString() }} đ
          </div>
        </div>
      </div>

    </div>

    <div class="cart-footer d-flex justify-content-between mt-4">

      <!-- Cột trái: Mã giảm giá -->
      <div class="coupon-column">
        <h5 style="color: #E04338;">Mã giảm giá</h5>
        <div v-for="coupon in coupons" :key="coupon._id" 
            class="coupon-item mb-2"
            :class="{ 'disabled-coupon': !canUseCoupon(coupon) }">
          <div class="form-check">
            <input
              class="form-check-input"
              type="radio"
              :value="coupon"
              v-model="selectedCoupon"
              :disabled="!canUseCoupon(coupon)"
              :id="'coupon-' + coupon._id"
            />
            <label class="form-check-label ms-2" :for="'coupon-' + coupon._id">
              {{ coupon.code }} - 
              {{ coupon.discountType === 'percentage' ? coupon.discountValue + '%' : coupon.discountValue.toLocaleString() + 'đ' }}
              (ĐH từ {{ coupon.minOrderValue.toLocaleString() }} đ)
            </label>
          </div>
        </div>
      </div>

      <div class="checkout-column">
        
        <button class="my-btn" @click="handleCheckout">
          Tiến hành đặt hàng
        </button>
      </div>

    </div>


  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import axios from "axios";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";
import Footer from "@/components/Footer.vue";

const router = useRouter();

const auth = useAuthStore();
const cart = ref(null);

const coupons = ref([]);            // danh sách tất cả coupon
const selectedCoupon = ref(null);
const fetchCoupons = async () => {
  try {
    const res = await axios.get('http://localhost:5000/api/users/coupons/available', {
      headers: { Authorization: `Bearer ${auth.token}` }
    });
    coupons.value = res.data; // lưu danh sách mã
  } catch (err) {
    console.error('Không tải được mã giảm giá:', err);
  }
};
const canUseCoupon = (coupon) => {
  return totalPrice.value >= coupon.minOrderValue && selectedItems.value.length > 0;
};

const discountedTotal = computed(() => {
  if (!selectedCoupon.value) return totalPrice.value;
  if (!canUseCoupon(selectedCoupon.value)) return totalPrice.value;

  let discount = 0;
  if (selectedCoupon.value.discountType === 'percentage') {
    discount = totalPrice.value * (selectedCoupon.value.discountValue / 100);
  } else if (selectedCoupon.value.discountType === 'amount') {
    discount = selectedCoupon.value.discountValue;
  }

  const final = totalPrice.value - discount;
  return final > 0 ? final : 0;
});


onMounted(() => {
  if (!auth.user) {
    router.push("/login");
  } else {
    fetchCart();
    fetchCoupons();
  }
});

const fetchCart = async () => {
  try {
    const res = await axios.get(
      `http://localhost:5000/api/cart/${auth.user._id}`
    );

    cart.value = {
      ...res.data,
      items: res.data.items.map(item => ({
        ...item,
        stock: item.productId?.stock || 0,   // gắn stock vào item
        stockMessage: ""                     // để show thông báo khi vượt tồn kho
      }))
    };
  } catch (err) {
    console.error("Lỗi lấy giỏ hàng:", err);
  }
};


const selectedItems = computed(() => {
  if (!cart.value) return []
  return cart.value.items.filter(i => i.selected)
})

const removeFromCart = async (productId, customOptions = null) => {
  await axios.post("http://localhost:5000/api/cart/remove", {
    userId: auth.user._id,
    productId,
    customOptions, 
  });
  fetchCart();
};


const totalPrice = computed(() => {
  if (!cart.value) return 0;
  return cart.value.items
    .filter(item => item.selected)        // Chỉ tính item tick
    .reduce((sum, item) => {
      const price = item.price || item.productId.price;
      return sum + price * item.quantity;
    }, 0);
});

const updateQuantity = async (item, delta) => {
  const newQuantity = item.quantity + delta;

  // Nếu giảm thì chỉ cần check > 0
  if (delta < 0 && newQuantity < 1) {
    return; // không cho giảm xuống 0
  }

  // Nếu tăng thì check tồn kho
  if (delta > 0 && newQuantity > item.productId.stock) {
    item.stockMessage = `Chỉ còn ${item.productId.stock} sản phẩm`;
    return;
  }

  item.stockMessage = "";

  try {
    await axios.post("http://localhost:5000/api/cart/add", {
      userId: auth.user._id,
      productId: item.productId._id,
      quantity: delta,
      customOptions: item.customOptions,
      price: item.price,
    });
    await fetchCart();
  } catch (err) {
    console.error("Lỗi cập nhật số lượng:", err);
  }
};

const handleCheckout = () => {
  const selected = cart.value.items.filter(item => item.selected);
  if (selected.length === 0) return alert("Vui lòng chọn sản phẩm để đặt hàng");

  sessionStorage.setItem('selectedItems', JSON.stringify(selected));
  sessionStorage.setItem('selectedCoupon', JSON.stringify(selectedCoupon.value));

  router.push("/checkout");
};


const findLabelForChoice = (key, value, options = []) => {
  if (!Array.isArray(options)) return value;

  const opt = options.find(o => o.name === key);
  const choice = opt?.choices?.find(c => c.value === value);
  return choice?.label || value;
};

</script>

<style scoped>
.cart-footer {
  display: flex;
  justify-content: space-between; /* trái phải */
  align-items: flex-start;        /* canh đầu dòng */
  margin-top: 20px;
  padding: 10px 15px;
  border-top: 1px solid #ccc;
}

.coupon-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start; 
  text-align: start;
  gap: 8px;                 /* khoảng cách giữa các mã */
}

.coupon-item {
  border: 1px solid #E04338;
  background-color: #fff0f0;
  border-radius: 6px;
  padding: 10px 15px;       /* tăng padding để thụt sâu hơn */
  width: 60%;               
  text-align: left;         /* chữ căn trái */
  margin-left: 20px;        
}

.coupon-item .form-check-label {
  margin-left: 0;           /* bỏ margin để text sát padding của khung */
}

.coupon-item.disabled-coupon {
  opacity: 0.6;
}

.checkout-column {
  display: flex;
  flex-direction: column;
  align-items: flex-end;   /* căn phải */
  justify-content: flex-start;
}

.checkout-column .my-btn {
  padding: 10px 20px;
  margin-top: 5px;
}

.coupon-wrapper {
  padding: 0;
  margin: 0;
}


.coupon-item.disabled-coupon {
  opacity: 0.6;                 /* mờ nếu không dùng được */
}

.coupon-item .form-check-label {
  margin-left: 10px;             /* thụt nhãn trong radio */
}


.total-checkout {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.total-checkout .my-btn {
  padding: 8px 20px;
  margin-top: 5px;
}

.coupon-column h5 {
  width: 60%;         /* chiếm toàn bộ chiều ngang cột */
  text-align: center;  /* căn giữa chữ */
  margin-bottom: 10px; /* khoảng cách với các mã */
}

</style>
