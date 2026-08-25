# 🟢 TAHAP 3: Frontend Web (Vue.js 3 + Pinia)

> **Status**: BELUM DIMULAI
> **Goal**: Membangun antarmuka web yang modern, bersih, dan responsif dengan tema hijau-putih
> **Tech Stack**: Vue.js 3, Pinia (state management), Vue Router, Axios, Lucide Icons

---

## 🎨 Tema & Design System

### Palet Warna

| Nama | Kode | Kegunaan |
|------|------|----------|
| **Green Primary** | `#22c55e` | Tombol utama, aksen, navbar |
| **Green Dark** | `#16a34a` | Hover state, tombol aktif |
| **Green Light** | `#f0fdf4` | Background card, subtle highlight |
| **Green Border** | `#bbf7d0` | Border card, input focus |
| **White** | `#ffffff` | Background utama |
| **Gray 50** | `#f9fafb` | Background sidebar |
| **Gray 100** | `#f3f4f6` | Background alternatif |
| **Gray 300** | `#d1d5db` | Border, divider |
| **Gray 500** | `#6b7280` | Teks sekunder, placeholder |
| **Gray 700** | `#374151` | Teks utama |
| **Gray 900** | `#111827` | Judul, teks tebal |
| **Red** | `#ef4444` | Error, hapus, expense |
| **Yellow** | `#eab308` | Warning |

### Prinsip Design
1. **Clean & Minimalis** — Gunakan banyak whitespace, hindari elemen berlebih
2. **Konsisten** — Semua card, button, input punya style yang sama
3. **Icon Separuh** — Pakai icon untuk navigasi dan aksi utama, jangan berlebihan
4. **Responsif** — Tampilan baik di desktop dan mobile

---

## 📋 Struktur Folder Frontend

```
frontend/
├── public/
│   └── favicon.ico
├── src/
│   ├── assets/
│   │   └── styles.css          # CSS global & theme
│   ├── components/
│   │   ├── Sidebar.vue         # Sidebar navigasi
│   │   ├── Navbar.vue          # Navbar atas
│   │   ├── Modal.vue           # Modal dialog reusable
│   │   ├── LoadingSpinner.vue  # Loading indicator
│   │   └── AlertMessage.vue    # Notifikasi sukses/error
│   ├── views/
│   │   ├── Login.vue           # Halaman Login
│   │   ├── Register.vue        # Halaman Register
│   │   ├── Dashboard.vue       # Dashboard utama
│   │   ├── Transactions.vue    # Halaman Transaksi
│   │   ├── Categories.vue      # Halaman Kategori
│   │   └── Budgets.vue         # Halaman Budget
│   ├── stores/
│   │   ├── auth.js             # State autentikasi
│   │   ├── transactions.js     # State transaksi
│   │   ├── categories.js       # State kategori
│   │   └── budgets.js          # State budget
│   ├── services/
│   │   └── api.js              # Axios instance & interceptors
│   ├── router/
│   │   └── index.js            # Vue Router config
│   ├── App.vue                 # Root component
│   └── main.js                 # Entry point
├── index.html
├── package.json
└── vite.config.js
```

---

## 🔧 TAHAP 3.1: Setup Project

### Langkah 1: Buat Project Vue Baru

```bash
npm create vite@latest frontend -- --template vue
cd frontend
npm install
```

### Langkah 2: Install Dependencies

```bash
npm install vue-router@4 pinia axios lucide-vue-next
```

| Package | Fungsi |
|---------|--------|
| `vue-router@4` | Navigasi antar halaman |
| `pinia` | State management (ganti Vuex) |
| `axios` | HTTP client untuk panggil API |
| `lucide-vue-next` | Icon library (ringan & modern) |

### Langkah 3: Update `vite.config.js`

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
})
```

> **Penjelasan**: Proxy digunakan agar frontend (port 3000) bisa panggil backend (port 5000) tanpa CORS issue. Saat dev, cukup panggil `/api/...` dan Vite akan forward ke backend.

### Langkah 4: Update `package.json` Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

---

## 🛣️ TAHAP 3.2: Router (Navigasi)

### Buat `src/router/index.js`

```javascript
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Dashboard from '../views/Dashboard.vue'
import Transactions from '../views/Transactions.vue'
import Categories from '../views/Categories.vue'
import Budgets from '../views/Budgets.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { requiresGuest: true }
  },
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/transactions',
    name: 'Transactions',
    component: Transactions,
    meta: { requiresAuth: true }
  },
  {
    path: '/categories',
    name: 'Categories',
    component: Categories,
    meta: { requiresAuth: true }
  },
  {
    path: '/budgets',
    name: 'Budgets',
    component: Budgets,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation Guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    next('/login')
  } else if (to.meta.requiresGuest && authStore.isLoggedIn) {
    next('/')
  } else {
    next()
  }
})

export default router
```

> **Penjelasan**:
> - `meta: { requiresAuth: true }` — Halaman ini hanya bisa diakses jika sudah login
> - `meta: { requiresGuest: true }` — Halaman ini hanya bisa diakses jika BELUM login (login & register)
> - `beforeEach` — Cek setiap navigasi, redirect ke `/login` jika belum login

---

<!-- Pengerjaan kita dari isi -->
## 🗃️ TAHAP 3.3: State Management (Pinia Stores)

### 1. Auth Store — `src/stores/auth.js`

```javascript
import { defineStore } from 'pinia'
import api from '../services/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    currentUser: (state) => state.user
  },

  actions: {
    async register(userData) {
      this.loading = true
      this.error = null
      try {
        const response = await api.post('/api/auth/register', userData)
        return response.data
      } catch (err) {
        this.error = err.response?.data?.message || 'Registrasi gagal'
        throw err
      } finally {
        this.loading = false
      }
    },

    async login(credentials) {
      this.loading = true
      this.error = null
      try {
        const response = await api.post('/api/auth/login', credentials)
        const { token, user } = response.data

        this.token = token
        this.user = user

        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))

        return response.data
      } catch (err) {
        this.error = err.response?.data?.message || 'Login gagal'
        throw err
      } finally {
        this.loading = false
      }
    },

    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }
})
```

### 2. Categories Store — `src/stores/categories.js`

```javascript
import { defineStore } from 'pinia'
import api from '../services/api'

export const useCategoryStore = defineStore('categories', {
  state: () => ({
    categories: [],
    loading: false,
    error: null
  }),

  getters: {
    incomeCategories: (state) => state.categories.filter(c => c.type === 'income'),
    expenseCategories: (state) => state.categories.filter(c => c.type === 'expense'),
    getCategoryById: (state) => (id) => state.categories.find(c => c.id === id)
  },

  actions: {
    async fetchCategories() {
      this.loading = true
      try {
        const response = await api.get('/api/categories')
        this.categories = response.data.categories
      } catch (err) {
        this.error = err.response?.data?.message || 'Gagal memuat kategori'
      } finally {
        this.loading = false
      }
    },

    async addCategory(categoryData) {
      try {
        const response = await api.post('/api/categories', categoryData)
        this.categories.push(response.data.category)
        return response.data
      } catch (err) {
        this.error = err.response?.data?.message || 'Gagal menambahkan kategori'
        throw err
      }
    },

    async deleteCategory(id) {
      try {
        await api.delete(`/api/categories/${id}`)
        this.categories = this.categories.filter(c => c.id !== id)
      } catch (err) {
        this.error = err.response?.data?.message || 'Gagal menghapus kategori'
        throw err
      }
    }
  }
})
```

### 3. Transactions Store — `src/stores/transactions.js`

```javascript
import { defineStore } from 'pinia'
import api from '../services/api'

