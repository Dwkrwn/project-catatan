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
          <select v-model="filterType" class="filter-select">
            <option value="">Semua Tipe</option>
            <option value="income">Pemasukan</option>
            <option value="expense">Pengeluaran</option>
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
                {{ t.category_name || 'Tanpa kategori' }} &middot; {{ formatDate(t.transaction_date ?? t.date) }}
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
import Modal from '../components/Model.vue'
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
const filterType = ref('')
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
  if (filterType.value) params.type = filterType.value
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
    date: transaction.transaction_date?.split('T')[0]
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