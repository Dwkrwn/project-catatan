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
            {{ cat.type === "income" ? "Pemasukan" : "Pengeluaran" }}
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
            <button type="button" @click="showModal = false" class="btn-cancel">
              Batal
            </button>
            <button type="submit" class="btn-primary">Simpan</button>
          </div>
        </form>
      </Modal>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useCategoryStore } from "../stores/categories";
import MainLayout from "../components/MainLayout.vue";
import Modal from "../components/Model.vue";
import AlertMessage from "../components/AlertMessage.vue";
import LoadingSpinner from "../components/LoadingSpinner.vue";
import {
  Plus,
  Trash2,
  Tags,
  Briefcase,
  Laptop,
  Utensils,
  Car,
  ShoppingCart,
  FileText,
  Home,
  Heart,
  BookOpen,
  Gift,
  Dumbbell,
  Plane,
  Music,
  Coffee,
  Wifi,
} from "lucide-vue-next";

const categoryStore = useCategoryStore();

const activeTab = ref("expense");
const showModal = ref(false);
const alert = ref({ show: false, message: "", type: "success" });

const form = ref({
  name: "",
  type: "expense",
  icon: "tag",
});

const iconOptions = [
  "briefcase",
  "laptop",
  "utensils",
  "car",
  "shopping-cart",
  "file-text",
  "home",
  "heart",
  "book-open",
  "gift",
  "dumbbell",
  "plane",
  "music",
  "coffee",
  "wifi",
  "tag",
];

const iconMap = {
  briefcase: Briefcase,
  laptop: Laptop,
  utensils: Utensils,
  car: Car,
  "shopping-cart": ShoppingCart,
  "shopping-bag": ShoppingCart,
  "file-text": FileText,
  home: Home,
  heart: Heart,
  "book-open": BookOpen,
  gift: Gift,
  dumbbell: Dumbbell,
  plane: Plane,
  music: Music,
  coffee: Coffee,
  wifi: Wifi,
  tag: Tags,
};

const getIcon = (name) => iconMap[name] || Tags;

const filteredCategories = computed(() => {
  return categoryStore.categories.filter((c) => c.type === activeTab.value);
});

const openAddModal = () => {
  form.value = { name: "", type: activeTab.value, icon: "tag" };
  showModal.value = true;
};

const handleSubmit = async () => {
  try {
    await categoryStore.addCategory(form.value);
    showAlert("Kategori berhasil ditambahkan", "success");
    showModal.value = false;
  } catch (error) {
    showAlert(
      error.response?.data?.message || "Gagal menambahkan kategori",
      "error",
    );
  }
};

const handleDelete = async (id) => {
  if (!confirm("Yakin ingin menghapus kategori ini?")) return;
  try {
    await categoryStore.deleteCategory(id);
    showAlert("Kategori berhasil dihapus", "success");
  } catch (error) {
    showAlert("Gagal menghapus kategori", "error");
  }
};

const showAlert = (message, type) => {
  alert.value = { show: true, message, type };
  setTimeout(() => {
    alert.value.show = false;
  }, 3000);
};

onMounted(() => {
  categoryStore.fetchCategories();
});
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

.btn-primary:hover {
  background: #16a34a;
}

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

.type-btn.income {
  color: #16a34a;
}
.type-btn.active {
  background: #fef2f2;
  border-color: #ef4444;
}
.type-btn.income.active {
  background: #f0fdf4;
  border-color: #16a34a;
}

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

.icon-option:hover {
  border-color: #22c55e;
  color: #22c55e;
}
.icon-option.selected {
  background: #f0fdf4;
  border-color: #22c55e;
  color: #16a34a;
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