export const useTransactionStore = defineStore('transactions', {
  state: () => ({
    transactions: [],
    summary: null,
    expenseByCategory: [],
    loading: false,
    error: null
  }),

  getters: {
    totalTransactions: (state) => state.transactions.length
  },

  actions: {
    async fetchTransactions(params = {}) {
      this.loading = true
      try {
        const response = await api.get('/api/transactions', { params })
        this.transactions = response.data.transactions
      } catch (err) {
        this.error = err.response?.data?.message || 'Gagal memuat transaksi'
      } finally {
        this.loading = false
      }
    },

    async addTransaction(transactionData) {
      try {
        const response = await api.post('/api/transactions', transactionData)
        this.transactions.unshift(response.data.transaction)
        return response.data
      } catch (err) {
        this.error = err.response?.data?.message || 'Gagal menambahkan transaksi'
        throw err
      }
    },

    async updateTransaction(id, transactionData) {
      try {
        const response = await api.put(`/api/transactions/${id}`, transactionData)
        const index = this.transactions.findIndex(t => t.id === id)
        if (index !== -1) {
          this.transactions[index] = response.data.transaction
        }
        return response.data
      } catch (err) {
        this.error = err.response?.data?.message || 'Gagal mengupdate transaksi'
        throw err
      }
    },

    async deleteTransaction(id) {
      try {
        await api.delete(`/api/transactions/${id}`)
        this.transactions = this.transactions.filter(t => t.id !== id)
      } catch (err) {
        this.error = err.response?.data?.message || 'Gagal menghapus transaksi'
        throw err
      }
    },

    async fetchSummary(params = {}) {
      try {
        const response = await api.get('/api/transactions/summary', { params })
        this.summary = response.data
      } catch (err) {
        this.error = err.response?.data?.message || 'Gagal memuat ringkasan'
      }
    },

    async fetchExpenseByCategory(params = {}) {
      try {
        const response = await api.get('/api/transactions/summary/category', { params })
        this.expenseByCategory = response.data.categories
      } catch (err) {
        this.error = err.response?.data?.message || 'Gagal memuat data kategori'
      }
    }
  }
})
```

### 4. Budgets Store — `src/stores/budgets.js`

```javascript
import { defineStore } from 'pinia'
import api from '../services/api'

export const useBudgetStore = defineStore('budgets', {
  state: () => ({
    budgets: [],
    loading: false,
    error: null
  }),

  getters: {
    totalBudget: (state) => state.budgets.reduce((sum, b) => sum + parseFloat(b.amount), 0)
  },

  actions: {
    async fetchBudgets(params = {}) {
      this.loading = true
      try {
        const response = await api.get('/api/budgets', { params })
        this.budgets = response.data.budgets
      } catch (err) {
        this.error = err.response?.data?.message || 'Gagal memuat budget'
      } finally {
        this.loading = false
      }
    },

    async addBudget(budgetData) {
      try {
        const response = await api.post('/api/budgets', budgetData)
        this.budgets.push(response.data.budget)
        return response.data
      } catch (err) {
        this.error = err.response?.data?.message || 'Gagal menambahkan budget'
        throw err
      }
    },

    async updateBudget(id, budgetData) {
      try {
        const response = await api.put(`/api/budgets/${id}`, budgetData)
        const index = this.budgets.findIndex(b => b.id === id)
        if (index !== -1) {
          this.budgets[index] = response.data.budget
        }
        return response.data
      } catch (err) {
        this.error = err.response?.data?.message || 'Gagal mengupdate budget'
        throw err
      }
    },

    async deleteBudget(id) {
      try {
        await api.delete(`/api/budgets/${id}`)
        this.budgets = this.budgets.filter(b => b.id !== id)
      } catch (err) {
        this.error = err.response?.data?.message || 'Gagal menghapus budget'
        throw err
      }
    }
  }
})
```

---

## 🌐 TAHAP 3.4: API Service

### Buat `src/services/api.js`

```javascript
import axios from 'axios'

