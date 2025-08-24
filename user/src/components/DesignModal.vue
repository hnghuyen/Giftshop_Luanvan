<template>
<div class="modal-backdrop" v-if="product">
  <div class="modal-content p-4 bg-white rounded shadow-lg">
    <!-- Tiêu đề -->
    <h4 class="modal-title text-center mb-3" style="color: #E04338;">Tùy chỉnh {{ product.name }}</h4>

    <div class="modal-body d-flex gap-3">
      <!-- Cột trái: các tùy chọn -->
      <div class="options-container flex-1">
        <div v-for="option in product.options" :key="option.name" class="mb-3">
          <label>{{ option.name }} <span v-if="option.required">*</span></label>
          <select v-if="option.type === 'select'" v-model="customOptions[option.name]" class="form-select">
            <option disabled value="">-- Chọn {{ option.name }} --</option>
            <option v-for="choice in option.choices" :key="choice.value" :value="choice.value">
              {{ choice.label }} (+{{ formatPrice(choice.extraPrice) }})
            </option>
          </select>
          <div v-else-if="option.type === 'text'" class="mb-2">
            <input type="text" v-model="customOptions[option.name]" class="form-control"
                   :placeholder="`Nhập nội dung (tối đa ${option.maxLength} ký tự)`"
                   :maxlength="option.maxLength"/>
            <small class="text-muted">{{ customOptions[option.name]?.length || 0 }}/{{ option.maxLength }}</small>
          </div>
          <div v-else-if="option.type === 'image-select'" class="d-flex gap-2 flex-wrap">
            <img v-for="choice in option.choices" :key="choice.value" :src="choice.value"
                 @click="customOptions[option.name] = choice.value"
                 :class="{ 'border border-primary': customOptions[option.name] === choice.value }"
                 class="img-thumbnail" style="width: 80px; height: 80px; cursor: pointer;" />
          </div>
        </div>
      </div>

      <!-- Cột phải: giá & nút -->
      <div class="price-actions-container" style="width: 220px;">
        <div class="mt-0 p-3 border rounded bg-light mb-3">
          <p>Giá gốc: <strong>{{ formatPrice(product.price) }}</strong></p>
          <p>Phụ phí tuỳ chọn: <strong>{{ formatPrice(extraPrice) }}</strong></p>
          <p class="fw-bold text-danger">Tổng cộng: {{ formatPrice(totalPrice) }}</p>
        </div>

        <div class="d-flex gap-2 mb-2">
          <button class="btn btn-secondary flex-1" @click="$emit('close')">Hủy</button>
          <button class="btn btn-outline-primary flex-1" @click="submitDesign">Lưu</button>
        </div>
        <small style="color: #E04338;">Vui lòng lưu thiết kế trước khi thêm vào giỏ!</small>
        <button class="btn btn-danger w-100" @click="addToCart" :disabled="!designConfirmed">
          Thêm vào giỏ hàng
        </button>
      </div>
    </div>
  </div>
</div>

</template>

<script>
import axios from '../stores/axiosInstance';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

export default {
  props: ["product", "existingDesign"],
  data() {
    return {
      customOptions: {},
      extraPrice: 0,
      totalPrice: 0,
      designConfirmed: false,

      auth: null,
      router: null
    };
  },
  watch: {
    customOptions: {
      handler() {
        this.calculatePrice();
      },
      deep: true,
    },
  },
  
  created() {
  this.auth = useAuthStore();
  this.router = useRouter();

  if (this.product?.options?.length) {
    this.product.options.forEach((option) => {
      this.customOptions[option.name] =
        this.existingDesign?.customOptions?.[option.name] || '';
    });
  }

  this.calculatePrice(); // Tính luôn giá lúc mở lại thiết kế
},

methods: {
  formatPrice(price) {
      return new Intl.NumberFormat("vi-VN").format(price) + "₫";
  },

  async submitDesign() {
    if (!this.auth.user) {
      alert("Bạn cần đăng nhập.");
      this.router.push('/login');
      return;
    }

    // Kiểm tra xem có tùy chọn nào chưa chọn không
    const isEmpty = Object.values(this.customOptions).every(value => !value);
    if (isEmpty) {
      alert("Thiết kế rỗng, vui lòng chọn ít nhất một tùy chọn!");
      return;
    }

    // Tính lại trước khi gửi
    this.calculatePrice();

    try {
      if (this.existingDesign) {
        // Cập nhật thiết kế
        await axios.put(`/users/design/${this.existingDesign._id}`, {
          customOptions: this.customOptions,
          totalPrice: this.totalPrice, // 
        });
        alert("Thiết kế đã được cập nhật!");
      } else {
        // Tạo thiết kế mới
        await axios.post('/users/design', {
          userId: this.auth.user._id,
          productId: this.product._id,
          customOptions: this.customOptions,
          totalPrice: this.totalPrice, 
          note: '',
        });
        alert("Thiết kế đã được lưu!");
      }

      this.designConfirmed = true;
    } catch (err) {
      console.error("Lỗi khi lưu thiết kế:", err.response?.data || err.message);
      alert("Lưu thiết kế thất bại!");
    }
  },

findLabelForChoice(optionName, selectedValue) {
  const option = this.product.options.find(o => o.name === optionName);
  if (!option) return selectedValue;
  const choice = option.choices.find(c => c.value === selectedValue);
  return choice?.label || selectedValue;
},


    async addToCart() {
    if (!this.designConfirmed) {
      alert("Bạn cần lưu thiết kế trước!");
      return;
    }

    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      alert("Vui lòng đăng nhập trước khi thêm vào giỏ hàng!");
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/cart/add', {
        userId: user._id,
        productId: this.product._id,
        quantity: 1,
        customOptions: this.customOptions,
        price: this.totalPrice
      });

      alert("Thiết kế đã được thêm vào giỏ hàng!");
      this.$emit("close");
    } catch (err) {
      console.error("Lỗi thêm giỏ hàng:", err);
      alert("Thêm vào giỏ hàng thất bại!");
    }
  },


    calculatePrice() {
  if (!this.product || !this.product.options) return;

  let extra = 0;
  this.product.options.forEach((option) => {
    const selectedValue = this.customOptions[option.name];
    const choice = option.choices?.find(c => c.value === selectedValue);
    if (choice && choice.extraPrice) {
      extra += choice.extraPrice;
    }

    if (option.type === 'text' && selectedValue && option.extraPricePerChar) {
      extra += selectedValue.length * option.extraPricePerChar;
    }
  });

  this.extraPrice = extra;
  this.totalPrice = this.product.price + extra;
}

  },
};
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;     /* center theo trục Y */
  justify-content: center; /* center theo trục X */
  padding: 10px;           
  box-sizing: border-box;
  z-index: 1050;
}

.modal-content {
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  background-color: #fff;
  border-radius: 8px;
  padding: 15px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-body {
  display: flex;
  gap: 15px;
  flex: 1;
}

.options-container {
  flex: 1; /* chiếm hết chỗ có thể cho tùy chọn */
  max-height: 70vh;
  overflow-y: auto;
  padding-right: 5px;
}

.price-actions-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 200px; /* đảm bảo cột giá/nút đủ rộng */
}

</style>
