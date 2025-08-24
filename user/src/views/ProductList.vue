<template>
  <div>
    <div class="container mt-4">
      <div class="row">
        <!-- Sidebar -->
        <div class="col-md-2"> 
          <Sidebar 
            @category-selected="handleCategoryFilter" 
            @price-filtered="handlePriceFilter" 
          />
        </div>

        <!-- Danh sách sản phẩm -->
        <div class="col-md-10">

          <div class="mb-1 d-flex justify-content-end">
            <select class="form-select w-auto" v-model="sortOrder" @change="sortProducts">
              <option value="default">Mặc định</option>
              <option value="priceAsc">Giá: Thấp → Cao</option>
              <option value="priceDesc">Giá: Cao → Thấp</option>
            </select>
          </div>
          <h3 class="mb-4 text-start">
            <span @click="resetFilters" style="cursor: pointer">
              Sản phẩm
            </span>
            <span v-if="selectedCategory"> / {{ selectedCategory }}</span>
            <span v-if="selectedPriceRange"> / {{ selectedPriceRangeLabel }}</span>
          </h3>

          <div class="row g-3">
            <div 
              v-for="product in filteredProducts" 
              :key="product._id" 
              class="col-6 col-sm-4 col-md-3"
            >
              <div 
                class="product-card" 
                @click="goToDetail(product._id)"
              >
                <div class="product-image-wrapper">
                  <img 
                    :src="product.images && product.images.length > 0 
                      ? `http://localhost:5000${product.images[0]}` 
                      : '/default.png'" 
                    :alt="product.name" 
                  />
                </div>
                <div class="p-2">
                  <h6 class="mb-1 text-truncate">{{ product.name }}</h6>
                  <p class="text-danger fw-bold mb-2">{{ formatPrice(product.price) }}₫</p>
                  <button 
                    class="my-btn w-100"
                    @click.stop="handleAddToCart(product)"
                  >
                    Giỏ
                  </button>
                </div>
              </div>
            </div>     

            <div v-if="filteredProducts.length === 0" class="text-danger">
              Không có sản phẩm phù hợp.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import ProductCard from "@/components/ProductCard.vue";
import Navbar from "@/components/Navbar.vue";
import Sidebar from "@/components/Sidebar.vue";
import Footer from "@/components/Footer.vue";

export default {
  components: {
    ProductCard,
    Navbar,
    Sidebar,
    Footer,
  },
  data() {
    return {
      products: [],
      selectedCategory: "",
      selectedPriceRange: "",
      originalProducts: [], // lưu lại danh sách gốc để reset
      sortOrder: 'default'
    };
  },
  computed: {
    selectedPriceRangeLabel() {
      switch (this.selectedPriceRange) {
        case "0-50000": return "Dưới 50,000 đ";
        case "50000-100000": return "50,000 đ - 100,000 đ";
        case "100000-200000": return "100,000 đ - 200,000 đ";
        case "200000-500000": return "200,000 đ - 500,000 đ";
        case "500000": return "Trên 500,000 đ";
        default: return "";
      }
    },
    filteredProducts() {
      return this.products.filter(p => {
        let matchCategory = !this.selectedCategory || p.category?.name === this.selectedCategory;
        let matchPrice = true;

        if (this.selectedPriceRange) {
          const price = p.price;
          if (this.selectedPriceRange.includes("-")) {
            const [min, max] = this.selectedPriceRange.split("-").map(Number);
            matchPrice = price >= min && price <= max;
          } else {
            // Trên giá
            const min = Number(this.selectedPriceRange);
            matchPrice = price > min;
          }
        }

        return matchCategory && matchPrice;
      });
    },
  },
  async created() {
    try {
      const res = await axios.get("http://localhost:5000/api/users/product");
      this.products = res.data;
      this.originalProducts = [...res.data];
    } catch (err) {
      console.error("Lỗi khi lấy danh sách sản phẩm:", err);
    }
  },
  methods: {
    goToDetail(id) {
      this.$router.push({ name: "ProductDetail", params: { id } });
    },
    formatPrice(price) {
      return price.toLocaleString("vi-VN");
    },
    handleCategoryFilter(categoryName) {
      this.selectedCategory = categoryName;
    },
    handlePriceFilter(priceRange) {
      this.selectedPriceRange = priceRange;
    },
    resetFilters() {
      this.selectedCategory = "";
      this.selectedPriceRange = "";
    },
    async handleAddToCart(product) {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("userToken");

      if (!user || !user._id || !token) {
        alert("Bạn cần đăng nhập để thêm vào giỏ hàng.");
        this.$router.push("/login");
        return;
      }

      try {
        await axios.post(
          "http://localhost:5000/api/cart/add",
          {
            userId: user._id,
            productId: product._id,
            quantity: 1,
            price: product.price,
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        alert("Đã thêm sản phẩm vào giỏ hàng!");
      } catch (err) {
        console.error("Lỗi thêm vào giỏ hàng:", err.response?.data || err.message);
        alert("Lỗi khi thêm sản phẩm!");
      }
    },
    sortProducts() {
      if (this.sortOrder === 'priceAsc') {
        this.products.sort((a, b) => (a.price || a.productId?.price) - (b.price || b.productId?.price));
      } else if (this.sortOrder === 'priceDesc') {
        this.products.sort((a, b) => (b.price || b.productId?.price) - (a.price || a.productId?.price));
      } else {
        // trở về mặc định
        this.products = [...this.originalProducts];
      }
    },
  },
};
</script>

<style scoped>
.product-card {
  border: 1px solid #eee;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}
.product-card:hover {
  transform: scale(1.03);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.product-image-wrapper {
  position: relative;
  width: 100%;
  padding-top: 100%; /* Vuông */
  overflow: hidden;
  border-bottom: 1px solid #eee;
}
.product-image-wrapper img {
  position: absolute;
  top: 0; left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.2s ease-in-out;
}
.product-card:hover .product-image-wrapper img {
  transform: scale(1.01);
}

.my-btn {
  background-color: #fe7d76;
  color: #fff;
  border: none;
  padding: 6px 0;
  border-radius: 4px;
}
.my-btn:hover {
  background-color: #ff5e54;
}
</style>
