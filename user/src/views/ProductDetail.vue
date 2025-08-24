<template>
  <div>
    <div class="container mt-4" v-if="product">
      <div class="row">
        <div class="col-md-6">
          <!-- Ảnh chính -->
          <img
            :src="selectedImage"
            class="img-fluid w-90 mb-3 rounded shadow-sm"
            style="max-height: 400px; object-fit: contain;"
          />

          <!-- Thumbnail -->
          <div v-if="product && product.images && product.images.length" class="d-flex gap-2 mt-2">
            <img
              v-for="(img, index) in product.images"
              :key="index"
              :src="`http://localhost:5000${img}`"
              @click="changeImage(img)"
              class="rounded border"
              style="width: 70px; height: 70px; object-fit: cover; cursor: pointer;"
            />
          </div>
        </div>

        <div class="col-md-6">
          <nav aria-label="breadcrumb" class="mb-3">
            <ol class="breadcrumb">
              <li class="breadcrumb-item" @click="$router.push('/products')" style="cursor: pointer;">Sản phẩm</li>
              <li 
                v-if="product?.category?.name" 
                class="breadcrumb-item"
                @click="$router.push({ path: '/products', query: { category: product.category.name } })"
                style="cursor: pointer;"
              >
                {{ product.category.name }}
              </li>
              <li class="breadcrumb-item active" aria-current="page">{{ product.name }}</li>
            </ol>
          </nav>
          <h2 class="fw-bold">{{ product.name }}</h2>
          <p class="text-muted">Đã bán: {{ sold }} sản phẩm</p>
          <!-- Hiển thị sao trung bình -->
          <div class="text-warning mb-2">
            <span v-for="n in Math.round(averageRating)" :key="'s'+n">★</span>
            <span v-for="n in 5 - Math.round(averageRating)" :key="'m'+n" class="text-muted">☆</span>
            <small class="text-muted">({{ reviews.length }} đánh giá)</small>
          </div>

          <p class="fw-bold text-danger fs-4">{{ product.price.toLocaleString() }} đ</p>
          <div class="d-flex align-items-center mb-3">
            <label for="quantity" class="me-2 fw-bold">Số lượng:</label>
            <div class="d-flex align-items-center">
              <button 
                class="btn btn-outline-secondary"
                @click="decrease"
              >-</button>

              <input
                type="number"
                v-model.number="quantity"
                min="1"
                :max="product.stock"
                class="form-control mx-2 text-center"
                style="width: 70px;"
                readonly
              />

              <button 
                class="btn btn-outline-secondary"
                @click="increase"
              >+</button>

              <!-- hiện dòng chữ nhỏ -->
              <small v-if="stockMessage" class="text-danger ms-2">{{ stockMessage }}</small>
            </div>     
          </div>

          <!-- Nút hành động -->
          <div class="d-flex gap-2">
            <button
              class="my-btn"
              @click="addToCart(product._id, quantity)"
            >
              Thêm vào giỏ
            </button>

            <button
              v-if="product.options && product.options.length > 0"
              class="btn btn-primary"
              @click="showDesignModal = true"
            >
              Tùy chỉnh sản phẩm
            </button>
          </div>
        </div>
      </div>

      <!-- Mô tả sản phẩm -->
      <div class="mt-4">
        <h4 class="fw-bold text-danger" >Mô tả sản phẩm</h4>
        <p class="text-start">{{ product.description }}</p>
      </div>
    </div>

    <!-- Modal thiết kế -->
    <DesignModal
      v-if="showDesignModal"
      :product="product"
      :existingDesign="existingDesign"
      @close="showDesignModal = false"
    />

    <!-- Đánh giá sản phẩm -->
    <div class="mt-5 px-4 px-md-5">
      <h4 class="fw-bold text-danger">Đánh giá sản phẩm</h4>
      <div v-if="reviews.length">
        <div
          v-for="(review, index) in reviews"
          :key="index"
          class="border p-3 my-2 rounded shadow-sm"
        >
          <div class="d-flex justify-content-between">
            <strong>{{ review.userId?.name || 'Người dùng ẩn danh' }}</strong>
            <span>{{ new Date(review.createdAt).toLocaleDateString() }}</span>
          </div>
          <div class="text-end"
              v-if="String(review.userId._id) === String(authUser._id) && (review.editCount ?? 0) === 0">
            <!-- <button @click="openEditModal(review)" class="my-btn">
              Sửa đánh giá
            </button> -->
          </div>
          <div class="text-start">
            <div class="text-warning mb-1">
              <span v-for="n in review.rating" :key="n">★</span>
              <span v-for="n in 5 - review.rating" :key="'m' + n" class="text-muted">☆</span>
            </div>
            <p class="mb-0">{{ review.comment }}</p>
          </div>
        </div>
      </div>
      <p v-else>Chưa có đánh giá nào cho sản phẩm này.</p>
    </div>

    <ReviewModal
      v-if="showEditModal"
      :productId="product._id"
      :existingReview="reviewBeingEdited"
      @close="showEditModal = false"
      @update="onReviewUpdated"
    />

    <!-- Sản phẩm liên quan -->
    <div class="mt-5 px-4 px-md-5">
  <h4 class="fw-bold text-danger mb-3">Sản phẩm liên quan</h4>
  <div v-if="relatedProducts.length > 0" class="row g-2 g-md-3">
    <div
      v-for="related in relatedProducts"
      :key="related._id"
      class="col-6 col-md-3"
      style="cursor:pointer"
      @click="$router.push(`/product/${related._id}`)"
    >
      <div class="product-card">
        <img 
          :src="related.images && related.images.length > 0 
            ? `http://localhost:5000${related.images[0]}` 
            : '/default.png'" 
          class="img-fluid rounded"
          style="height: 150px; object-fit: cover; width: 100%;"
        />
        <div class="info">
          <h6>{{ related.name }}</h6>
          <p>{{ related.price.toLocaleString() }} đ</p>
        </div>
      </div>
    </div>
  </div>
  <p v-else>Không có sản phẩm liên quan.</p>
