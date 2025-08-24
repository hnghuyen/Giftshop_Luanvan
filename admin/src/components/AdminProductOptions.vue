<template>
  <div>

    <!-- form thêm option -->
    <div class="card p-3 mb-4">
      <h5>Thêm option mới</h5>
      <div class="mb-2">
        <input v-model="newOption.name" placeholder="Tên option (vd: Chọn màu)" class="form-control" />
      </div>

      <div class="mb-2">
        <label>Loại</label>
        <select v-model="newOption.type" class="form-control">
          <option value="select">Chọn thường (select)</option>
          <!-- <option value="image-select">Chọn ảnh (image-select)</option> -->
          <option value="text">Nhập chữ (text)</option>
        </select>
      </div>

      <div v-if="newOption.type === 'text'" class="mb-2">
        <input 
          v-model.number="newOption.extraPricePerChar" 
          type="number" 
          class="form-control" 
          placeholder="Giá mỗi ký tự" 
        />
        <input 
          v-model.number="newOption.maxLength" 
          type="number" 
          class="form-control mt-2" 
          placeholder="Số ký tự tối đa"
          min="1"
        />
      </div>

      <!-- Nếu là select/image-select -->
      <div v-if="newOption.type !== 'text'" class="mb-2">
        <h6>Lựa chọn</h6>
        <div v-for="(choice, index) in newOption.choices" :key="index" class="d-flex gap-2 mb-2">
          <input v-model="choice.label" placeholder="Tên hiển thị" class="form-control" />
          <input v-model="choice.value" placeholder="Giá trị" class="form-control" />
          <input v-model.number="choice.extraPrice" type="number" placeholder="+ Giá" class="form-control" />
          <button class="btn btn-danger btn-sm" @click="removeChoice(index)">X</button>
        </div>
        <button class="btn btn-secondary btn-sm" @click="addChoice">+ Thêm lựa chọn</button>
      </div>

      <button class="btn btn-success mt-3" style="width: 50%;" @click="submitNewOption">
        {{ editingIndex !== null ? 'Lưu option' : 'Thêm option' }}
      </button>

    </div>

    <!-- Danh sách options hiện tại -->
    <div v-if="options.length">
      <h5>Danh sách tuỳ chọn hiện tại</h5>
      <ul class="list-group">
        <li v-for="(option, index) in options" :key="index" class="list-group-item d-flex justify-content-between align-items-center">
          <div>
            <strong>{{ option.name }}</strong> - <em>{{ option.type }}</em>
          </div>
          <div class="d-flex gap-2">
            <button class="btn btn-primary btn-sm" @click="editOption(index)">Sửa</button>
            <!-- <button class="btn btn-danger btn-sm" @click="deleteOption(index)">Xoá</button> -->
          </div>
        </li>
      </ul>
    </div>
    <div v-else class="text-muted">Chưa có tuỳ chọn nào.</div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'AdminProductOptions',
  props: {
    productId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      options: [],
      editingIndex: null,
      newOption: {
        name: '',
        type: 'select',
        required: false,
        extraPricePerChar: 0,
        choices: [],
        maxLength: 0,
      }
    };
  },
  watch: {
  productId: {
    immediate: true, // chạy luôn lần đầu
    handler(newId) {
      if (newId) {
        this.fetchOptions();
      }
    }
  }
},
  methods: {
    getAuthHeader() {
      const token = localStorage.getItem('adminToken');
      return {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
    },

    async fetchOptions() {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/admin/products/${this.productId}/options`,
          this.getAuthHeader()
        );
        this.options = res.data.options;
      } catch (err) {
        console.error("Lỗi khi lấy options:", err);
      }
    },

    addChoice() {
      this.newOption.choices.push({ label: '', value: '', extraPrice: 0 });
    },

    editOption(index) {
      this.editingIndex = index;
      const option = this.options[index];
      this.newOption = {
        name: option.name,
        type: option.type,
        required: option.required,
        extraPricePerChar: option.extraPricePerChar || 0,
        maxLength: option.maxLength || 0,
        choices: option.choices ? JSON.parse(JSON.stringify(option.choices)) : []
      };
    },


    removeChoice(index) {
      this.newOption.choices.splice(index, 1);
    },

    async submitNewOption() {
      try {
        if (this.editingIndex !== null) {
          // đang chỉnh sửa
          const res = await axios.put(
            `http://localhost:5000/api/admin/products/${this.productId}/options/${this.editingIndex}`,
            this.newOption,
            this.getAuthHeader()
          );
          this.options = res.data.options;
          this.editingIndex = null;
        } else {
          // thêm mới
          const res = await axios.post(
            `http://localhost:5000/api/admin/products/${this.productId}/options`,
            this.newOption,
            this.getAuthHeader()
          );
          this.options = res.data.options;
        }
        this.resetForm();
      } catch (err) {
        console.error("Lỗi khi lưu option:", err);
        alert("Lưu option thất bại");
      }
    },

    async deleteOption(index) {
      if (!confirm("Bạn chắc chắn muốn xoá option này?")) return;

      try {
        const res = await axios.delete(
          `http://localhost:5000/api/admin/products/${this.productId}/options/${index}`,
          this.getAuthHeader()
        );
        this.options = res.data.options;
      } catch (err) {
        console.error("Lỗi khi xoá option:", err);
        alert("Xoá thất bại");
      }
    },

    resetForm() {
      this.newOption = {
        name: '',
        type: 'select',
        required: false,
        extraPricePerChar: 0,
        choices: []
      };
    }
  },
  mounted() {
    this.fetchOptions();
  }
};
</script>


<style scoped>
input {
  min-width: 0;
}
</style>
