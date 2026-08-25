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