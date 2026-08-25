<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <div class="logo">
        <Wallet class="logo-icon" :size="28" color="#22c55e" />
        <span class="logo-text">CatatanKeu</span>
      </div>
    </div>

    <nav class="sidebar-nav">
      <router-link
        to="/"
        class="nav-item"
        :class="{ active: $route.path === '/' }"
      >
        <LayoutDashboard :size="20" />
        <span>Dashboard</span>
      </router-link>

      <router-link
        to="/transactions"
        class="nav-item"
        :class="{ active: $route.path === '/transactions' }"
      >
        <ArrowLeftRight :size="20" />
        <span>Transaksi</span>
      </router-link>

      <router-link
        to="/categories"
        class="nav-item"
        :class="{ active: $route.path === '/categories' }"
      >
        <Tags :size="20" />
        <span>Kategori</span>
      </router-link>

      <router-link
        to="/budgets"
        class="nav-item"
        :class="{ active: $route.path === '/budgets' }"
      >
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
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import {
  Wallet,
  LayoutDashboard,
  ArrowLeftRight,
  Tags,
  PiggyBank,
  LogOut,
} from "lucide-vue-next";

const router = useRouter();
const authStore = useAuthStore();

const handleLogout = () => {
  authStore.logout();
  router.push("/login");
};
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