</div>

  </div>
</template>

<script>
import axios from "axios";
import Navbar from "@/components/Navbar.vue";
import Footer from "@/components/Footer.vue";
import DesignModal from "@/components/DesignModal.vue";
import ReviewModal from "@/components/ReviewModal.vue";

export default {
  components: {
    Navbar,
    Footer,
    DesignModal,
    ReviewModal,
  },
  data() {
    return {
      product: null,
      quantity: 1,
      authUser: JSON.parse(localStorage.getItem("user")),
      showDesignModal: false,
      existingDesign: null,
      reviews: [],
      relatedProducts: [],
      sold: 0,

      showEditModal: false,
      reviewBeingEdited: null,
      editReviewData: null,
      selectedImage: "/default.png",

      stockMessage: ""
    };
  },

  computed: {
    averageRating() {
      if (!this.reviews.length) return 0;
      const total = this.reviews.reduce((sum, r) => sum + r.rating, 0);
      return total / this.reviews.length;
    }
  },

  async created() {
    await this.fetchProduct();
    await this.fetchReviews();
    await this.fetchRelatedProducts();
    await this.fetchSold();

    const designId = this.$route.query.designId;
    if (designId) {
      await this.fetchExistingDesign(designId);
      this.showDesignModal = true;
    }
  },

watch: {
    '$route.params.id': {
      immediate: true,
      async handler() {
        await this.fetchProduct();
        await this.fetchReviews(); 
        await this.fetchSold(); 
      }
    }
  },

  methods: {
    async fetchProduct() {
      const id = this.$route.params.id;
      try {
        const res = await axios.get(`http://localhost:5000/api/users/product/${id}`);
        this.product = res.data;

        if (this.product.images && this.product.images.length > 0) {
          this.selectedImage = `http://localhost:5000${this.product.images[0]}`;
        }


        // Gọi sản phẩm liên quan
        await this.fetchRelatedProducts();
      } catch (err) {
        console.error("Lỗi khi lấy chi tiết sản phẩm:", err);
      }
    },

    changeImage(img) {
      this.selectedImage = `http://localhost:5000${img}`;
    },

    async fetchReviews() {
      const productId = this.$route.params.id;
      const token = localStorage.getItem("userToken");

      try {
        const res = await axios.get(
          `http://localhost:5000/api/users/reviews/product/${productId}`,
          token
            ? { headers: { Authorization: `Bearer ${token}` } }
            : {} // không gửi header nếu chưa login
        );
        this.reviews = res.data;
      } catch (err) {
        console.error("Lỗi khi lấy đánh giá:", err);
        this.reviews = []; // fallback an toàn
      }
    },

    editReview(review) {
      this.reviewBeingEdited = review;
      this.showEditModal = true;
    },

   async updateReview(updatedData) {
    const token = localStorage.getItem("userToken");
    if (!this.reviewBeingEdited) return;

    try {
      const res = await axios.put(
        `http://localhost:5000/api/users/reviews/${this.reviewBeingEdited._id}`,
        {
          rating: updatedData.rating,
          comment: updatedData.comment
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Cập nhật local
      const index = this.reviews.findIndex(r => r._id === res.data._id);
      if (index !== -1) {
        this.reviews[index] = res.data;
      }

      // Ẩn nút sửa (editCount >= 1)
      this.showEditModal = false;
      this.reviewBeingEdited = null;

    } catch (err) {
      console.error("Lỗi khi cập nhật đánh giá:", err.response?.data || err.message);
    }
  },
    openEditModal(review) {
      this.editReviewData = { ...review }
      this.showEditModal = true
    },

    async fetchSold() {
      try {
        const res = await axios.get(`http://localhost:5000/api/users/product/${this.$route.params.id}/sold`);
        this.sold = res.data.sold;
      } catch (err) {
        console.error("Lỗi khi lấy số lượng đã bán:", err);
      }
    },

    async fetchExistingDesign(designId) {
      const token = localStorage.getItem("userToken");
      try {
        const res = await axios.get(`http://localhost:5000/api/users/design/${designId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.existingDesign = res.data;
      } catch (err) {
        console.error("Lỗi khi lấy thiết kế để chỉnh sửa:", err);
      }
    },
    
    increase() {
    if (this.quantity < this.product.stock) {
      this.quantity++;
      this.stockMessage = "";
    } else {
      this.stockMessage = `Chỉ còn ${this.product.stock} sản phẩm`;
    }
  },

  decrease() {
    if (this.quantity > 1) {
      this.quantity--;
      this.stockMessage = "";
    }
  },
    async addToCart(productId, qty = 1) {
    if (qty < 1) {
      return alert("Vui lòng chọn số lượng hợp lệ!");
    }

    if (qty > this.product.stock) {
      return alert(`Chỉ còn ${this.product.stock} sản phẩm`);
    }

    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("userToken");

    if (!user || !token) {
      alert("Bạn cần đăng nhập để thêm vào giỏ hàng.");
      this.$router.push("/login");
      return;
    }

    try {
      await axios.post(
        `http://localhost:5000/api/cart/add`,
        {
          userId: user._id,
          productId: this.product._id,
          quantity: qty,   
          price: this.product.price,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert(`Đã thêm ${qty} sản phẩm vào giỏ hàng!`);
    } catch (err) {
      alert("Lỗi khi thêm giỏ hàng: " + (err.response?.data?.message || err.message));
    }
  },

    async fetchRelatedProducts() {
      if (!this.product?.category) return;
      try {
        const categoryId = this.product.category._id || this.product.category;

        const res = await axios.get('http://localhost:5000/api/users/products/related', {
          params: {
            categoryId,
            excludeId: this.product._id,
          }
        });

        this.relatedProducts = res.data;
      } catch (err) {
        console.error("Lỗi khi lấy sản phẩm liên quan:", err);
      }
    },

  },
};
</script>

<style scoped>
.product-card {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 0; /* không bo góc */
  overflow: hidden; /* cắt viền trắng dư */
}

.product-card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block; /* bỏ khoảng trống dưới ảnh */
  border-radius: 0; /* bỏ bo góc mặc định */
}

.product-card .info {
  padding: 6px;
}

.product-card h6 {
  font-size: 14px;
  margin: 0 0 4px 0;
}

.product-card p {
  font-size: 14px;
  font-weight: bold;
  color: #ee4d2d; /* màu Shopee */
  margin: 0;
}


</style>