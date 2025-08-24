<template>
  <AdminLayout>
    <div class="container-xl py-3">

      <!-- Header + Filter -->
      <div class="d-flex justify-content-between align-items-center flex-wrap mb-3">
        <!-- Tiêu đề -->
        <h2 class="fw-bold mb-0" style="color: #E04338;">QUẢN LÝ SẢN PHẨM</h2>

        <!-- Thanh tìm kiếm + lọc -->
        <div class="d-flex gap-2 mt-2 mt-md-0">
          <input
            type="text"
            v-model="searchQuery"
            @input="fetchData(1)"
            class="form-control filter-input"
            placeholder="Tìm theo tên sản phẩm..."
          />
          <select
            class="form-select filter-input"
            v-model="selectedCategory"
            @change="fetchData(1)"
          >
            <option value="">Tất cả danh mục</option>
            <option v-for="c in categories" :key="c._id" :value="c._id">{{ c.name }}</option>
          </select>
        </div>
      </div>

      <!-- Nút thêm sản phẩm -->
      <div class="d-flex justify-content-end mb-3">
        <button class="btn btn-success" data-bs-toggle="modal" data-bs-target="#productModal" @click="openAddModal">
          Thêm sản phẩm
        </button>
      </div>

      <!-- Table sản phẩm -->
      <div class="table-responsive shadow-sm rounded">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light text-center">
            <tr>
              <th style="width:5%">STT</th>
              <th style="width:10%">ẢNH</th>
              <th style="width:15%">TÊN</th>
              <th style="width:10%">GIÁ</th>
              <th style="width:15%">MÔ TẢ</th>
              <th style="width:12%">DANH MỤC</th>
              <th style="width:8%">SỐ LƯỢNG</th>
              <th style="width:15%">HÀNH ĐỘNG</th>
              <th style="width:10%">TRẠNG THÁI</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(product, index) in products" :key="product._id">
              <td class="text-center">{{ index + 1 }}</td>
              <td>
                <img 
                  v-if="product.images?.length"
                  :src="`http://localhost:5000${product.images[0]}`"
                  alt="Ảnh"
                  width="60"
                  class="rounded border"
                />
              </td>
              <td>{{ product.name }}</td>
              <td>{{ formatCurrency(product.price) }}</td>
              <td :title="product.description">
                {{ product.description.length > 50
                  ? product.description.slice(0,50) + '...'
                  : product.description }}
              </td>
              <td>{{ product.category?.name || "Không rõ" }}</td>
              <td>{{ product.stock }}</td>
              <td class="text-center align-middle">
                <div class="d-flex gap-1 justify-content-center">
                  <button class="btn btn-primary btn-sm" @click="openEditModal(product)">Sửa</button>
                  <button class="btn btn-success btn-sm" @click="openDesignModal(product._id)">Tạo thiết kế</button>
                  <button v-if="product.isActive" class="btn btn-danger btn-sm" @click="hideProduct(product._id)">Ẩn</button>
                  <button v-else class="btn btn-warning btn-sm" @click="restoreProduct(product._id)">Khôi phục</button>
                </div>
              </td>

              <td class="text-center">
                <span :class="product.isActive ? 'badge bg-success' : 'badge bg-secondary'">
                  {{ product.isActive ? 'Hiển thị' : 'Đã ẩn' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <nav v-if="totalPages > 1" class="mt-3">
        <ul class="pagination justify-content-center">
          <li class="page-item" :class="{ disabled: page===1 }">
            <button class="page-link" @click="page--; fetchData(page)">Trước</button>
          </li>
          <li v-for="p in totalPages" :key="p" class="page-item" :class="{ active: page===p }">
            <button class="page-link" @click="page=p; fetchData(page)">{{ p }}</button>
          </li>
          <li class="page-item" :class="{ disabled: page===totalPages }">
            <button class="page-link" @click="page++; fetchData(page)">Sau</button>
          </li>
        </ul>
      </nav>

      <!-- Modal Thêm/Chỉnh sửa sản phẩm -->
      <div class="modal fade" id="productModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{ isEditing ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm" }}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>

            <div class="modal-body">
              <div class="row">

                <div class="col-md-7">
                  <input v-model="productName" class="form-control mb-3" placeholder="Tên sản phẩm" />
                  <input v-model="productPrice" type="number" class="form-control mb-3" placeholder="Giá sản phẩm" />
                  <textarea v-model="productDescription" class="form-control mb-3" placeholder="Mô tả"></textarea>

                  <select
                    class="form-control mb-3 text-dark"
                    v-model="productCategory"
                    style="background-color: #f8d7da;"
                  >
                    <option value="" disabled>Chọn danh mục</option>
                    <option v-for="category in categories" :key="category._id" :value="category._id">
                      {{ category.name }}
                    </option>
                  </select>

                  <input v-model="productStock" type="number" class="form-control mb-3" placeholder="Số lượng" />
                </div>

                <div class="col-md-5 d-flex flex-column align-items-center justify-content-start">
                  <label
                    class="border border-2 border-dashed rounded p-5 w-100 text-center text-muted mb-3"
                    style="cursor: pointer;"
                  >
                    <div><i class="bi bi-cloud-upload fs-1"></i></div>
                    <div>Tải ảnh lên</div>
                    <input
                      type="file"
                      class="d-none"
                      multiple
                      @change="uploadImages"
                    />
                  </label>

                  <!-- Preview nhiều ảnh -->
                  <div v-if="productImages.length" class="d-flex flex-wrap gap-2">
                    <div 
                      v-for="(img, i) in productImages" 
                      :key="i" 
                      class="position-relative"
                      style="display: inline-block;"
                    >
                      <img 
                        :src="`http://localhost:5000${img}`" 
                        alt="Ảnh sản phẩm" 
                        class="img-fluid rounded border" 
                        style="max-height: 120px;"
                      />
                      <button 
                        type="button"
                        @click="removeImage(i)" 
                        class="btn btn-sm btn-danger position-absolute top-0 end-0"
                        style="border-radius:50%; padding:2px 6px;"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <div class="modal-footer">
              <button class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
              <button class="btn btn-primary" @click="isEditing ? updateProduct() : addProduct()">
                {{ isEditing ? "Cập nhật" : "Thêm" }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Tạo Thiết Kế -->
      <div class="modal fade" id="designModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Thiết kế tùy chọn sản phẩm</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <AdminProductOptions v-if="selectedProductId" :productId="selectedProductId" />
            </div>
          </div>
        </div>
      </div>

    </div>
  </AdminLayout>
</template>

<style scoped>
.filter-input {
  min-width: 140px;
  max-width: 220px;
  height: 36px;
  font-size: 0.875rem;
}
.table-responsive {
  background: #fff;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}
.table-hover tbody tr:hover {
  background-color: #fefefe;
}
.table tbody tr {
  vertical-align: middle; 
}

td .d-flex {
  flex-wrap: nowrap; /* nút không xuống dòng */
  align-items: center; /* canh giữa theo chiều dọc */
}
.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
}

</style>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import * as bootstrap from 'bootstrap';
import AdminProductOptions from '../components/AdminProductOptions.vue';
import AdminLayout from '../components/AdminLayout.vue';

const page = ref(1);
const limit = 10;
const totalPages = ref(1);


// Dữ liệu
const products = ref([]);
const categories = ref([]);
const selectedProductId = ref(null);
const searchQuery = ref("");        // từ khóa tìm kiếm
const selectedCategory = ref("");

const productName = ref("");
const productPrice = ref("");
const productDescription = ref("");
const productImages = ref([]);
const productCategory = ref("");
const productStock = ref("");
const isEditing = ref(false);
const editingId = ref(null);

// Mở modal để thêm mới
const openAddModal = () => {
  isEditing.value = false;
  resetForm();
};

// Mở modal để chỉnh sửa
const openEditModal = (product) => {
  isEditing.value = true;
  editingId.value = product._id;
  productName.value = product.name;
  productPrice.value = product.price;
  productDescription.value = product.description;
  productImages.value = product.images;
  productCategory.value = product.category?._id || "";
  productStock.value = product.stock;

  // Mở modal thủ công
  const modal = new bootstrap.Modal(document.getElementById("productModal"));
  modal.show();
};

const formatCurrency = (val) => {
  if (!val && val !== 0) return '0 đ'
  return Number(val).toLocaleString('vi-VN') + ' đ'
}

const removeImage = (index) => {
  productImages.value.splice(index, 1);
};

// Upload ảnh
const uploadImages = async (event) => {
  const files = event.target.files;
  if (!files || files.length === 0) return;

  const formData = new FormData();
  for (let i = 0; i < files.length; i++) {
    formData.append("images", files[i]); // field name backend nhận
  }

  try {
    const res = await axios.post(
      "http://localhost:5000/api/admin/products/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      }
    );
    if (Array.isArray(res.data.imageUrls)) {
      productImages.value = [...productImages.value, ...res.data.imageUrls]; 
    }
  } catch (err) {
    console.error("Lỗi upload ảnh:", err);
  }
};

// Thêm sản phẩm
const addProduct = async () => {
  try {
    const res = await axios.post(
      "http://localhost:5000/api/admin/products",
      {
        name: productName.value,
        price: productPrice.value,
        description: productDescription.value,
        images: productImages.value,
        category: productCategory.value,
        stock: productStock.value,
      },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
      }
    );
    products.value.push(res.data.product);
    resetForm();
    hideModal();
    alert("Thêm thành công!");
  } catch (err) {
    console.error("Lỗi khi thêm:", err);
  }
};

