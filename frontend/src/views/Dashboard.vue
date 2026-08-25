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
          <div
            v-for="item in expenseByCategory"
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

const currentMonth = new Date().getMonth() + 1;
const currentYear = new Date().getFullYear();

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
const currentMonthName = computed(() => monthNames[currentMonth]);

const formatMoney = (amount) => {
  return new Intl.NumberFormat("id-ID").format(amount);
};

onMounted(async () => {
  await Promise.all([
    transactionStore.fetchSummary({ month: currentMonth, year: currentYear }),
    transactionStore.fetchExpenseByCategory({
      month: currentMonth,
      year: currentYear,
    }),
  ]);
});
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
