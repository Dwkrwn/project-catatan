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

          <button
            type="submit"
            class="btn-primary"
            :disabled="authStore.loading"
          >
            <Loader2 v-if="authStore.loading" :size="18" class="spin" />
            <span>{{ authStore.loading ? "Mendaftar..." : "Daftar" }}</span>
          </button>
        </form>

        <div class="auth-footer">
          <p>
            Sudah punya akun?
            <router-link to="/login" class="link">Masuk</router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { Wallet, User, Mail, Lock, Loader2 } from "lucide-vue-next";
import AlertMessage from "../components/AlertMessage.vue";

const router = useRouter();
const authStore = useAuthStore();

const form = ref({
  username: "",
  email: "",
  password: "",
});

const successMessage = ref("");

const handleRegister = async () => {
  try {
    const response = await authStore.register(form.value);
    successMessage.value = response.message;
    setTimeout(() => {
      router.push("/login");
    }, 2000);
  } catch (error) {
    // Error sudah di-handle oleh store
  }
};
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
  to {
    transform: rotate(360deg);
  }
}
</style>
