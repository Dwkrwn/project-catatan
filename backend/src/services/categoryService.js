const ApiError = require('../utils/ApiError');
const categoryModel = require('../models/categoryModel');

const getCategories = async (userId) => {
    const categories = await categoryModel.getAll(userId);
    return { count: categories.length, categories };
};

const addCategory = async (userId, body) => {
    const { name, type, icon } = body;

    if (!name || !type) {
        throw new ApiError(400, 'Name dan type wajib diisi');
    }

    const category = await categoryModel.create(name, type, icon, userId);

    return {
        message: 'Kategori berhasil ditambahkan',
        category,
    };
};

const deleteCategory = async (userId, categoryId) => {
    const category = await categoryModel.remove(categoryId, userId);
    if (!category) {
        throw new ApiError(404, 'Category tidak ditemukan');
    }

    return { message: 'Category berhasil dihapus' };
};

module.exports = {
    getCategories,
    addCategory,
    deleteCategory,
};
