<template>
  <div class="card shadow-sm">
    <div class="card-header text-white fw-bold" style="background-color: #fe7d76;">
      Danh mục 
    </div>

    <ul class="list-group list-group-flush">
      <li
        v-for="(category, index) in categories"
        :key="index"
        :class="['list-group-item list-group-item-action', { active: selectedCategory === category.name }]"
        @click="selectedCategory = category.name; $emit('category-selected', category.name)"
      >
        {{ category.name }}
      </li>
    </ul>

    <!-- Bộ lọc giá -->
    <div class="p-3 border-top">
      <label for="priceRange" class="form-label fw-bold" >Lọc theo giá</label>
      <select
        id="priceRange"
        class="form-select"
        v-model="selectedPriceRange"
        @change="$emit('price-filtered', selectedPriceRange)"
      >
        <option value="">Tất cả</option>
        <option value="0-50000">Dưới 50,000 đ</option>
        <option value="50000-100000">50,000 đ - 100,000 đ</option>
        <option value="100000-200000">100,000 đ - 200,000 đ</option>
        <option value="200000-500000">200,000 đ - 500,000 đ</option>
        <option value="500000">Trên 500,000 đ</option>
      </select>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      categories: [],
      selectedCategory: null,
      selectedPriceRange: ""
    };
  },
  async created() {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/categories');
      this.categories = res.data;
    } catch (err) {
      console.error('Lỗi khi lấy danh mục:', err);
    }
  },
};
</script>

<style scoped>
.list-group-item-action {
  cursor: pointer;
  transition: all 0.2s ease;
}

.list-group-item-action:hover {
  background-color: #ffe9e7 !important;
  color: #fd6860 !important;
  transform: scale(1.05);
}

.active {
  background-color: #ffd9d7 !important;
  color: #fd6860 !important;
}
.card {
  margin: 0;
  padding: 0; 
  border-radius: 6px; 
}
.card-header {
  padding: 8px 12px; /* thu hẹp phần header */
}

.list-group-item {
  padding: 6px 10px; /* thu hẹp khoảng cách từng item */
}

.p-3 {
  padding: 8px !important; /* phần lọc giá gọn hơn */
}

</style>
