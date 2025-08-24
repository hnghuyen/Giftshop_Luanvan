<template>
  <AdminLayout>
    <div class="mt-2 px-3">
      <div class="mx-auto" style="max-width: 1100px;">
        <h2 class="text-center fw-bold pb-3" style="color: #E04338;">QUẢN LÝ DANH MỤC</h2>

        <div class="row justify-content-center g-4">
          <!-- Cột trái: Bảng danh mục -->
          <div class="col-md-7">
            <table class="table table-bordered mt-3">
              <thead>
                <tr class="text-center">
                  <th>STT</th>
                  <th>TÊN DANH MỤC</th>
                  <th>HÀNH ĐỘNG</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(category, index) in categories" :key="category._id">
                  <td>{{ index + 1 }}</td>
                  <td>{{ category.name || "Không có tên" }}</td>
                  <td>
                    <button class="btn btn-primary btn-sm me-2" @click="editCategory(category)">Sửa</button>
                    <button class="btn btn-danger btn-sm" @click="deleteCategory(category._id)">Xóa</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Cột phải: Form -->
          <div class="col-md-5">
            <div class="card p-3">
              <h5 class="text-center">{{ isEditing ? 'Chỉnh sửa danh mục' : 'Thêm danh mục' }}</h5>
              <input type="text" class="form-control mb-2" v-model="categoryName" placeholder="Nhập tên danh mục" required>
              <button class="btn btn-primary" @click="isEditing ? updateCategory() : addCategory()">
                {{ isEditing ? 'Cập nhật' : 'Thêm' }}
              </button>
              <button v-if="isEditing" class="btn btn-secondary mt-3" @click="cancelEdit">Hủy</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

  
  <script>
import axios from "axios";
import AdminLayout from '../components/AdminLayout.vue'

export default {
  components: {
    AdminLayout,
  },
  data() {
    return {
      categories: [],
      categoryName: "",
      isEditing: false,
      editingId: null,
      errorMessage: "",
    };
  },
  mounted() {
    this.fetchCategories(); // Tự động lấy danh mục khi vào trang
  },
  methods: {
    // Lấy danh sách danh mục từ backend
    async fetchCategories() {
      console.log("Bắt đầu lấy danh mục...");

      try {
        const token = localStorage.getItem("adminToken"); // Lấy token từ localStorage

        const response = await axios.get("http://localhost:5000/api/admin/categories", {
          headers: {
            Authorization: `Bearer ${token}`, // Gửi token trong request
          },
        });

        console.log("Danh mục:", response.data);
        this.categories = response.data;
      } catch (error) {
        console.error("Lỗi khi lấy danh mục:", error);
      }
    },


// Thêm danh mục
async addCategory() {
    if (this.categoryName.trim()) {
        try {
            const adminToken = localStorage.getItem("adminToken"); // Lấy token từ localStorage
            const response = await axios.post(
                "http://localhost:5000/api/admin/categories",
                { name: this.categoryName },
                {
                    headers: {
                        Authorization: `Bearer ${adminToken}`
                    },
                }
            );

            // Cập nhật danh sách mà không cần reload
            this.categories.push(response.data);

            // Hiển thị thông báo thêm thành công
            alert("Thêm danh mục thành công!");

            // Xóa input sau khi thêm thành công
            this.categoryName = "";
        } catch (error) {
            console.error("Lỗi khi thêm danh mục:", error);
            alert("Lỗi khi thêm danh mục!");
        }
    } else {
        alert("Tên danh mục không được để trống!");
    }
},



    // Chỉnh sửa danh mục
    editCategory(category) {
      this.isEditing = true;
      this.categoryName = category.name;
      this.editingId = category._id; // Lưu ID thực của MongoDB
    },

    // Cập nhật danh mục
    async updateCategory() {
      if (this.editingId) {
        try {
          const adminToken = localStorage.getItem("adminToken");
          await axios.put(`http://localhost:5000/api/admin/categories/${this.editingId}`, {
            name: this.categoryName,
          },
          {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("adminToken")}`
                },
                }
        );
          this.fetchCategories(); // Load lại danh sách
          this.cancelEdit();
        } catch (error) {
          console.error("Lỗi khi cập nhật danh mục:", error);
        }
      }
    },

    async deleteCategory(id) {
      if (!id) {
        console.error("Lỗi: ID danh mục không hợp lệ");
        alert("Lỗi: ID danh mục không hợp lệ!");
        return;
      }

      if (!confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
        return;
      }

      try {
        const adminToken = localStorage.getItem("adminToken");

        await axios.delete(`http://localhost:5000/api/admin/categories/${id}`, {
          headers: { Authorization: `Bearer ${adminToken}` },
        });

        // Cập nhật danh sách sau khi xóa thành công
        this.categories = this.categories.filter(category => category._id !== id);

        alert("Xóa danh mục thành công!");
      } catch (error) {
        console.error("Lỗi khi xóa danh mục:", error);

        if (error.response && error.response.data && error.response.data.message) {
          alert(error.response.data.message); // Hiện đúng thông báo từ backend
        } else {
          alert("Xóa danh mục thất bại!");
        }
      }
    },

    // Hủy chỉnh sửa
    cancelEdit() {
      this.isEditing = false;
      this.categoryName = "";
      this.editingId = null;
    }
  }
};
</script>

  
  <style>
  .container {
    max-width: 800px;
  }
  .cate-container {
  background: url('@/assets/bg2.jpg') no-repeat center center/cover;
  height: 100vh;
  width: 100vw;
  display: flex;
}
  </style>
  