const api = axios.create({
  baseURL: '',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request Interceptor — Otomatis tambahkan token ke setiap request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response Interceptor — Handle error 401 (token expired)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
```

> **Penjelasan**:
> - `baseURL: ''` — Karena sudah pakai proxy di Vite, cukup panggil `/api/...`
> - **Request Interceptor** — Setiap request otomatis pasang header `Authorization: Bearer <token>`
> - **Response Interceptor** — Jika dapat 401 (token expired), otomatis logout & redirect ke login

---

## 🖼️ TAHAP 3.5: Entry Point & Root Component

### Update `src/main.js`

```javascript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './assets/styles.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
```

### Update `src/App.vue`

```vue
<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
</script>

<style>
#app {
  min-height: 100vh;
  background-color: #f9fafb;
}
</style>
```

---

## 📐 TAHAP 3.6: Komponen Layout

### 1. Sidebar — `src/components/Sidebar.vue`

```vue
<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <div class="logo">
        <Wallet class="logo-icon" :size="28" color="#22c55e" />
        <span class="logo-text">CatatanKeu</span>
      </div>
    </div>

    <nav class="sidebar-nav">
      <router-link to="/" class="nav-item" :class="{ active: $route.path === '/' }">
        <LayoutDashboard :size="20" />
        <span>Dashboard</span>
      </router-link>

      <router-link to="/transactions" class="nav-item" :class="{ active: $route.path === '/transactions' }">
        <ArrowLeftRight :size="20" />
        <span>Transaksi</span>
      </router-link>

      <router-link to="/categories" class="nav-item" :class="{ active: $route.path === '/categories' }">
        <Tags :size="20" />
        <span>Kategori</span>
      </router-link>

      <router-link to="/budgets" class="nav-item" :class="{ active: $route.path === '/budgets' }">
        <PiggyBank :size="20" />
        <span>Budget</span>
      </router-link>
    </nav>

    <div class="sidebar-footer">
      <button @click="handleLogout" class="nav-item logout-btn">
        <LogOut :size="20" />
        <span>Keluar</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import {
  Wallet, LayoutDashboard, ArrowLeftRight,
  Tags, PiggyBank, LogOut
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.sidebar {
  width: 250px;
  height: 100vh;
  background: white;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #f3f4f6;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
}

.sidebar-nav {
  flex: 1;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 8px;
  color: #6b7280;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  border: none;
  background: none;
  cursor: pointer;
  width: 100%;
}

.nav-item:hover {
  background: #f0fdf4;
  color: #16a34a;
}

.nav-item.active {
  background: #f0fdf4;
  color: #16a34a;
  font-weight: 600;
}

.sidebar-footer {
  padding: 12px;
  border-top: 1px solid #f3f4f6;
}

.logout-btn:hover {
  background: #fef2f2;
  color: #ef4444;
}
</style>
```

### 2. Navbar — `src/components/Navbar.vue`

```vue
<template>
  <header class="navbar">
    <div class="navbar-left">
      <h1 class="page-title">{{ pageTitle }}</h1>
    </div>
    <div class="navbar-right">
      <div class="user-info">
        <UserCircle :size="20" color="#6b7280" />
        <span class="username">{{ authStore.currentUser?.username }}</span>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { UserCircle } from 'lucide-vue-next'

const route = useRoute()
const authStore = useAuthStore()

const pageTitles = {
  '/': 'Dashboard',
  '/transactions': 'Transaksi',
  '/categories': 'Kategori',
  '/budgets': 'Budget'
}

const pageTitle = computed(() => pageTitles[route.path] || 'Dashboard')
</script>

<style scoped>
.navbar {
  height: 64px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  position: fixed;
  top: 0;
  left: 250px;
  right: 0;
  z-index: 90;
}

.page-title {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.username {
  font-size: 14px;
  color: #374151;
  font-weight: 500;
}
</style>
```

### 3. Main Layout — `src/components/MainLayout.vue`

```vue
<template>
  <div class="layout">
    <Sidebar />
    <div class="main-area">
      <Navbar />
      <main class="content">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import Sidebar from './Sidebar.vue'
import Navbar from './Navbar.vue'
</script>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
}

.main-area {
  flex: 1;
  margin-left: 250px;
}

.content {
  padding: 24px;
  margin-top: 64px;
  max-width: 1200px;
}
</style>
```

### 4. Modal — `src/components/Modal.vue`

```vue
<template>
  <Teleport to="body">
    <div v-if="modelValue" class="modal-overlay" @click.self="close">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">{{ title }}</h3>
          <button @click="close" class="modal-close">
            <X :size="20" />
          </button>
        </div>
        <div class="modal-body">
          <slot />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { X } from 'lucide-vue-next'

const props = defineProps({
  modelValue: Boolean,
  title: String
})

const emit = defineEmits(['update:modelValue'])

const close = () => {
  emit('update:modelValue', false)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #f3f4f6;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.modal-close {
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  padding: 4px;
  border-radius: 6px;
}

.modal-close:hover {
  background: #f3f4f6;
}

.modal-body {
  padding: 24px;
}
</style>
```

### 5. AlertMessage — `src/components/AlertMessage.vue`

```vue
<template>
  <div v-if="show" :class="['alert', type]">
    <component :is="iconComponent" :size="18" />
    <span>{{ message }}</span>
    <button @click="$emit('close')" class="alert-close">
      <X :size="16" />
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { CheckCircle, AlertCircle, X } from 'lucide-vue-next'

const props = defineProps({
  show: Boolean,
  message: String,
  type: {
    type: String,
    default: 'success'
  }
})

defineEmits(['close'])

const iconComponent = computed(() => {
  return props.type === 'success' ? CheckCircle : AlertCircle
})
</script>

<style scoped>
.alert {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 16px;
}

.alert.success {
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #bbf7d0;
}

.alert.error {
  background: #fef2f2;
  color: #ef4444;
  border: 1px solid #fecaca;
}

.alert-close {
  margin-left: auto;
  background: none;
  border: none;
  cursor: pointer;
  color: inherit;
  opacity: 0.7;
}

.alert-close:hover {
  opacity: 1;
}
</style>
```

### 6. LoadingSpinner — `src/components/LoadingSpinner.vue`

```vue
<template>
  <div class="spinner-container">
    <div class="spinner"></div>
    <p v-if="text" class="spinner-text">{{ text }}</p>
  </div>
</template>

<script setup>
defineProps({
  text: String
})
</script>

<style scoped>
.spinner-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  gap: 12px;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #e5e7eb;
  border-top-color: #22c55e;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.spinner-text {
  font-size: 14px;
  color: #6b7280;
}
</style>
```

---

## 🔐 TAHAP 3.7: Halaman Autentikasi

### 1. Login — `src/views/Login.vue`

```vue
<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <div class="auth-logo">
            <Wallet :size="32" color="#22c55e" />
          </div>
          <h1 class="auth-title">Selamat Datang</h1>
          <p class="auth-subtitle">Masuk ke akun CatatanKeu Anda</p>
        </div>

        <AlertMessage
          v-if="authStore.error"
          :show="true"
          :message="authStore.error"
          type="error"
          @close="authStore.error = null"
        />

        <form @submit.prevent="handleLogin" class="auth-form">
          <div class="form-group">
            <label class="form-label">Email</label>
            <div class="input-wrapper">
              <Mail :size="18" class="input-icon" />
              <input
                v-model="form.email"
                type="email"
                class="form-input"
                placeholder="Masukkan email"
                required
              />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Password</label>
            <div class="input-wrapper">
              <Lock :size="18" class="input-icon" />
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                class="form-input"
                placeholder="Masukkan password"
                required
              />
              <button type="button" @click="showPassword = !showPassword" class="toggle-password">
                <Eye v-if="!showPassword" :size="18" />
                <EyeOff v-else :size="18" />
              </button>
            </div>
          </div>

          <button type="submit" class="btn-primary" :disabled="authStore.loading">
            <Loader2 v-if="authStore.loading" :size="18" class="spin" />
            <span>{{ authStore.loading ? 'Masuk...' : 'Masuk' }}</span>
          </button>
        </form>

        <div class="auth-footer">
          <p>Belum punya akun? <router-link to="/register" class="link">Daftar sekarang</router-link></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { Wallet, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-vue-next'
import AlertMessage from '../components/AlertMessage.vue'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  email: '',
  password: ''
})

const showPassword = ref(false)

const handleLogin = async () => {
  try {
    await authStore.login(form.value)
    router.push('/')
  } catch (error) {
    // Error sudah di-handle oleh store
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 50%, #f0fdf4 100%);
  padding: 20px;
}

.auth-container {
  width: 100%;
  max-width: 420px;
}

.auth-card {
  background: white;
  border-radius: 16px;
  padding: 40px 32px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
  border: 1px solid #e5e7eb;
}

.auth-header {
  text-align: center;
  margin-bottom: 32px;
}

.auth-logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: #f0fdf4;
  border-radius: 16px;
  margin-bottom: 16px;
}

.auth-title {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 8px 0;
}

.auth-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 12px;
  color: #9ca3af;
}

.form-input {
  width: 100%;
  padding: 10px 12px 10px 40px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  color: #111827;
  background: white;
  transition: all 0.2s;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #22c55e;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
}

.form-input::placeholder {
  color: #9ca3af;
}

.toggle-password {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  color: #9ca3af;
  padding: 2px;
}

.toggle-password:hover {
  color: #6b7280;
}

.btn-primary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  background: #22c55e;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 8px;
}

