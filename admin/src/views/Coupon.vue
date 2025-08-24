<template>
  <AdminLayout>
  <div class="coupon-container">
    <div class="container mt-4">
      <h2 class="text-center fw-bold pb-3" style="color: #E04338">QUẢN LÝ MÃ GIẢM GIÁ</h2>
      <button class="btn btn-success mb-3" @click="openModal(null)">Thêm mã giảm giá</button>

      <div class="table-responsive">
          <table class="table modern-table align-middle text-center">
            <thead>
              <tr>
                <th>STT</th>
                <th>Mã</th>
                <th>Giảm giá</th>
                <th>Loại</th>
                <th>Đơn tối thiểu</th>
                <th>Số lượt dùng tối đa</th>
                <th>Đã dùng</th>
                <th>Hạn sử dụng</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(coupon, index) in coupons" :key="coupon._id">
                <td>{{ index + 1 }}</td>
                <td class="fw-bold">{{ coupon.code }}</td>
                <td>
                  {{ coupon.discountValue }}
                  {{ coupon.discountType === "percentage" ? "%" : "VNĐ" }}
                </td>
                <td>
                  {{ coupon.discountType === "percentage" ? "Phần trăm" : "Số tiền" }}
                </td>
                <td>{{ coupon.minOrderValue?.toLocaleString() || 0 }} đ</td>
                <td>{{ coupon.maxUses }}</td>
                <td>
                  <span v-if="coupon.usedCount >= coupon.maxUses" class="text-danger">Hết lượt</span>
                  <span v-else>{{ coupon.usedCount }}</span>
                </td>
                <td>
                  <span v-if="new Date(coupon.expiryDate) < new Date()" class="text-danger">Hết hạn</span>
                  <span v-else>{{ new Date(coupon.expiryDate).toLocaleDateString() }}</span>
                </td>
                <td>
                  <button class="btn btn-warning btn-sm me-2" @click="openModal(coupon)">Sửa</button>
                  <button class="btn btn-danger btn-sm" @click="deleteCoupon(coupon._id)">Xóa</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      <!-- Modal Thêm/Sửa -->
      <div class="modal fade" id="couponModal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{ editMode ? "Sửa mã giảm giá" : "Thêm mã giảm giá" }}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <input v-model="couponData.code" class="form-control mb-2" placeholder="Mã giảm giá" />
              <input
                v-model.number="couponData.minOrderValue"
                class="form-control mb-2"
                placeholder="Đơn tối thiểu áp dụng (VNĐ)"
                type="number"
              />
              <input
                v-model.number="couponData.discountValue"
                class="form-control mb-2"
                placeholder="Giá trị giảm"
                type="number"
              />

              <select v-model="couponData.discountType" class="form-control mb-2">
                <option value="percentage">Phần trăm (%)</option>
                <option value="amount">Số tiền cố định (VNĐ)</option>
              </select>

              <input
                v-model.number="couponData.maxUses"
                class="form-control mb-2"
                placeholder="Số lượt dùng tối đa"
                type="number"
              />

              <input type="date" v-model="couponData.expiryDate" class="form-control mb-2" :min="today"/>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
              <button class="btn btn-primary" @click="saveCoupon">
                {{ editMode ? "Cập nhật" : "Thêm" }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  </AdminLayout>
</template>

<script>
import axios from "axios"
import { Modal } from "bootstrap"
import AdminLayout from "../components/AdminLayout.vue"

export default {
  components: {
    AdminLayout
  },
  data() {
    return {
      coupons: [],
      couponData: {
        code: "",
        discountValue: "",
        discountType: "percentage",
        maxUses: "",
        expiryDate: "",
      },
      editMode: false,
      modalInstance: null,
      today: new Date().toISOString().split("T")[0],
    }
  },
  mounted() {
    this.fetchCoupons()
    this.$nextTick(() => {
      this.modalInstance = new Modal(document.getElementById("couponModal"))
    })
  },
  methods: {
    async fetchCoupons() {
      try {
        const token = localStorage.getItem("adminToken");
        const res = await axios.get("http://localhost:5000/api/admin/coupons/all", {
          headers: { Authorization: `Bearer ${token}` },
        })
        this.coupons = res.data
      } catch (err) {
        console.error("Lỗi tải danh sách mã giảm giá:", err)
      }
    },

    openModal(coupon) {
      if (coupon) {
        this.couponData = {
          code: coupon.code || "",
          discountValue: Number(coupon.discountValue) || 0,
          discountType: coupon.discountType || "percentage",
          maxUses: Number(coupon.maxUses) || 0,
          minOrderValue: Number(coupon.minOrderValue) || 0,
          expiryDate: coupon.expiryDate.split("T")[0],
          _id: coupon._id,
        }
        this.editMode = true
      } else {
        this.couponData = {
          code: "",
          discountValue: 0,
          discountType: "percentage",
          maxUses: 0,
          minOrderValue: 0,
          expiryDate: "",
        }
        this.editMode = false
      }
      this.$nextTick(() => this.modalInstance.show())
    },

    async saveCoupon() {
      if (!this.couponData.code.trim()) return alert("Vui lòng nhập mã giảm giá");
        if (!this.couponData.discountValue || this.couponData.discountValue <= 0)
          return alert("Giá trị giảm phải > 0");
        if (!this.couponData.maxUses || this.couponData.maxUses <= 0)
          return alert("Số lượt dùng tối đa phải > 0");
        if (!this.couponData.expiryDate)
          return alert("Vui lòng chọn hạn sử dụng");
        if (!this.couponData.minOrderValue || this.couponData.minOrderValue < 0)
          return alert("Đơn tối thiểu phải >= 0");
      try {
        const token = localStorage.getItem("adminToken")
        const body = {
          code: this.couponData.code,
          discountValue: this.couponData.discountValue,
          discountType: this.couponData.discountType,
          maxUses: this.couponData.maxUses,
          minOrderValue: this.couponData.minOrderValue,
          expiryDate: new Date(this.couponData.expiryDate).toISOString(),
        }

        if (this.editMode) {
          await axios.put(
            `http://localhost:5000/api/admin/coupons/${this.couponData._id}`,
            body,
            { headers: { Authorization: `Bearer ${token}` } }
          )
        } else {
          await axios.post("http://localhost:5000/api/admin/coupons/create", body, {
            headers: { Authorization: `Bearer ${token}` },
          })
        }

        this.fetchCoupons()
        this.modalInstance.hide()
      } catch (err) {
        console.error("Lỗi lưu mã:", err.response?.data || err)
      }
    },

    async deleteCoupon(id) {
      if (!confirm("Bạn có chắc muốn xóa mã này?")) return
      try {
        const token = localStorage.getItem("adminToken")
        await axios.delete(`http://localhost:5000/api/admin/coupons/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        this.fetchCoupons()
      } catch (err) {
        console.error("Lỗi xóa mã:", err)
      }
    },
  },
}
</script>

<style scoped>
.modern-table {
  border-collapse: collapse; 
}

.modern-table tr {
  border-bottom: 1px solid #cacaca;
  padding: 15px;
}

.modern-table thead tr {
  background-color: #f8f9fa;
}

.modern-table thead th {
  font-weight: bold;
  border: none;
}

.modern-table tbody tr {
  background: #fff;
  box-shadow: 0 2px 5px rgba(101, 101, 101, 0.05);
  border-radius: 8px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.modern-table tbody tr:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.modern-table td {
  border: none;
  padding: 15px;
  vertical-align: middle;
}

.modern-table td {
  padding: 8px 12px; /* giảm padding: 8px trên/dưới, 12px trái/phải */
  line-height: 1.2;  /* khoảng cách giữa các dòng chữ */
  border-bottom: 1px solid #ccc; /* hoặc 2px nếu muốn đường kẻ đậm */
}

.modern-table thead th {
  padding: 8px 12px;
}

</style>
