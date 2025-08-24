<template>
  <AdminLayout>
    <div class="py-4">
      <div class="container-xl">
        <h2 class="text-center fw-bold pb-3 mt-2" style="color: #E04338">QUẢN LÝ KHO</h2>
          <!-- Ô tìm kiếm sản phẩm -->
          <div class="row mb-3">
            <div class="col-md-6 mx-auto">
              <input
                type="text"
                class="form-control"
                v-model="searchProduct"
                placeholder="Tìm sản phẩm theo tên..."
              />
            </div>
          </div>

        <!-- Bảng sản phẩm sắp hết hàng -->
        <div class="row">
          <div class="col-md-8 mx-auto">
            <h4 class="text-center mb-3" style="color: #E04338">Sản phẩm sắp hết hàng</h4>
            <table v-if="lowStockProducts.length" class="table table-bordered table-hover shadow-sm">
              <thead class="table-light">
                <tr class="text-center">
                  <th>STT</th>
                  <th>Tên sản phẩm</th>
                  <th>Số lượng</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(product, index) in lowStockProducts" :key="product._id">
                  <td class="text-center">{{ index + 1 }}</td>
                  <td>{{ product.name }}</td>
                  <td class="text-center text-danger fw-bold">{{ product.stock }}</td>
                </tr>
              </tbody>
            </table>
            <p v-else class="text-center text-muted">Không có sản phẩm sắp hết hàng.</p>
          </div>
        </div>

        <!-- Bảng tất cả sản phẩm -->
        <div class="row mt-5">
          <div class="col-md-10 mx-auto">
            <h4 class="text-center mb-3" style="color: #E04338">Tất cả sản phẩm trong kho</h4>
            <table v-if="filteredProducts.length" class="table table-bordered table-hover shadow-sm">
              <thead class="table-light">
                <tr class="text-center">
                  <th>STT</th>
                  <th>Tên sản phẩm</th>
                  <th>Số lượng tồn</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(product, index) in filteredProducts" :key="product._id">
                  <td class="text-center">{{ index + 1 }}</td>
                  <td>{{ product.name }}</td>
                  <td class="text-center">{{ product.stock }}</td>
                  <td class="text-center">
                    <button class="btn btn-sm btn-outline-primary" @click="openModal(product)">Cập nhật</button>
                  </td>
                </tr>
              </tbody>
            </table>
            <p v-else class="text-center text-muted">Không có sản phẩm nào trong kho.</p>
          </div>
        </div>
      </div>
    </div>
    <p v-if="!filteredProducts.length" class="text-center text-muted">
      Không tìm thấy sản phẩm nào phù hợp với từ khóa "{{ searchProduct }}".
    </p>

    <!-- Modal cập nhật tồn kho -->
    <div class="modal fade" tabindex="-1" ref="updateStockModal">
      <div class="modal-dialog">
        <div class="modal-content" v-if="selectedProduct">
          <div class="modal-header">
            <h5 class="modal-title">Cập nhật số lượng tồn</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p><strong>{{ selectedProduct.name }}</strong></p>
            <input type="number" v-model="selectedProduct.newQuantity" min="0" class="form-control" />
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
            <button class="btn btn-primary" @click="updateStock">Cập nhật</button>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script>
import axios from 'axios'
import AdminLayout from '../components/AdminLayout.vue'
import { Modal } from 'bootstrap'

export default {
  components: {
    AdminLayout
  },
  data() {
    return {
      products: [],
      lowStockProducts: [],
      selectedProduct: null,
      modalInstance: null,
      searchProduct: "",
    };
  },
  computed: {
    filteredProducts() {
      if (!this.searchProduct) return this.products;
      return this.products.filter(p =>
        p.name.toLowerCase().includes(this.searchProduct.toLowerCase())
      );
    }
  },
  mounted() {
    this.fetchProducts();
    this.fetchLowStockProducts();
  },
  methods: {
    async fetchProducts() {
      try {
        const token = localStorage.getItem("adminToken");
        const res = await axios.get("http://localhost:5000/api/admin/inventory/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.products = res.data || [];
      } catch (error) {
        console.error("Lỗi tải danh sách sản phẩm", error);
      }
    },
    async fetchLowStockProducts() {
      try {
        const token = localStorage.getItem("adminToken");
        const res = await axios.get("http://localhost:5000/api/admin/inventory/low-stock", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Dữ liệu sắp hết hàng:", res.data);
        this.lowStockProducts = res.data || [];
      } catch (error) {
        console.error("Lỗi tải sản phẩm sắp hết hàng", error);
      }
    },
    openModal(product) {
      this.selectedProduct = { ...product, newQuantity: product.stock };
      this.$nextTick(() => {
        if (!this.modalInstance) {
          this.modalInstance = new Modal(this.$refs.updateStockModal);
        }
        this.modalInstance.show();
      });
    },
    async updateStock() {
  try {
    const token = localStorage.getItem("adminToken");
    console.log("Gửi yêu cầu cập nhật:", {
      id: this.selectedProduct._id,
      quantity: this.selectedProduct.newQuantity,
    });

    await axios.put(
      `http://localhost:5000/api/admin/inventory/${this.selectedProduct._id}`,
      { stock: this.selectedProduct.newQuantity },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    this.fetchProducts();
    this.modalInstance.hide();
  } catch (error) {
    console.error("Lỗi cập nhật số lượng:", error.response?.data || error);
  }
},
  },
};
</script>

<style scoped>
.container-xl {
  max-width: 1000px;
}
</style>