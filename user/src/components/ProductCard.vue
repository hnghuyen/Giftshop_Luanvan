<template>
  <div class="col-md-3 mb-4"> 
    <div class="card h-100" style="cursor: pointer" @click="$emit('click')">
      <div class="text-center">
        <img
          :src="product.images && product.images.length ? `http://localhost:5000${product.images[0]}` : '/default.png'"
          :alt="product.name"
          class="card-img-top img-fluid"
          style="height: 200px; object-fit: cover; border-radius: 8px;"
        />
      </div>

      <div class="card-body text-center d-flex flex-column justify-content-between">
        <h5 class="card-title">{{ product.name }}</h5>
        <p class="card-text fw-bold text-danger">
          {{ formatPrice(product.price) }} đ
        </p>
        <button class="my-btn mt-2" @click.stop="$emit('add-to-cart', product)">
          Thêm vào giỏ
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  product: Object,
});

const emit = defineEmits(['click', 'add-to-cart']);

function formatPrice(price) {
  return price.toLocaleString('vi-VN'); // Tự động thêm dấu chấm
}
</script>

<style scoped>
.card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
  transform: scale(1.03); /* Zoom nhẹ */
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.15);
}

.card img {
  transition: transform 0.4s ease;
}

.card:hover img {
  transform: scale(1.05); /* Zoom riêng ảnh khi hover */
}
</style>
