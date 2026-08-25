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