<template>
  <div class="container py-4">
    <h2 class="text-center fw-bold pb-3" style="color: #E04338;">THIẾT KẾ</h2>

    <div v-if="designs.length === 0" class="text-muted">Bạn chưa có thiết kế nào.</div>

    <div class="row" v-else>
      <div class="col-md-4 mb-4" v-for="design in designs" :key="design._id">
        <div class="card shadow-sm h-100">
          <div class="card-body text-start">
            <h5 class="card-title" style="color: #E04338;">{{ design.product?.name || design.productId?.name || 'Không rõ tên sản phẩm' }}</h5>

            <p class="card-text small mb-1">
              Tùy chọn:
            </p>
            <ul class="mb-0 ps-3">
              <li v-for="(val, key) in design.customOptions" :key="key">
                {{ key }}: {{ findLabelForChoice(key, val, design.product?.options || design.productId?.options || []) }}
              </li>
            </ul>

            <p class="fw-bold text-danger">Giá: {{ formatPrice(calculatePrice(design)) }}</p>
            <div class="d-flex justify-content-between mt-3">
              <button class="btn btn-sm btn-outline-secondary" @click="editDesign(design)">Sửa</button>
              <button class="btn btn-sm btn-danger" @click="deleteDesign(design._id)">Xóa</button>
              <button class="btn btn-sm btn-primary" @click="addToCart(design)">Giỏ</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

</template>

<script setup>
import { onMounted, ref } from 'vue'
import axios from '@/stores/axiosInstance'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import DesignModal from '@/components/DesignModal.vue'

const auth = useAuthStore()
const router = useRouter()
const designs = ref([])

const showModal = ref(false)
const selectedProduct = ref(null)
const selectedDesign = ref(null)


const formatPrice = (price) =>
  new Intl.NumberFormat('vi-VN').format(price || 0) + '₫'

const fetchDesigns = async () => {
  try {
    const res = await axios.get('/users/design', {
      headers: { Authorization: `Bearer ${auth.token}` }
    })
    designs.value = res.data
  } catch (err) {
    console.error('Lỗi lấy thiết kế:', err)
    alert('Không thể tải thiết kế.')
  }
}

const deleteDesign = async (id) => {
  if (!confirm('Bạn chắc chắn xoá thiết kế này?')) return
  try {
    await axios.delete(`/users/design/${id}`, {
      headers: { Authorization: `Bearer ${auth.token}` }
    })
    designs.value = designs.value.filter(d => d._id !== id)
    alert('Đã xoá thiết kế.')
  } catch (err) {
    alert('Lỗi khi xoá.')
  }
}
const addToCart = async (design) => {
  const productId = design.product?._id || design.productId?._id || design.productId; 

  if (!productId) {
    alert("Không xác định được sản phẩm!");
    return;
  }

  try {
    const price = calculatePrice(design); //dùng giá tính lại

    await axios.post(
      '/cart/add',
      {
        userId: auth.user._id,
        productId: productId,
        customOptions: design.customOptions,
        quantity: 1,
        price: price   
      },
      {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      }
    );
    alert('Thiết kế đã thêm vào giỏ hàng!');
  } catch (err) {
    console.error('Lỗi thêm vào giỏ hàng:', err);
    alert('Không thể thêm vào giỏ hàng!');
  }
};


const calculatePrice = (design) => {
  let extra = 0;
  const product = design.product || design.productId; 
  const options = product?.options || [];
  const basePrice = product?.price || 0;

  options.forEach((option) => {
    const selectedValue = design.customOptions?.[option.name];
    const choice = option.choices?.find(c => c.value === selectedValue);

    if (choice?.extraPrice) {
      extra += choice.extraPrice;
    }

    if (option.type === 'text' && selectedValue && option.extraPricePerChar) {
      extra += selectedValue.length * option.extraPricePerChar;
    }
  });

  return basePrice + extra;
};


const editDesign = (design) => {
  const productId = design.productId?._id || design.productId
  router.push({
    name: 'ProductDetail',
    params: { id: productId },
    query: { designId: design._id } 
  })
}

const findLabelForChoice = (key, value, options = []) => {
  if (!Array.isArray(options)) return value;

  const opt = options.find(o => o.name === key);
  const choice = opt?.choices?.find(c => c.value === value);
  return choice?.label || value;
};


onMounted(() => {
  if (!auth.user) return router.push('/login')
  fetchDesigns()
})
</script>

<style>
.card-text small ul {
  font-size: 0.9rem;
}
</style>