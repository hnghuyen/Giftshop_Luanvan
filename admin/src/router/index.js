import { createRouter, createWebHistory } from "vue-router";
import Login from "@/views/Login.vue";
import Register from "@/views/Register.vue";
import Home from "@/views/Home.vue"; // 

const routes = [
  { path: "/", redirect: "/login" },
  { path: "/login", name: "login", component: Login },
  { path: "/register", name: "register", component: Register },
  { path: "/home", name: "home", component: Home },
  { path: '/admin/category', name: "category", component: () => import('../views/Category.vue') },
  { path: '/admin/product', name: "product", component: () => import('../views/Product.vue') },
  { path: '/admin/order', name: "order", component: () => import('../views/OrderManagement.vue') },
  { path: '/admin/inventory', name: "inventory", component: () => import('../views/Inventory.vue') },
  { path: '/admin/coupon', name: "coupon", component: () => import('../views/Coupon.vue') },
  { path: '/admin/revenue', name: "revenue", component: () => import('../views/Revenue.vue') },
  { path: '/admin/user', name: "users", component: () => import('../views/UserManagement.vue') },
  {
    path: '/admin/orders/:id',
    name: 'OrderDetail',
    component: () => import('@/views/OrderDetail.vue'),
    meta: { requiresAdmin: true }
  },
  
  {
    path: '/admin/reviews',
    name: 'review',
    component: () => import('@/views/Review.vue'),
    meta: { requiresAdmin: true }
  }

];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
