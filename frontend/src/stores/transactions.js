import { defineStore } from "pinia";
import api from "../services/api";

export const useTransactionStore = defineStore("transactions", {
  state: () => ({
    transactions: [],
    summary: null,
    expenseByCategory: [],
    loading: false,
    error: null,
  }),

  getters: {
    totalTransactions: (state) => state.transactions.length,
  },

  actions: {
    async fetchTransactions(params = {}) {
      this.loading = true;
      try {
        const response = await api.get("/api/transactions", { params });
        this.transactions = response.data.transactions;
      } catch (err) {
        this.error = err.response?.data?.message || "Gagal memuat transaksi";
      } finally {
        this.loading = false;
      }
    },

    async addTransaction(transactionData) {
      try {
        const response = await api.post("/api/transactions", transactionData);
        this.transactions.unshift(response.data.transaction);
        return response.data;
      } catch (err) {
        this.error =
          err.response?.data?.message || "Gagal menambahkan transaksi";
        throw err;
      }
    },

    async updateTransaction(id, transactionData) {
      try {
        const response = await api.put(
          `/api/transactions/${id}`,
          transactionData,
        );
        const index = this.transactions.findIndex((t) => t.id === id);
        if (index !== -1) {
          this.transactions[index] = response.data.transaction;
        }
        return response.data;
      } catch (err) {
        this.error =
          err.response?.data?.message || "Gagal mengupdate transaksi";
        throw err;
      }
    },

    async deleteTransaction(id) {
      try {
        await api.delete(`/api/transactions/${id}`);
        this.transactions = this.transactions.filter((t) => t.id !== id);
      } catch (err) {
        this.error = err.response?.data?.message || "Gagal menghapus transaksi";
        throw err;
      }
    },

    async fetchSummary(params = {}) {
      try {
        const response = await api.get("/api/transactions/summary", { params });
        this.summary = response.data;
      } catch (err) {
        this.error = err.response?.data?.message || "Gagal memuat ringkasan";
      }
    },

    async fetchExpenseByCategory(params = {}) {
      try {
        const response = await api.get("/api/transactions/summary/category", {
          params,
        });
        this.expenseByCategory = response.data.categories;
      } catch (err) {
        this.error =
          err.response?.data?.message || "Gagal memuat data kategori";
      }
    },
  },
});
