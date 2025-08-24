router.beforeEach((to, from, next) => {
    const user = JSON.parse(localStorage.getItem('user')) // hoặc từ Pinia store
  
    if (to.path.startsWith('/admin') && (!user || user.role !== 'admin')) {
      next('/login') // chặn nếu không phải admin
    } else {
      next()
    }
  })
  