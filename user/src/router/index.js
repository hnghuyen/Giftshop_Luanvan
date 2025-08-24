import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/views/Home.vue';
import HomeUser from '@/views/HomeUser.vue';
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import ProductDetail from '@/views/ProductDetail.vue'
import ProductList from '@/views/ProductList.vue';
import AboutView from '../views/AboutView.vue';
import UserProfile from '../views/UserProfile.vue'
import CartView from '@/views/CartView.vue';
import OrderDetail from '@/views/OrderDetail.vue';
import OrderList from '@/views/OrderList.vue';
import CheckoutView from '@/views/CheckoutView.vue';
import MyDesign from '@/views/MyDesign.vue';
import SupportView from '../views/SupportView.vue';
import Return from '../views/Return.vue';

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/home', name: 'HomeUser', component: HomeUser },
  { path: '/support', name: 'SupportView', component: SupportView },
  { path: '/login', name: 'Login', component: LoginView },
  { path: '/register', name: 'Register', component: RegisterView },
  { path: '/product/:id', name: 'ProductDetail', component: ProductDetail},
  { path: '/products', name: 'ProductList', component: ProductList},
  { path: '/about', name: 'About', component: AboutView},
  { path: '/return', name: 'Return', component: Return},
  { path: '/profile', name: 'UserProfile', component: UserProfile },
  { path: '/cart', name: 'Cart', component: CartView },
  { path: '/orders/:id', name: 'OrderDetail', component: OrderDetail, meta: { requiresAuth: true } },
  { path: '/orders', name: 'OrderList', component: OrderList, meta: { requiresAuth: true } },
  { path: '/checkout', name: 'Checkout', component: CheckoutView, meta: { requiresAuth: true } },
  { path: '/my-design', name: 'MyDesign', component: MyDesign, meta: { requiresAuth: true } },
  {path: '/search', name: 'SearchResult', component: () => import('@/views/SearchResult.vue'),}

  
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});


export default router;



