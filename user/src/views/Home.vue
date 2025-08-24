<template>
  <div>
    <!-- Banner -->
    <div id="bannerCarousel" class="carousel slide mb-4" data-bs-ride="carousel">
      <div class="carousel-indicators">
        <button type="button" data-bs-target="#bannerCarousel" data-bs-slide-to="0" class="active"></button>
        <button type="button" data-bs-target="#bannerCarousel" data-bs-slide-to="1"></button>
        <button type="button" data-bs-target="#bannerCarousel" data-bs-slide-to="2"></button>
      </div>

      <div class="carousel-inner">
        <div class="carousel-item active">
          <img src="@/assets/banner/banner1.png" class="d-block w-100 banner-img" alt="Banner 1" />
        </div>
        <div class="carousel-item">
          <img src="@/assets/banner/banner2.jpg" class="d-block w-100 banner-img" alt="Banner 2" />
        </div>
        <div class="carousel-item">
          <img src="@/assets/banner/banner3.jpg" class="d-block w-100 banner-img" alt="Banner 3" />
        </div>
      </div>

      <button class="carousel-control-prev" type="button" data-bs-target="#bannerCarousel" data-bs-slide="prev">
        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Trước</span>
      </button>
      <button class="carousel-control-next" type="button" data-bs-target="#bannerCarousel" data-bs-slide="next">
        <span class="carousel-control-next-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Sau</span>
      </button>
    </div>

    <!-- SẢN PHẨM MỚI NHẤT -->
    <div class="container mt-4 mb-5">
      <h4 class="text-uppercase mb-4 fw-bold">Sản phẩm mới nhất</h4>
      <div class="row">
        <ProductCard
          v-for="(product, index) in newestProducts"
          :key="index"
          :product="product"
          class="col-md-3 mb-4"
          @click="goToDetail(product._id)"
          @add-to-cart="handleAddToCart"
        />
      </div>

      <div class="text-center">
        <router-link to="/products" class="my-btn px-4">
          Xem thêm →
        </router-link>
      </div>
    </div>
  </div>
  <!-- <FloatingChat /> -->
</template>

<script>
import Navbar from "@/components/Navbar.vue";
import ProductCard from "@/components/ProductCard.vue";
import Footer from "@/components/Footer.vue";
// import FloatingChat from '@/components/FloatingChat.vue';
import axios from 'axios';


export default {
  components: {
    Navbar,
    ProductCard,
    Footer,
    // FloatingChat,
  },
  data() {
    return {
      newestProducts: [],
    };
  },
  created() {
    this.fetchNewestProducts();
  },
  
  methods: {
    async fetchNewestProducts() {
      try {
        const res = await axios.get('http://localhost:5000/api/users/new_products?limit=8&sort=desc');
        this.newestProducts = res.data;
      } catch (error) {
        console.error("Lỗi khi tải sản phẩm mới:", error);
      }
    },

    goToDetail(productId) {
      this.$router.push({ name: 'ProductDetail', params: { id: productId } });
    },

    async handleAddToCart(product) {
      const user = JSON.parse(localStorage.getItem('user'))
      if (!user) {
        alert('Bạn cần đăng nhập trước khi thêm vào giỏ hàng!')
        return
      }

      try {
        await axios.post('http://localhost:5000/api/cart/add', {
          userId: user._id,
          productId: product._id,
          quantity: 1,
          price: product.price
        })
        alert('Đã thêm vào giỏ hàng!')
      } catch (error) {
        console.error('Lỗi khi thêm vào giỏ hàng:', error)
        alert('Thêm vào giỏ hàng thất bại!')
      }
    }
}

};
</script>

<style>
.banner-img {
  width: 100%;
  max-height: 400px;
  object-fit: cover;
  margin-top: 20px;
}
</style>
