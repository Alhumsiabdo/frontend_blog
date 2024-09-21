<template>
    <div>
        <h1 class="text-2xl font-bold mb-4">Categories List</h1>

        <!-- Button to open modal -->
        <button class="btn btn-primary mb-4" @click="openAddModal()">Add Category</button>

        <!-- Categories Table -->
        <div v-if="categories.length > 0">
            <table class="table-auto w-full border-collapse border border-gray-200">
                <thead>
                    <tr class="bg-gray-100">
                        <th class="border px-4 py-2">#</th>
                        <th class="border px-4 py-2">Name</th>
                        <th class="border px-4 py-2">Slug</th>
                        <th class="border px-4 py-2">Created At</th>
                        <th class="border px-4 py-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(category, index) in categories" :key="category.id">
                        <td class="border px-4 py-2">{{ index + 1 }}</td>
                        <td class="border px-4 py-2">{{ category.name }}</td>
                        <td class="border px-4 py-2">{{ category.slug }}</td>
                        <td class="border px-4 py-2">{{ category.created_at }}</td>
                        <td class="border px-4 py-2">
                            <button class="btn btn-warning mr-2" @click="openEditModal(category)">Edit</button>
                            <button class="btn btn-danger mr-2" @click="confirmDelete(category.id)">Delete</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- No categories message -->
        <div v-else>
            <p>No categories found. Add some categories to display them here.</p>
        </div>

        <!-- Add Category Modal -->
        <div v-if="showAddModal" class="modal">
            <div class="modal-content">
                <h2 class="text-xl font-bold mb-4">Add Category</h2>
                <form @submit.prevent="addCategory">
                    <div class="mb-4">
                        <label for="name" class="block text-gray-700">Name :</label>
                        <input type="text" id="name" v-model="newCategory.name" class="input">
                    </div>
                    <div class="flex justify-end">
                        <button type="button" class="btn btn-danger mr-2" @click="closeAddModal">Cancel</button>
                        <button type="submit" class="btn btn-primary">Save</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Edit Category Modal -->
        <div v-if="showEditModal" class="modal">
            <div class="modal-content">
                <h2 class="text-xl font-bold mb-4">Edit Category</h2>
                <form @submit.prevent="updateCategory">
                    <div class="mb-4">
                        <label for="editName" class="block text-gray-700">Name :</label>
                        <input type="text" id="editName" v-model="currentCategory.name" class="input">
                    </div>
                    <div class="flex justify-end">
                        <button type="button" class="btn btn-danger mr-2" @click="closeEditModal">Cancel</button>
                        <button type="submit" class="btn btn-primary">Update</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Delete Confirmation Modal -->
        <div v-if="showDeleteModal" class="modal">
            <div class="modal-content">
                <h2 class="text-xl font-bold mb-4">Delete Category</h2>
                <h4>Are you sure you want to delete this category?</h4>
                <button class="btn btn-danger mr-2" type="button" @click="deleteCategory">Yes, Delete</button>
                <button class="btn btn-warning mr-2" type="button" @click="closeDeleteModal">Cancel</button>
            </div>
        </div>

    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import toastr from 'toastr'
import 'toastr/build/toastr.min.css'

// Reactive variables
const categories = ref([])
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const newCategory = ref({ name: '' })
const currentCategory = ref({ id: '', name: '' })
const categoryToDelete = ref(null)

// Fetch categories from the API
const fetchCategories = async () => {
    try {
        const token = localStorage.getItem('token')
        const response = await axios.get('http://127.0.0.1:8000/api/auth/categories', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        categories.value = response.data.data
    } catch (error) {
        toastr.error('Failed to load categories.')
        console.error('Error fetching categories:', error)
    }
}

// Add new category
const addCategory = async () => {
    try {
        const token = localStorage.getItem('token')
        const response = await axios.post('http://127.0.0.1:8000/api/auth/category/create', newCategory.value, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        categories.value.push(response.data)
        toastr.success('Category added successfully.')
        closeAddModal()
        fetchCategories()
    } catch (error) {
        toastr.error('Failed to add category.')
        console.error('Error adding category:', error)
    }
}

// Update existing category
const updateCategory = async () => {
    try {
        const token = localStorage.getItem('token')
        const response = await axios.put(`http://127.0.0.1:8000/api/auth/category/edit/${currentCategory.value.id}`, currentCategory.value, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        const index = categories.value.findIndex(cat => cat.id === currentCategory.value.id)
        if (index !== -1) {
            categories.value[index] = response.data
        }
        toastr.success('Category updated successfully.')
        closeEditModal()
        fetchCategories()
    } catch (error) {
        toastr.error('Failed to update category.')
        console.error('Error updating category:', error)
    }
}

// Open the confirmation modal for deleting a category
const confirmDelete = (categoryId) => {
    categoryToDelete.value = categoryId // Store the category ID
    showDeleteModal.value = true // Show the delete confirmation modal
}

// Delete category
const deleteCategory = async () => {
    try {
        const token = localStorage.getItem('token')
        await axios.delete(`http://127.0.0.1:8000/api/auth/category/destroy/${categoryToDelete.value}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        toastr.success('Category deleted successfully.')
        fetchCategories() // Fetch updated categories after deletion
        closeDeleteModal() // Close the delete confirmation modal
    } catch (error) {
        toastr.error('Failed to delete category.')
        console.error('Error deleting category:', error)
    }
}

// Modal controls
const openAddModal = () => {
    showAddModal.value = true
}
const closeAddModal = () => {
    showAddModal.value = false
    newCategory.value = { name: '' } // Reset form
}

const openEditModal = (category) => {
    currentCategory.value = { ...category } // Copy category data
    showEditModal.value = true
}
const closeEditModal = () => {
    showEditModal.value = false
    currentCategory.value = { id: '', name: '' } // Reset form
}
const closeDeleteModal = () => {
    showDeleteModal.value = false // Close the delete confirmation modal
}

// Fetch categories on component mount
onMounted(() => {
    fetchCategories()
})
</script>


<style scoped>
.input {
    padding: 8px;
    border: 1px solid #ccc;
    width: 100%;
}

.btn {
    padding: 8px 12px;
    margin-right: 8px;
    cursor: pointer;
}

.btn-primary {
    background-color: #3490dc;
    color: #fff;
}

.btn-warning {
    background-color: #ffed4a;
}

.btn-danger {
    background-color: #e3342f;
    color: #fff;
}

.table-auto {
    width: 100%;
    border-collapse: collapse;
}

.table-auto th,
.table-auto td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
}

.modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
}

.modal-content {
    background: white;
    padding: 20px;
    border-radius: 5px;
    width: 400px;
}
</style>