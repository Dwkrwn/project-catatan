import { defineStore } from "pinia";
import api from "../services/api";

export const useBudgetStore = defineStore("budgets", {
  state: () => ({
    budgets: [],
    loading: false,
    error: null,
  }),

  getters: {
    totalBudget: (state) =>
      state.budgets.reduce((sum, b) => sum + parseFloat(b.amount), 0),
  },

  actions: {
    async fetchBudgets(params = {}) {
      this.loading = true;
      try {
        const response = await api.get("/api/budgets", { params });
        this.budgets = response.data.budgets;
      } catch (err) {
        this.error = err.response?.data?.message || "Gagal memuat budget";
      } finally {
        this.loading = false;
      }
    },

    async addBudget(budgetData) {
      try {
        const response = await api.post("/api/budgets", budgetData);
        this.budgets.push(response.data.budget);
        return response.data;
      } catch (err) {
        this.error = err.response?.data?.message || "Gagal menambahkan budget";
        throw err;
      }
    },

    async updateBudget(id, budgetData) {
      try {
        const response = await api.put(`/api/budgets/${id}`, budgetData);
        const index = this.budgets.findIndex((b) => b.id === id);
        if (index !== -1) {
          this.budgets[index] = response.data.budget;
        }
        return response.data;
      } catch (err) {
        this.error = err.response?.data?.message || "Gagal mengupdate budget";
        throw err;
      }
    },

    async deleteBudget(id) {
      try {
        await api.delete(`/api/budgets/${id}`);
        this.budgets = this.budgets.filter((b) => b.id !== id);
      } catch (err) {
        this.error = err.response?.data?.message || "Gagal menghapus budget";
        throw err;
      }
    },
  },
});