.btn-primary:hover:not(:disabled) {
  background: #16a34a;
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.auth-footer {
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
  color: #6b7280;
}

.link {
  color: #22c55e;
  text-decoration: none;
  font-weight: 600;
}

.link:hover {
  text-decoration: underline;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
```

### 2. Register — `src/views/Register.vue`

```vue
<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <div class="auth-logo">
            <Wallet :size="32" color="#22c55e" />
          </div>
          <h1 class="auth-title">Buat Akun Baru</h1>
          <p class="auth-subtitle">Daftar untuk mulai mencatat keuangan</p>
        </div>

        <AlertMessage
          v-if="authStore.error"
          :show="true"
          :message="authStore.error"
          type="error"
          @close="authStore.error = null"
        />

        <AlertMessage
          v-if="successMessage"
          :show="true"
          :message="successMessage"
          type="success"
          @close="successMessage = ''"
        />

        <form @submit.prevent="handleRegister" class="auth-form">
          <div class="form-group">
            <label class="form-label">Username</label>
            <div class="input-wrapper">
              <User :size="18" class="input-icon" />
              <input
                v-model="form.username"
                type="text"
                class="form-input"
                placeholder="Masukkan username"
                required
              />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Email</label>
            <div class="input-wrapper">
              <Mail :size="18" class="input-icon" />
              <input
                v-model="form.email"
                type="email"
                class="form-input"
                placeholder="Masukkan email"
                required
              />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Password</label>
            <div class="input-wrapper">
              <Lock :size="18" class="input-icon" />
              <input
                v-model="form.password"
                type="password"
                class="form-input"
                placeholder="Masukkan password"
                required
                minlength="6"
              />
            </div>
          </div>

          <button type="submit" class="btn-primary" :disabled="authStore.loading">
            <Loader2 v-if="authStore.loading" :size="18" class="spin" />
            <span>{{ authStore.loading ? 'Mendaftar...' : 'Daftar' }}</span>
          </button>
        </form>

        <div class="auth-footer">
          <p>Sudah punya akun? <router-link to="/login" class="link">Masuk</router-link></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { Wallet, User, Mail, Lock, Loader2 } from 'lucide-vue-next'
import AlertMessage from '../components/AlertMessage.vue'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  username: '',
  email: '',
  password: ''
})

const successMessage = ref('')

const handleRegister = async () => {
  try {
    const response = await authStore.register(form.value)
    successMessage.value = response.message
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } catch (error) {
    // Error sudah di-handle oleh store
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 50%, #f0fdf4 100%);
  padding: 20px;
}

.auth-container {
  width: 100%;
  max-width: 420px;
}

.auth-card {
  background: white;
  border-radius: 16px;
  padding: 40px 32px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
  border: 1px solid #e5e7eb;
}

.auth-header {
  text-align: center;
  margin-bottom: 32px;
}

.auth-logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: #f0fdf4;
  border-radius: 16px;
  margin-bottom: 16px;
}

.auth-title {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 8px 0;
}

.auth-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 12px;
  color: #9ca3af;
}

.form-input {
  width: 100%;
  padding: 10px 12px 10px 40px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  color: #111827;
  background: white;
  transition: all 0.2s;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #22c55e;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
}

.form-input::placeholder {
  color: #9ca3af;
}

.btn-primary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  background: #22c55e;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 8px;
}

