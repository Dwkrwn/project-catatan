<template>
  <MainLayout>
    <div class="budgets-page">
      <!-- Header -->
      <div class="page-actions">
        <div class="filter-group">
          <select v-model="filterMonth" class="filter-select">
            <option value="">Semua Bulan</option>
            <option v-for="m in 12" :key="m" :value="m">
              {{ monthNames[m] }}
            </option>
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
                <span :class="['category-type-badge', b.category_type]">
                  {{ b.category_type === "income" ? "Pemasukan" : "Pengeluaran" }}
                </span>
                <p class="budget-period">
                  {{ monthNames[b.month] }} {{ b.year }}
                </p>
              </div>
            </div>
            <div class="budget-amount">Rp {{ formatMoney(b.amount) }}</div>
          </div>
          <div class="budget-progress">
            <div class="progress-info">
              <span :class="['progress-label', b.category_type]">
                {{ b.category_type === "expense" ? "Terpakai" : "Sisa" }} {{ clampProgress(b.progress) }}%
              </span>
              <span class="progress-value">
                {{ b.category_type === "expense"
                  ? "Rp " + formatMoney(b.spent)
                  : "Rp " + formatMoney(Math.max(0, b.amount - b.drawn))
                }} / Rp {{ formatMoney(b.amount) }}
              </span>
            </div>
            <div class="progress-bar">
              <div
                :class="['progress-fill', b.category_type]"
                :style="{ width: clampProgress(b.progress) + '%' }"
              ></div>
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
      <Modal
        v-model="showModal"
        :title="editingId ? 'Edit Budget' : 'Tambah Budget'"
      >
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
            <label class="form-label">Kategori</label>
            <select v-model="form.category_id" class="form-input" required>
              <option value="">Pilih Kategori</option>
              <option
                v-for="c in budgetCategories"
                :key="c.id"
                :value="c.id"
              >
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
                <option v-for="m in 12" :key="m" :value="m">
                  {{ monthNames[m] }}
                </option>
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
            <button type="button" @click="showModal = false" class="btn-cancel">
              Batal
            </button>
            <button type="submit" class="btn-primary">
              {{ editingId ? "Update" : "Simpan" }}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useBudgetStore } from "../stores/budgets";
import { useCategoryStore } from "../stores/categories";
import MainLayout from "../components/MainLayout.vue";
import Modal from "../components/Model.vue";
import AlertMessage from "../components/AlertMessage.vue";
import LoadingSpinner from "../components/LoadingSpinner.vue";
import { Plus, Filter, Pencil, Trash2, PiggyBank, ArrowUpRight, ArrowDownRight } from "lucide-vue-next";

const budgetStore = useBudgetStore();
const categoryStore = useCategoryStore();

const budgets = computed(() => budgetStore.budgets);

const filterMonth = ref(new Date().getMonth() + 1);
const filterYear = ref(new Date().getFullYear());
const showModal = ref(false);
const editingId = ref(null);
const alert = ref({ show: false, message: "", type: "success" });

const form = ref({
  type: "expense",
  category_id: "",
  amount: "",
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
});

const budgetCategories = computed(() =>
  form.value.type === "income"
    ? categoryStore.incomeCategories
    : categoryStore.expenseCategories
);

const monthNames = [
  "",
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const years = computed(() => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 5 }, (_, i) => currentYear - i);
});

const formatMoney = (amount) => new Intl.NumberFormat("id-ID").format(amount);

const clampProgress = (p) => Math.min(Math.max(Number(p) || 0, 0), 100);

const fetchData = () => {
  const params = {};
  if (filterMonth.value) params.month = filterMonth.value;
  if (filterYear.value) params.year = filterYear.value;
  budgetStore.fetchBudgets(params);
};

const openAddModal = () => {
  editingId.value = null;
  form.value = {
    type: "expense",
    category_id: "",
    amount: "",
    month: filterMonth.value || new Date().getMonth() + 1,
    year: filterYear.value || new Date().getFullYear(),
  };
  showModal.value = true;
};

const openEditModal = (budget) => {
  editingId.value = budget.id;
  form.value = {
    type:
      budget.category_type ||
      categoryStore.getCategoryById(budget.category_id)?.type ||
      "expense",
    category_id: budget.category_id,
    amount: budget.amount,
    month: budget.month,
    year: budget.year,
  };
  showModal.value = true;
};

const handleSubmit = async () => {
  try {
    if (editingId.value) {
      await budgetStore.updateBudget(editingId.value, form.value);
      showAlert("Budget berhasil diupdate", "success");
    } else {
      await budgetStore.addBudget(form.value);
      showAlert("Budget berhasil ditambahkan", "success");
    }
    showModal.value = false;
    fetchData();
  } catch (error) {
    showAlert(error.response?.data?.message || "Terjadi kesalahan", "error");
  }
};

const handleDelete = async (id) => {
  if (!confirm("Yakin ingin menghapus budget ini?")) return;
  try {
    await budgetStore.deleteBudget(id);
    showAlert("Budget berhasil dihapus", "success");
  } catch (error) {
    showAlert("Gagal menghapus budget", "error");
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
  fetchData();
});
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

.btn-primary:hover {
  background: #16a34a;
}

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

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
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

.category-type-badge {
  font-size: 11px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 12px;
  width: fit-content;
  margin-top: 6px;
}

.category-type-badge.expense {
  background: #fef2f2;
  color: #ef4444;
}

.category-type-badge.income {
  background: #f0fdf4;
  color: #16a34a;
}

.budget-amount {
  font-size: 18px;
  font-weight: 700;
  color: #16a34a;
}

.budget-progress {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.progress-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
}

.progress-label {
  font-weight: 600;
}

.progress-label.expense { color: #ef4444; }
.progress-label.income { color: #16a34a; }

.progress-value {
  color: #6b7280;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #f3f4f6;
  border-radius: 999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.3s ease;
}

.progress-fill.expense { background: #ef4444; }
.progress-fill.income { background: #22c55e; }

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

.action-btn:hover {
  background: #f3f4f6;
  color: #374151;
}
.action-btn.danger:hover {
  background: #fef2f2;
  color: #ef4444;
  border-color: #fecaca;
}

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