// Cập nhật sản phẩm
const updateProduct = async () => {
  try {
    const res = await axios.put(
      `http://localhost:5000/api/admin/products/${editingId.value}`,
      {
        name: productName.value,
        price: productPrice.value,
        description: productDescription.value,
        images: productImages.value,
        category: productCategory.value,
        stock: productStock.value,
      },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
      }
    );

    const index = products.value.findIndex((p) => p._id === editingId.value);
    if (index !== -1) {
      products.value[index] = res.data.product;
    }
    resetForm();
    hideModal();
    alert("Cập nhật thành công!");
  } catch (err) {
    console.error("Lỗi khi cập nhật:", err);
  }
};

const hideProduct = async (id) => {
  if (!confirm("Xác nhận ẩn sản phẩm này?")) return;
  try {
    await axios.patch(`http://localhost:5000/api/admin/products/${id}/hide`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
    });

    const product = products.value.find((p) => p._id === id);
    if (product) product.isActive = false;
  } catch (err) {
    console.error("Lỗi ẩn sản phẩm:", err);
  }
};

const restoreProduct = async (id) => {
  try {
    await axios.patch(`http://localhost:5000/api/admin/products/${id}/restore`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
    });

    const product = products.value.find((p) => p._id === id);
    if (product) product.isActive = true; // 👈 set lại trạng thái
  } catch (err) {
    console.error("Lỗi khôi phục sản phẩm:", err);
  }
};


