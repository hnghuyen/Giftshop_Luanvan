<template>
  <footer class="text-white text-center text-md-start py-4 mt-5" style="background-color: #D46A62; font-family: 'Nunito', sans-serif;">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-5 mb-3">
          <p class="mb-1 fw-semibold">LIÊN HỆ:</p>
          <p class="mb-0"><a href="mailto:giftyhouse@com.vn" class="text-white fw-semibold text-decoration-none">giftyhouse@giftyhouse.vn</a></p>
          <p class="mb-0"> 0123 456 789</p>
          <p class="mb-0">123 Gifty Street, TP.HCM</p>
        </div>

        <div class="col-md-5 mb-3">
          <p class="mb-1 fw-semibold">THÔNG TIN:</p>
          <p class="mb-0">
            <router-link to="/return" class="text-white text-decoration-none">Chính sách đổi trả</router-link>
          </p>
          <p class="mb-0">
            <router-link to="/support" class="text-white text-decoration-none">Hỗ trợ</router-link>
          </p>
        </div>
      </div>

      <div class="text-center mt-4">
        <p class="mb-0 fw-bold">© 2025 GIFTY HOUSE. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>

  
<script>
  export default {
    name: "Footer",
  };
</script>
  
  <style scoped>
  footer {
    position: relative;
    bottom: 0;
    width: 100%;
  }
  </style>
  