.btn-primary:hover:not(:disabled) {
  background: #16a34a;
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.auth-footer {
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
  color: #6b7280;
}

.link {
  color: #22c55e;
  text-decoration: none;
  font-weight: 600;
}

.link:hover {
  text-decoration: underline;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
```

---

## 📊 TAHAP 3.8: Dashboard

### `src/views/Dashboard.vue`

```vue
<template>
  <MainLayout>
    <div class="dashboard">
      <!-- Summary Cards -->
      <div class="summary-cards">
        <div class="summary-card income">
          <div class="card-icon">
            <TrendingUp :size="22" color="#16a34a" />
          </div>
          <div class="card-info">
            <p class="card-label">Total Income</p>
            <p class="card-value green">Rp {{ formatMoney(summary?.totalIncome || 0) }}</p>
          </div>
        </div>

        <div class="summary-card expense">
          <div class="card-icon">
            <TrendingDown :size="22" color="#ef4444" />
          </div>
          <div class="card-info">
            <p class="card-label">Total Expense</p>
            <p class="card-value red">Rp {{ formatMoney(summary?.totalExpense || 0) }}</p>
          </div>
        </div>

        <div class="summary-card balance">
          <div class="card-icon">
            <Wallet :size="22" color="#22c55e" />
          </div>
          <div class="card-info">
            <p class="card-label">Saldo</p>
            <p class="card-value">Rp {{ formatMoney(summary?.balance || 0) }}</p>
          </div>
        </div>
      </div>

      <!-- Expense by Category -->
      <div class="section-card">
        <div class="section-header">
          <h2 class="section-title">Pengeluaran per Kategori</h2>
          <span class="badge">{{ currentMonthName }} {{ currentYear }}</span>
        </div>

        <div v-if="expenseByCategory.length === 0" class="empty-state">
          <PieChart :size="48" color="#d1d5db" />
          <p>Belum ada data pengeluaran bulan ini</p>
        </div>

        <div v-else class="category-list">
          <div v-for="item in expenseByCategory" :key="item.category_name" class="category-item">
            <div class="category-left">
              <div class="category-dot"></div>
              <span class="category-name">{{ item.category_name }}</span>
            </div>
            <div class="category-right">
              <span class="category-count">{{ item.transaction_count }} transaksi</span>
              <span class="category-amount">Rp {{ formatMoney(item.total) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTransactionStore } from '../stores/transactions'
import MainLayout from '../components/MainLayout.vue'
import { TrendingUp, TrendingDown, Wallet, PieChart } from 'lucide-vue-next'

const transactionStore = useTransactionStore()

const summary = computed(() => transactionStore.summary)
const expenseByCategory = computed(() => transactionStore.expenseByCategory)

const currentMonth = new Date().getMonth() + 1
const currentYear = new Date().getFullYear()

const monthNames = [
  '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]
const currentMonthName = computed(() => monthNames[currentMonth])

const formatMoney = (amount) => {
  return new Intl.NumberFormat('id-ID').format(amount)
}

onMounted(async () => {
  await Promise.all([
    transactionStore.fetchSummary({ month: currentMonth, year: currentYear }),
    transactionStore.fetchExpenseByCategory({ month: currentMonth, year: currentYear })
  ])
})
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.summary-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  border: 1px solid #e5e7eb;
  transition: all 0.2s;
}

.summary-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0fdf4;
}

.summary-card.income .card-icon { background: #f0fdf4; }
.summary-card.expense .card-icon { background: #fef2f2; }
.summary-card.balance .card-icon { background: #f0fdf4; }

.card-label {
  font-size: 13px;
  color: #6b7280;
  margin: 0 0 4px 0;
}

.card-value {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.card-value.green { color: #16a34a; }
.card-value.red { color: #ef4444; }

.section-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #e5e7eb;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.badge {
  font-size: 12px;
  font-weight: 500;
  color: #16a34a;
  background: #f0fdf4;
  padding: 4px 10px;
  border-radius: 20px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px;
  color: #9ca3af;
  font-size: 14px;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.category-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f3f4f6;
}

.category-item:last-child {
  border-bottom: none;
}

.category-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.category-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #22c55e;
}

.category-name {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.category-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.category-count {
  font-size: 12px;
  color: #9ca3af;
}

.category-amount {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  min-width: 120px;
  text-align: right;
}
</style>
```

---

## 💰 TAHAP 3.9: Halaman Transaksi

### `src/views/Transactions.vue`

```vue
<template>
  <MainLayout>
    <div class="transactions-page">
      <!-- Header Actions -->
      <div class="page-actions">
        <div class="filter-group">
          <select v-model="filterMonth" class="filter-select">
            <option value="">Semua Bulan</option>
            <option v-for="m in 12" :key="m" :value="m">{{ monthNames[m] }}</option>
          </select>
          <select v-model="filterYear" class="filter-select">
            <option value="">Semua Tahun</option>
            <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
          </select>
          <button @click="fetchData" class="btn-secondary">
            <Filter :size="16" />
            Filter
          </button>
        </div>
        <button @click="openAddModal" class="btn-primary">
          <Plus :size="18" />
          Tambah Transaksi
        </button>
      </div>

      <!-- Alert -->
      <AlertMessage
        v-if="alert.show"
        :show="true"
        :message="alert.message"
        :type="alert.type"
        @close="alert.show = false"
      />

      <!-- Loading -->
      <LoadingSpinner v-if="transactionStore.loading" text="Memuat transaksi..." />

      <!-- Transaction List -->
      <div v-else-if="transactions.length > 0" class="transaction-list">
        <div v-for="t in transactions" :key="t.id" class="transaction-item">
          <div class="transaction-left">
            <div :class="['transaction-icon', t.type]">
              <ArrowUpRight v-if="t.type === 'income'" :size="18" />
              <ArrowDownRight v-else :size="18" />
            </div>
            <div class="transaction-info">
              <p class="transaction-desc">{{ t.description || 'Tanpa deskripsi' }}</p>
              <p class="transaction-meta">
                {{ t.category_name || 'Tanpa kategori' }} &middot; {{ formatDate(t.date) }}
              </p>
            </div>
          </div>
          <div class="transaction-right">
            <p :class="['transaction-amount', t.type]">
              {{ t.type === 'income' ? '+' : '-' }} Rp {{ formatMoney(t.amount) }}
            </p>
            <div class="transaction-actions">
              <button @click="openEditModal(t)" class="action-btn">
                <Pencil :size="14" />
              </button>
              <button @click="handleDelete(t.id)" class="action-btn danger">
                <Trash2 :size="14" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <ArrowLeftRight :size="48" color="#d1d5db" />
        <p>Belum ada transaksi</p>
        <button @click="openAddModal" class="btn-primary btn-sm">
          <Plus :size="16" />
          Tambah Transaksi
        </button>
      </div>

      <!-- Modal Tambah/Edit -->
      <Modal v-model="showModal" :title="editingId ? 'Edit Transaksi' : 'Tambah Transaksi'">
        <form @submit.prevent="handleSubmit" class="modal-form">
          <div class="form-group">
            <label class="form-label">Tipe</label>
            <div class="type-toggle">
              <button
                type="button"
                :class="['type-btn', { active: form.type === 'expense' }]"
                @click="form.type = 'expense'"
              >
                <ArrowDownRight :size="16" />
                Pengeluaran
              </button>
              <button
                type="button"
                :class="['type-btn income', { active: form.type === 'income' }]"
                @click="form.type = 'income'"
              >
                <ArrowUpRight :size="16" />
                Pemasukan
              </button>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Jumlah (Rp)</label>
            <input
              v-model="form.amount"
              type="number"
              class="form-input"
              placeholder="Masukkan jumlah"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label">Kategori</label>
            <select v-model="form.category_id" class="form-input">
              <option value="">Pilih Kategori</option>
              <option v-for="c in filteredCategories" :key="c.id" :value="c.id">
                {{ c.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Deskripsi</label>
            <input
              v-model="form.description"
              type="text"
              class="form-input"
              placeholder="Deskripsi (opsional)"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Tanggal</label>
            <input
              v-model="form.date"
              type="date"
              class="form-input"
              required
            />
          </div>

          <div class="modal-actions">
            <button type="button" @click="showModal = false" class="btn-cancel">Batal</button>
            <button type="submit" class="btn-primary">
              {{ editingId ? 'Update' : 'Simpan' }}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useTransactionStore } from '../stores/transactions'
import { useCategoryStore } from '../stores/categories'
import MainLayout from '../components/MainLayout.vue'
import Modal from '../components/Modal.vue'
import AlertMessage from '../components/AlertMessage.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import {
  Plus, Filter, Pencil, Trash2,
  ArrowUpRight, ArrowDownRight, ArrowLeftRight
} from 'lucide-vue-next'

const transactionStore = useTransactionStore()
const categoryStore = useCategoryStore()

const transactions = computed(() => transactionStore.transactions)

const filterMonth = ref('')
const filterYear = ref(new Date().getFullYear())
const showModal = ref(false)
const editingId = ref(null)

const alert = ref({ show: false, message: '', type: 'success' })

const form = ref({
  type: 'expense',
  amount: '',
  category_id: '',
  description: '',
  date: new Date().toISOString().split('T')[0]
})

const monthNames = [
  '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

const years = computed(() => {
  const currentYear = new Date().getFullYear()
  return Array.from({ length: 5 }, (_, i) => currentYear - i)
})

const filteredCategories = computed(() => {
  return form.value.type === 'income'
    ? categoryStore.incomeCategories
    : categoryStore.expenseCategories
})

const formatMoney = (amount) => new Intl.NumberFormat('id-ID').format(amount)

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}

const fetchData = () => {
  const params = {}
  if (filterMonth.value) params.month = filterMonth.value
  if (filterYear.value) params.year = filterYear.value
  transactionStore.fetchTransactions(params)
}

const openAddModal = () => {
  editingId.value = null
  form.value = {
    type: 'expense',
    amount: '',
    category_id: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  }
  showModal.value = true
}

const openEditModal = (transaction) => {
  editingId.value = transaction.id
  form.value = {
    type: transaction.type,
    amount: transaction.amount,
    category_id: transaction.category_id,
    description: transaction.description || '',
    date: transaction.date.split('T')[0]
  }
  showModal.value = true
}

const handleSubmit = async () => {
  try {
    if (editingId.value) {
      await transactionStore.updateTransaction(editingId.value, form.value)
      showAlert('Transaksi berhasil diupdate', 'success')
    } else {
      await transactionStore.addTransaction(form.value)
      showAlert('Transaksi berhasil ditambahkan', 'success')
    }
    showModal.value = false
    fetchData()
  } catch (error) {
    showAlert(error.response?.data?.message || 'Terjadi kesalahan', 'error')
  }
}

const handleDelete = async (id) => {
  if (!confirm('Yakin ingin menghapus transaksi ini?')) return
  try {
    await transactionStore.deleteTransaction(id)
    showAlert('Transaksi berhasil dihapus', 'success')
  } catch (error) {
    showAlert('Gagal menghapus transaksi', 'error')
  }
}

const showAlert = (message, type) => {
  alert.value = { show: true, message, type }
  setTimeout(() => { alert.value.show = false }, 3000)
}

onMounted(() => {
  categoryStore.fetchCategories()
  fetchData()
})
</script>

<style scoped>
.transactions-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.filter-group {
  display: flex;
  gap: 8px;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 13px;
  color: #374151;
  background: white;
  cursor: pointer;
}

.filter-select:focus {
  outline: none;
  border-color: #22c55e;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #22c55e;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover { background: #16a34a; }

.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover { background: #f9fafb; }

.btn-sm { padding: 6px 12px; font-size: 12px; }

.transaction-list {
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.transaction-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #f3f4f6;
  transition: background 0.15s;
}

.transaction-item:last-child { border-bottom: none; }
.transaction-item:hover { background: #f9fafb; }

.transaction-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.transaction-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.transaction-icon.income { background: #f0fdf4; color: #16a34a; }
.transaction-icon.expense { background: #fef2f2; color: #ef4444; }

.transaction-desc {
  font-size: 14px;
  font-weight: 500;
  color: #111827;
  margin: 0;
}

.transaction-meta {
  font-size: 12px;
  color: #9ca3af;
  margin: 4px 0 0 0;
}

.transaction-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.transaction-amount {
  font-size: 14px;
  font-weight: 600;
  margin: 0;
}

.transaction-amount.income { color: #16a34a; }
.transaction-amount.expense { color: #ef4444; }

.transaction-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.15s;
}

.transaction-item:hover .transaction-actions { opacity: 1; }

.action-btn {
  padding: 6px;
  background: none;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.15s;
}

.action-btn:hover { background: #f3f4f6; color: #374151; }
.action-btn.danger:hover { background: #fef2f2; color: #ef4444; border-color: #fecaca; }

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 60px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  color: #9ca3af;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

.form-input {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  color: #111827;
}

.form-input:focus {
  outline: none;
  border-color: #22c55e;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
}

.type-toggle {
  display: flex;
  gap: 8px;
}

.type-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  color: #ef4444;
  transition: all 0.2s;
}

.type-btn.income { color: #16a34a; }
.type-btn.active { background: #fef2f2; border-color: #ef4444; }
.type-btn.income.active { background: #f0fdf4; border-color: #16a34a; }

.modal-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 8px;
}

.btn-cancel {
  padding: 8px 16px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  color: #374151;
}
</style>
```

---

## 📂 TAHAP 3.10: Halaman Kategori

### `src/views/Categories.vue`

```vue
<template>
  <MainLayout>
    <div class="categories-page">
      <!-- Header -->
      <div class="page-actions">
        <div class="tab-group">
          <button
            :class="['tab', { active: activeTab === 'expense' }]"
            @click="activeTab = 'expense'"
          >
            Pengeluaran
          </button>
          <button
            :class="['tab income', { active: activeTab === 'income' }]"
            @click="activeTab = 'income'"
          >
            Pemasukan
          </button>
        </div>
        <button @click="openAddModal" class="btn-primary">
          <Plus :size="18" />
          Tambah Kategori
        </button>
      </div>

      <!-- Alert -->
      <AlertMessage
        v-if="alert.show"
        :show="true"
        :message="alert.message"
        :type="alert.type"
        @close="alert.show = false"
      />

      <!-- Loading -->
      <LoadingSpinner v-if="categoryStore.loading" text="Memuat kategori..." />

      <!-- Category Grid -->
      <div v-else class="category-grid">
        <div
          v-for="cat in filteredCategories"
          :key="cat.id"
          class="category-card"
        >
          <div class="card-top">
            <div class="category-icon-wrapper">
              <component :is="getIcon(cat.icon)" :size="22" />
            </div>
            <button
              v-if="cat.user_id"
              @click="handleDelete(cat.id)"
              class="delete-btn"
            >
              <Trash2 :size="14" />
            </button>
          </div>
          <h3 class="category-name">{{ cat.name }}</h3>
          <span :class="['category-type-badge', cat.type]">
            {{ cat.type === 'income' ? 'Pemasukan' : 'Pengeluaran' }}
          </span>
        </div>

        <!-- Empty -->
        <div v-if="filteredCategories.length === 0" class="empty-card">
          <Tags :size="32" color="#d1d5db" />
          <p>Belum ada kategori</p>
        </div>
      </div>

      <!-- Modal Tambah -->
      <Modal v-model="showModal" title="Tambah Kategori">
        <form @submit.prevent="handleSubmit" class="modal-form">
          <div class="form-group">
            <label class="form-label">Nama Kategori</label>
            <input
              v-model="form.name"
              type="text"
              class="form-input"
              placeholder="Contoh: Gaji, Makanan"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label">Tipe</label>
            <div class="type-toggle">
              <button
                type="button"
                :class="['type-btn', { active: form.type === 'expense' }]"
                @click="form.type = 'expense'"
              >
                Pengeluaran
              </button>
              <button
                type="button"
                :class="['type-btn income', { active: form.type === 'income' }]"
                @click="form.type = 'income'"
              >
                Pemasukan
              </button>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Icon</label>
            <div class="icon-grid">
              <button
                v-for="iconName in iconOptions"
                :key="iconName"
                type="button"
                :class="['icon-option', { selected: form.icon === iconName }]"
                @click="form.icon = iconName"
              >
                <component :is="getIcon(iconName)" :size="18" />
              </button>
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" @click="showModal = false" class="btn-cancel">Batal</button>
            <button type="submit" class="btn-primary">Simpan</button>
          </div>
        </form>
      </Modal>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCategoryStore } from '../stores/categories'
import MainLayout from '../components/MainLayout.vue'
import Modal from '../components/Modal.vue'
import AlertMessage from '../components/AlertMessage.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import {
  Plus, Trash2, Tags,
  Briefcase, Laptop, Utensils, Car, ShoppingCart,
  FileText, Home, Heart, BookOpen, Gift, Dumbbell,
  Plane, Music, Coffee, Wifi
} from 'lucide-vue-next'

const categoryStore = useCategoryStore()

const activeTab = ref('expense')
const showModal = ref(false)
const alert = ref({ show: false, message: '', type: 'success' })

const form = ref({
  name: '',
  type: 'expense',
  icon: 'tag'
})

const iconOptions = [
  'briefcase', 'laptop', 'utensils', 'car', 'shopping-cart',
  'file-text', 'home', 'heart', 'book-open', 'gift',
  'dumbbell', 'plane', 'music', 'coffee', 'wifi', 'tag'
]

const iconMap = {
  'briefcase': Briefcase, 'laptop': Laptop, 'utensils': Utensils,
  'car': Car, 'shopping-cart': ShoppingCart, 'shopping-bag': ShoppingCart,
  'file-text': FileText, 'home': Home, 'heart': Heart,
  'book-open': BookOpen, 'gift': Gift, 'dumbbell': Dumbbell,
  'plane': Plane, 'music': Music, 'coffee': Coffee,
  'wifi': Wifi, 'tag': Tags
}

const getIcon = (name) => iconMap[name] || Tags

const filteredCategories = computed(() => {
  return categoryStore.categories.filter(c => c.type === activeTab.value)
})

const openAddModal = () => {
  form.value = { name: '', type: activeTab.value, icon: 'tag' }
  showModal.value = true
}

const handleSubmit = async () => {
  try {
    await categoryStore.addCategory(form.value)
    showAlert('Kategori berhasil ditambahkan', 'success')
    showModal.value = false
  } catch (error) {
    showAlert(error.response?.data?.message || 'Gagal menambahkan kategori', 'error')
  }
}

const handleDelete = async (id) => {
  if (!confirm('Yakin ingin menghapus kategori ini?')) return
  try {
    await categoryStore.deleteCategory(id)
    showAlert('Kategori berhasil dihapus', 'success')
  } catch (error) {
    showAlert('Gagal menghapus kategori', 'error')
  }
}

const showAlert = (message, type) => {
  alert.value = { show: true, message, type }
  setTimeout(() => { alert.value.show = false }, 3000)
}

onMounted(() => {
  categoryStore.fetchCategories()
})
</script>

<style scoped>
.categories-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tab-group {
  display: flex;
  gap: 4px;
  background: #f3f4f6;
  padding: 4px;
  border-radius: 8px;
}

.tab {
  padding: 6px 16px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  background: transparent;
  color: #6b7280;
  transition: all 0.2s;
}

.tab.active {
  background: white;
  color: #ef4444;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.tab.income.active {
  color: #16a34a;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #22c55e;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary:hover { background: #16a34a; }

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}

.category-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: all 0.2s;
}

.category-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border-color: #bbf7d0;
}

.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.category-icon-wrapper {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: #f0fdf4;
  color: #16a34a;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-btn {
  padding: 4px;
  background: none;
  border: none;
  cursor: pointer;
  color: #d1d5db;
  border-radius: 4px;
  transition: all 0.15s;
}

.delete-btn:hover {
  color: #ef4444;
  background: #fef2f2;
}

.category-name {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.category-type-badge {
  font-size: 11px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 12px;
  width: fit-content;
}

.category-type-badge.expense {
  background: #fef2f2;
  color: #ef4444;
}

.category-type-badge.income {
  background: #f0fdf4;
  color: #16a34a;
}

.empty-card {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 40px;
  color: #9ca3af;
  font-size: 14px;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

.form-input {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
}

.form-input:focus {
  outline: none;
  border-color: #22c55e;
}

.type-toggle {
  display: flex;
  gap: 8px;
}

.type-btn {
  flex: 1;
  padding: 8px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  color: #ef4444;
  transition: all 0.2s;
}

.type-btn.income { color: #16a34a; }
.type-btn.active { background: #fef2f2; border-color: #ef4444; }
.type-btn.income.active { background: #f0fdf4; border-color: #16a34a; }

.icon-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 6px;
}

.icon-option {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.15s;
}

.icon-option:hover { border-color: #22c55e; color: #22c55e; }
.icon-option.selected { background: #f0fdf4; border-color: #22c55e; color: #16a34a; }

.modal-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 8px;
}

.btn-cancel {
  padding: 8px 16px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  color: #374151;
}
</style>
```

---

## 💵 TAHAP 3.11: Halaman Budget

### `src/views/Budgets.vue`

```vue
<template>
  <MainLayout>
    <div class="budgets-page">
      <!-- Header -->
      <div class="page-actions">
        <div class="filter-group">
          <select v-model="filterMonth" class="filter-select">
            <option value="">Semua Bulan</option>
            <option v-for="m in 12" :key="m" :value="m">{{ monthNames[m] }}</option>
          </select>
          <select v-model="filterYear" class="filter-select">
            <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
          </select>
          <button @click="fetchData" class="btn-secondary">
            <Filter :size="16" />
            Filter
          </button>
        </div>
        <button @click="openAddModal" class="btn-primary">
          <Plus :size="18" />
          Tambah Budget
        </button>
      </div>

      <!-- Alert -->
      <AlertMessage
        v-if="alert.show"
        :show="true"
        :message="alert.message"
        :type="alert.type"
        @close="alert.show = false"
      />

      <!-- Loading -->
      <LoadingSpinner v-if="budgetStore.loading" text="Memuat budget..." />

      <!-- Budget List -->
      <div v-else-if="budgets.length > 0" class="budget-list">
        <div v-for="b in budgets" :key="b.id" class="budget-card">
          <div class="budget-header">
            <div class="budget-left">
              <div class="budget-icon">
                <PiggyBank :size="20" />
              </div>
              <div>
                <h3 class="budget-name">{{ b.category_name }}</h3>
                <p class="budget-period">{{ monthNames[b.month] }} {{ b.year }}</p>
              </div>
            </div>
            <div class="budget-amount">
              Rp {{ formatMoney(b.amount) }}
            </div>
          </div>
          <div class="budget-actions">
            <button @click="openEditModal(b)" class="action-btn">
              <Pencil :size="14" />
              Edit
            </button>
            <button @click="handleDelete(b.id)" class="action-btn danger">
              <Trash2 :size="14" />
              Hapus
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <PiggyBank :size="48" color="#d1d5db" />
        <p>Belum ada budget</p>
        <button @click="openAddModal" class="btn-primary btn-sm">
          <Plus :size="16" />
          Tambah Budget
        </button>
      </div>

      <!-- Modal Tambah/Edit -->
      <Modal v-model="showModal" :title="editingId ? 'Edit Budget' : 'Tambah Budget'">
        <form @submit.prevent="handleSubmit" class="modal-form">
          <div class="form-group">
            <label class="form-label">Kategori Pengeluaran</label>
            <select v-model="form.category_id" class="form-input" required>
              <option value="">Pilih Kategori</option>
              <option v-for="c in categoryStore.expenseCategories" :key="c.id" :value="c.id">
                {{ c.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Batas Budget (Rp)</label>
            <input
              v-model="form.amount"
              type="number"
              class="form-input"
              placeholder="Masukkan jumlah budget"
              required
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Bulan</label>
              <select v-model="form.month" class="form-input" required>
                <option v-for="m in 12" :key="m" :value="m">{{ monthNames[m] }}</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Tahun</label>
              <select v-model="form.year" class="form-input" required>
                <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
              </select>
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" @click="showModal = false" class="btn-cancel">Batal</button>
            <button type="submit" class="btn-primary">
              {{ editingId ? 'Update' : 'Simpan' }}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useBudgetStore } from '../stores/budgets'
import { useCategoryStore } from '../stores/categories'
import MainLayout from '../components/MainLayout.vue'
import Modal from '../components/Modal.vue'
import AlertMessage from '../components/AlertMessage.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import { Plus, Filter, Pencil, Trash2, PiggyBank } from 'lucide-vue-next'

const budgetStore = useBudgetStore()
const categoryStore = useCategoryStore()

const budgets = computed(() => budgetStore.budgets)

const filterMonth = ref(new Date().getMonth() + 1)
const filterYear = ref(new Date().getFullYear())
const showModal = ref(false)
const editingId = ref(null)
const alert = ref({ show: false, message: '', type: 'success' })

const form = ref({
  category_id: '',
  amount: '',
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear()
})

const monthNames = [
  '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

const years = computed(() => {
  const currentYear = new Date().getFullYear()
  return Array.from({ length: 5 }, (_, i) => currentYear - i)
})

const formatMoney = (amount) => new Intl.NumberFormat('id-ID').format(amount)

const fetchData = () => {
  const params = {}
  if (filterMonth.value) params.month = filterMonth.value
  if (filterYear.value) params.year = filterYear.value
  budgetStore.fetchBudgets(params)
}

const openAddModal = () => {
  editingId.value = null
  form.value = {
    category_id: '',
    amount: '',
    month: filterMonth.value || new Date().getMonth() + 1,
    year: filterYear.value || new Date().getFullYear()
  }
  showModal.value = true
}

const openEditModal = (budget) => {
  editingId.value = budget.id
  form.value = {
    category_id: budget.category_id,
    amount: budget.amount,
    month: budget.month,
    year: budget.year
  }
  showModal.value = true
}

const handleSubmit = async () => {
  try {
    if (editingId.value) {
      await budgetStore.updateBudget(editingId.value, form.value)
      showAlert('Budget berhasil diupdate', 'success')
    } else {
      await budgetStore.addBudget(form.value)
      showAlert('Budget berhasil ditambahkan', 'success')
    }
    showModal.value = false
    fetchData()
  } catch (error) {
    showAlert(error.response?.data?.message || 'Terjadi kesalahan', 'error')
  }
}

const handleDelete = async (id) => {
  if (!confirm('Yakin ingin menghapus budget ini?')) return
  try {
    await budgetStore.deleteBudget(id)
    showAlert('Budget berhasil dihapus', 'success')
  } catch (error) {
    showAlert('Gagal menghapus budget', 'error')
  }
}

const showAlert = (message, type) => {
  alert.value = { show: true, message, type }
  setTimeout(() => { alert.value.show = false }, 3000)
}

onMounted(() => {
  categoryStore.fetchCategories()
  fetchData()
})
</script>

<style scoped>
.budgets-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.filter-group {
  display: flex;
  gap: 8px;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 13px;
  color: #374151;
  background: white;
}

.filter-select:focus {
  outline: none;
  border-color: #22c55e;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #22c55e;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary:hover { background: #16a34a; }

.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
}

.btn-sm { padding: 6px 12px; font-size: 12px; }

.budget-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.budget-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: all 0.2s;
}

.budget-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border-color: #bbf7d0;
}

.budget-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.budget-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.budget-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: #f0fdf4;
  color: #16a34a;
  display: flex;
  align-items: center;
  justify-content: center;
}

.budget-name {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.budget-period {
  font-size: 12px;
  color: #9ca3af;
  margin: 4px 0 0 0;
}

.budget-amount {
  font-size: 18px;
  font-weight: 700;
  color: #16a34a;
}

.budget-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.15s;
}

.action-btn:hover { background: #f3f4f6; color: #374151; }
.action-btn.danger:hover { background: #fef2f2; color: #ef4444; border-color: #fecaca; }

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 60px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  color: #9ca3af;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

.form-input {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
}

.form-input:focus {
  outline: none;
  border-color: #22c55e;
}

.modal-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 8px;
}

.btn-cancel {
  padding: 8px 16px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  color: #374151;
}
</style>
```

---

## 🎨 TAHAP 3.12: CSS Global

### Update `src/assets/styles.css`

```css
/* === RESET & BASE === */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background-color: #f9fafb;
  color: #111827;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

/* === SCROLLBAR === */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* === SELECTION === */
::selection {
  background: #bbf7d0;
  color: #166534;
}

/* === LINK === */
a {
  color: inherit;
  text-decoration: none;
}

/* === BUTTON RESET === */
button {
  font-family: inherit;
}

/* === INPUT RESET === */
input, select, textarea {
  font-family: inherit;
}
```

### Update `index.html` (di root project)

```html
<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <title>CatatanKeu - Keuangan Pribadi</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

---

## 🚀 TAHAP 3.13: Menjalankan Frontend

### Pastikan backend sudah berjalan:
```bash
cd backend
npm run dev
```

### Jalankan frontend (terminal baru):
```bash
cd frontend
npm run dev
```

### Buka browser:
```
http://localhost:3000
```

---

## 🧪 TAHAP 3.14: Testing Flow

| Urutan | Aksi | yang Harus Terjadi |
|--------|------|-------------------|
| 1 | Buka `localhost:3000` | Redirect ke halaman Login |
| 2 | Klik "Daftar sekarang" | Pindah ke halaman Register |
| 3 | Isi form Register, klik "Daftar" | Muncul notifikasi sukses, redirect ke Login |
| 4 | Isi form Login, klik "Masuk" | Redirect ke Dashboard |
| 5 | Klik menu "Transaksi" | Halaman Transaksi terbuka |
| 6 | Klik "Tambah Transaksi" | Modal muncul, isi form, simpan | 
| 7 | Klik menu "Kategori" | Halaman Kategori terbuka, ada tab Pemasukan/Pengeluaran |
| 8 | Klik "Tambah Kategori" | Modal muncul, pilih icon, simpan |
| 9 | Klik menu "Budget" | Halaman Budget terbuka |
| 10 | Klik "Tambah Budget" | Modal muncul, pilih kategori, isi budget, simpan |
| 11 | Klik tombol "Keluar" di sidebar | Kembali ke halaman Login |

---

## 📝 Catatan Penting

1. **CORS**: Backend sudah pakai `cors()`, frontend pakai proxy Vite — tidak ada masalah CORS
2. **Token**: Disimpan di `localStorage`, otomatis dikirim setiap request via interceptor
3. **Token Expired**: Jika dapat 401, user otomatis logout dan redirect ke login
4. **Format Uang**: Selalu pakai `Intl.NumberFormat('id-ID')` untuk format Rupiah
5. **Error Handling**: Setiap store punya `error` state, tampilkan ke user via AlertMessage
6. **Icon**: Pakai `lucide-vue-next` — import sesuai kebutuhan, jangan import semua

---

## ✅ Checklist Penyelesaian Tahap 3

- [ ] Project frontend terinisialisasi dengan benar
- [ ] Theme hijau-putih konsisten di semua halaman
- [ ] Halaman Login & Register berfungsi
- [ ] Sidebar & Navbar berfungsi
- [ ] Navigasi antar halaman berfungsi
- [ ] Dashboard menampilkan summary & expense by category
- [ ] Transaksi: CRUD (Create, Read, Update, Delete) berfungsi
- [ ] Kategori: Tambah, Lihat, Hapus berfungsi
- [ ] Budget: CRUD berfungsi
- [ ] Filter bulan/tahun berfungsi di Transaksi & Budget
- [ ] Modal buka/tutup berfungsi
- [ ] Loading & empty state tampil dengan benar
- [ ] Error handling & notifikasi berfungsi
- [ ] Token auto-refresh & logout otomatis saat expired

---

## 🎯 Selanjutnya

Setelah Tahap 3 selesai, lanjut ke **Tahap 4: Mobile App (Flutter + Dart)**
