<template>
  <div>

    <div class="container mt-4">
      <div class="row">
        <!-- Sidebar -->
        <div class="col-md-3">
          <Sidebar @category-selected="filterByCategory" />
        </div>

        <!-- Kết quả tìm kiếm -->
        <div class="col-md-9">
          <h4 class="mb-3 text-start text-danger">
            Kết quả cho: "{{ keyword }}" <span v-if="selectedCategory"> >> {{ selectedCategory }}</span>
          </h4>

          <div class="row">
            <ProductCard
              v-for="product in filteredProducts"
              :key="product._id"
              :product="product"
              @click="goToDetail(product._id)"
            />
            <div v-if="filteredProducts.length === 0" class="text-danger">
              Không tìm thấy sản phẩm nào.
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import axios from "axios";
import Navbar from "@/components/Navbar.vue";
import Sidebar from "@/components/Sidebar.vue";
import ProductCard from "@/components/ProductCard.vue";
import Footer from "@/components/Footer.vue";

export default {
  components: { Navbar, Sidebar, ProductCard, Footer },
  data() {
    return {
      products: [],
      selectedCategory: "",
      keyword: this.$route.query.keyword || "",
    };
  },
  computed: {
    filteredProducts() {
      let result = this.products;

      if (this.selectedCategory) {
        result = result.filter(
          (p) => p.category?.name?.toLowerCase() === this.selectedCategory.toLowerCase()
        );
      }

      if (this.keyword) {
        result = result.filter((p) =>
          p.name.toLowerCase().includes(this.keyword.toLowerCase())
        );
      }

      return result;
    },
  },
  methods: {
    filterByCategory(name) {
      this.selectedCategory = name;
    },
    goToDetail(id) {
      this.$router.push({ name: "ProductDetail", params: { id } });
    },
    async fetchProducts() {
      try {
        const res = await axios.get("http://localhost:5000/api/users/product");
        this.products = res.data;
      } catch (err) {
        console.error("Lỗi khi tải sản phẩm:", err);
      }
    },
  },
  watch: {
    '$route.query.keyword'(newVal) {
      this.keyword = newVal;
    },
  },
  created() {
    this.fetchProducts();
  },
};
</script>
