import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:5000/api',
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('userToken'); 
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      // User bị khóa
      localStorage.removeItem('userToken');    // xóa token
      alert('Tài khoản của bạn đã bị khóa!');
      window.location.href = '/login';         // chuyển về trang login
    }
    return Promise.reject(error);
  }
);

export default instance;