// Reset form
const resetForm = () => {
  productName.value = "";
  productPrice.value = "";
  productDescription.value = "";
  productImages.value = "";
  productCategory.value = "";
  productStock.value = "";
  editingId.value = null;
  isEditing.value = false;
};

const hideModal = () => {
  const modalEl = document.getElementById("productModal");
  const modalInstance = bootstrap.Modal.getInstance(modalEl);
  if (modalInstance) modalInstance.hide();

  setTimeout(() => {
    if (document.activeElement) {
      document.activeElement.blur();
    }
  }, 10); 
};

const openDesignModal = (id) => {
  selectedProductId.value = id;
  const modal = new bootstrap.Modal(document.getElementById("designModal"));
  modal.show();
};
// Load dữ liệu ban đầu

const fetchData = async (p = page.value) => {
  try {
    const params = {
      page: p,
      limit,
      search: searchQuery.value,      // từ khóa tìm kiếm
      category: selectedCategory.value // lọc danh mục
    };

    const [resProd, resCate] = await Promise.all([
      axios.get("http://localhost:5000/api/admin/products", {
        headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
        params,  // gửi params vào query string
      }),
      axios.get("http://localhost:5000/api/admin/categories", {
        headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
      }),
    ]);

    products.value = resProd.data.products;
    page.value = resProd.data.page;
    totalPages.value = resProd.data.totalPages;
    categories.value = resCate.data;
  } catch (err) {
    console.error("Lỗi tải dữ liệu:", err);
  }
};


onMounted(fetchData);
</script>


