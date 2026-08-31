<template>
  <MainLayout>
    <div class="dashboard">
      <!-- Filter Bulan/Tahun -->
      <div class="page-actions">
        <div class="filter-group">
          <select v-model="selectedMonth" class="filter-select" @change="fetchData">
            <option v-for="m in 12" :key="m" :value="m">
              {{ monthNames[m] }}
            </option>
          </select>
          <select v-model="selectedYear" class="filter-select" @change="fetchData">
            <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
          </select>
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="summary-cards">
        <div class="summary-card income">
          <div class="card-icon">
            <TrendingUp :size="22" color="#16a34a" />
          </div>
          <div class="card-info">
            <p class="card-label">Total Income</p>
            <p class="card-value green">
              Rp {{ formatMoney(summary?.totalIncome || 0) }}
            </p>
          </div>
        </div>

        <div class="summary-card expense">
          <div class="card-icon">
            <TrendingDown :size="22" color="#ef4444" />
          </div>
          <div class="card-info">
            <p class="card-label">Total Expense</p>
            <p class="card-value red">
              Rp {{ formatMoney(summary?.totalExpense || 0) }}
            </p>
          </div>
        </div>

        <div class="summary-card balance">
          <div class="card-icon">
            <Wallet :size="22" color="#22c55e" />
          </div>
          <div class="card-info">
            <p class="card-label">Saldo</p>
            <p class="card-value">
              Rp {{ formatMoney(summary?.balance || 0) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Summary by Category -->
      <div class="section-card">
        <div class="section-header">
          <h2 class="section-title">Ringkasan per Kategori</h2>
          <span class="badge">{{ selectedMonthName }} {{ selectedYear }}</span>
        </div>

        <div class="tab-group">
          <button
            type="button"
            :class="['tab', { active: categoryTab === 'expense' }]"
            @click="categoryTab = 'expense'"
          >
            Pengeluaran
          </button>
          <button
            type="button"
            :class="['tab income', { active: categoryTab === 'income' }]"
            @click="categoryTab = 'income'"
          >
            Pemasukan
          </button>
        </div>

        <div v-if="categoryList.length === 0" class="empty-state">
          <PieChart :size="48" color="#d1d5db" />
          <p>
            Belum ada data {{ categoryTab === "income" ? "pemasukan" : "pengeluaran" }}
            pada bulan terpilih
          </p>
        </div>

        <div v-else class="category-list">
          <div
            v-for="item in categoryList"
            :key="item.category_name"
            class="category-item"
          >
            <div class="category-left">
              <div class="category-dot"></div>
              <span class="category-name">{{ item.category_name }}</span>
            </div>
            <div class="category-right">
              <span class="category-count"
                >{{ item.transaction_count }} transaksi</span
              >
              <span class="category-amount"
                >Rp {{ formatMoney(item.total) }}</span
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useTransactionStore } from "../stores/transactions";
import MainLayout from "../components/MainLayout.vue";
import { TrendingUp, TrendingDown, Wallet, PieChart } from "lucide-vue-next";

const transactionStore = useTransactionStore();

const summary = computed(() => transactionStore.summary);
const expenseByCategory = computed(() => transactionStore.expenseByCategory);
const incomeByCategory = computed(() => transactionStore.incomeByCategory);

const selectedMonth = ref(new Date().getMonth() + 1);
const selectedYear = ref(new Date().getFullYear());
const categoryTab = ref("expense");

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
const selectedMonthName = computed(() => monthNames[selectedMonth.value]);

const years = computed(() => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 5 }, (_, i) => currentYear - i);
});

const categoryList = computed(() =>
  categoryTab.value === "income" ? incomeByCategory.value : expenseByCategory.value
);

const formatMoney = (amount) => {
  return new Intl.NumberFormat("id-ID").format(amount);
};

const fetchData = () => {
  const params = { month: selectedMonth.value, year: selectedYear.value };
  Promise.all([
    transactionStore.fetchSummary(params),
    transactionStore.fetchExpenseByCategory(params),
    transactionStore.fetchIncomeByCategory(params),
  ]);
};

onMounted(fetchData);
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.page-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
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

.tab-group {
  display: flex;
  gap: 4px;
  background: #f3f4f6;
  padding: 4px;
  border-radius: 8px;
  margin-bottom: 20px;
  width: fit-content;
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

.summary-card.income .card-icon {
  background: #f0fdf4;
}
.summary-card.expense .card-icon {
  background: #fef2f2;
}
.summary-card.balance .card-icon {
  background: #f0fdf4;
}

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

.card-value.green {
  color: #16a34a;
}
.card-value.red {
  color: #ef4444;
}

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
