import { defineStore } from "pinia";
import api from "../services/api";

export const useCategoryStore = defineStore("categories", {
  state: () => ({
    categories: [],
    loading: false,
    error: null,
  }),

  getters: {
    incomeCategories: (state) =>
      state.categories.filter((c) => c.type === "income"),
    expenseCategories: (state) =>
      state.categories.filter((c) => c.type === "expense"),
    getCategoryById: (state) => (id) =>
      state.categories.find((c) => c.id === id),
  },

  actions: {
    async fetchCategories() {
      this.loading = true;
      try {
        const response = await api.get("/api/categories");
        this.categories = response.data.categories;
      } catch (err) {
        this.error = err.response?.data?.message || "Gagal memuat kategori";
      } finally {
        this.loading = false;
      }
    },

    async addCategory(categoryData) {
      try {
        const response = await api.post("/api/categories", categoryData);
        this.categories.push(response.data.category);
        return response.data;
      } catch (err) {
        this.error =
          err.response?.data?.message || "Gagal menambahkan kategori";
        throw err;
      }
    },

    async deleteCategory(id) {
      try {
        await api.delete(`/api/categories/${id}`);
        this.categories = this.categories.filter((c) => c.id !== id);
      } catch (err) {
        this.error = err.response?.data?.message || "Gagal menghapus kategori";
        throw err;
      }
    },
  },
});
