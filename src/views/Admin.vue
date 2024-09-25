<template>
    <div>
        <h1 class="text-2xl font-bold mb-4">Admins List</h1>

        <!-- Button to open modal -->
        <button class="btn btn-primary mb-4" @click="openAddModal()">Add Admin</button>

        <!-- Admins Table -->
        <div v-if="admins.length > 0">
            <table class="table-auto w-full border-collapse border border-gray-200">
                <thead>
                    <tr class="bg-gray-100">
                        <th class="border px-4 py-2">#</th>
                        <th class="border px-4 py-2">Name</th>
                        <th class="border px-4 py-2">Email</th>
                        <th class="border px-4 py-2">Created At</th>
                        <th class="border px-4 py-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(admin, index) in admins" :key="admin.id">
                        <td class="border px-4 py-2">{{ index + 1 }}</td>
                        <td class="border px-4 py-2">{{ admin.name }}</td>
                        <td class="border px-4 py-2">{{ admin.email }}</td>
                        <td class="border px-4 py-2">{{ admin.created_at }}</td>
                        <td class="border px-4 py-2">
                            <button class="btn btn-warning mr-2" @click="openEditModal(admin)">Edit</button>
                            <button class="btn btn-danger mr-2" @click="confirmDelete(admin.id)">Delete</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- No admin message -->
        <div v-else>
            <p>No admins found. Add some admins to display them here.</p>
        </div>

        <!-- Add Admin Modal -->
        <div v-if="showAddModal" class="modal">
            <div class="modal-content">
                <h2 class="text-xl font-bold mb-4">Add Admin</h2>
                <form @submit.prevent="addAdmin()">
                    <div class="mb-4">
                        <label for="name" class="block text-gray-700">Name :</label>
                        <input type="text" id="name" v-model="newAdmin.name" class="input">
                        <p v-if="errors.name" class="text-red-500 text-xs">{{ errors.name[0] }}</p> <!-- Show error -->
                    </div>
                    <div class="mb-4">
                        <label for="email" class="block text-gray-700">Email :</label>
                        <input type="email" id="email" v-model="newAdmin.email" class="input">
                        <p v-if="errors.email" class="text-red-500 text-xs">{{ errors.email[0] }}</p>
                        <!-- Show error -->
                    </div>
                    <div class="mb-4">
                        <label for="password" class="block text-gray-700">Password :</label>
                        <div class="flex items-center">
                            <input :type="isPasswordVisible ? 'text' : 'password'" id="password"
                                v-model="newAdmin.password" class="input flex-grow" />
                            <button type="button" @click="togglePasswordVisibility"
                                class="ml-2 text-gray-500 hover:text-gray-700">
                                {{ isPasswordVisible ? 'Hide' : 'Show' }}
                            </button>
                        </div>
                        <p v-if="errors.password" class="text-red-500 text-xs">{{ errors.password[0] }}</p>
                        <!-- Show error -->
                    </div>
                    <div class="flex justify-end">
                        <button type="button" class="btn btn-danger mr-2" @click="closeAddModal">Cancel</button>
                        <button type="submit" class="btn btn-primary">Save</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Edit Admin Modal -->
        <div v-if="showEditModal" class="modal">
            <div class="modal-content">
                <h2 class="text-xl font-bold mb-4">Edit Admin</h2>
                <form @submit.prevent="updateAdmin">
                    <div class="mb-4">
                        <label for="editName" class="block text-gray-700">Name :</label>
                        <input type="text" id="editName" v-model="currentAdmin.name" class="input">
                        <p v-if="errors.name" class="text-red-500 text-xs">{{ errors.name[0] }}</p> <!-- Show error -->
                    </div>
                    <div class="mb-4">
                        <label for="editEmail" class="block text-gray-700">Email :</label>
                        <input type="text" id="editEmail" v-model="currentAdmin.email" class="input">
                        <p v-if="errors.email" class="text-red-500 text-xs">{{ errors.email[0] }}</p>
                    </div>
                    <div class="mb-4">
                        <label for="editPassword" class="block text-gray-700">Password :</label>
                        <div class="flex items-center">
                            <input :type="isPasswordVisible ? 'text' : 'password'" id="editPassword"
                                v-model="currentAdmin.password" class="input flex-grow" />
                            <button type="button" @click="togglePasswordVisibility"
                                class="ml-2 text-gray-500 hover:text-gray-700">
                                {{ isPasswordVisible ? 'Hide' : 'Show' }}
                            </button>
                        </div>
                        <p v-if="errors.password" class="text-red-500 text-xs">{{ errors.password[0] }}</p>
                        <!-- Show error -->
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
                <h2 class="text-xl font-bold mb-4">Delete Admin</h2>
                <h4>Are you sure you want to delete this Admin?</h4>
                <button class="btn btn-danger mr-2" type="button" @click="deleteAdmin">Yes, Delete</button>
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
const admins = ref([])
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const newAdmin = ref({ name: '', email: '', password: '' })
const currentAdmin = ref({ id: '', name: '', email: '', password: '' })
const adminToDelete = ref(null)
const isPasswordVisible = ref(false);
const errors = ref({
    name: null,
    email: null,
    password: null,
});

// Fetch Admins from the API
const fetchAdmins = async () => {
    try {
        const token = localStorage.getItem('token')
        const response = await axios.get('http://127.0.0.1:8000/api/auth/admins', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        admins.value = response.data.data.data
    } catch (error) {
        toastr.error('Failed to load admins.')
        console.error('Error fetching admins:', error)
    }
}

// Add new Admin
const addAdmin = async () => {
    errors.value = { name: null, email: null, password: null };
    try {
        const token = localStorage.getItem('token')
        const response = await axios.post('http://127.0.0.1:8000/api/auth/admin/create', newAdmin.value, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        admins.value.push(response.data)
        toastr.success('Admin added successfully.')
        closeAddModal()
        fetchAdmins()
    } catch (error) {
        if (error.response && error.response.data.errors) {
            errors.value = error.response.data.errors; // Capture validation errors
        } else {
            toastr.error('Failed to add admin.');
        }
        console.error('Error adding admin:', error);
    }
}

// Update existing Admin
const updateAdmin = async () => {
    errors.value = { name: null, email: null, password: null };
    try {
        const token = localStorage.getItem('token')
        const response = await axios.post(`http://127.0.0.1:8000/api/auth/admin/edit/${currentAdmin.value.id}`, currentAdmin.value, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        const index = admins.value.findIndex(adm => adm.id === currentAdmin.value.id)
        if (index !== -1) {
            admins.value[index] = response.data
        }
        toastr.success('Admin updated successfully.')
        closeEditModal()
        fetchAdmins()
    } catch (error) {
        if (error.response && error.response.data.errors) {
            errors.value = error.response.data.errors; // Capture validation errors
        } else {
            toastr.error('Failed to update admin.');
        }
        console.error('Error updating admin:', error);
    }
}

// Open the confirmation modal for deleting a Admin
const confirmDelete = (adminId) => {
    adminToDelete.value = adminId // Store the Admin ID
    showDeleteModal.value = true // Show the delete confirmation modal
}

// Delete Admin
const deleteAdmin = async () => {
    try {
        const token = localStorage.getItem('token')
        await axios.delete(`http://127.0.0.1:8000/api/auth/admin/destroy/${adminToDelete.value}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        toastr.success('Admin deleted successfully.')
        fetchAdmins() // Fetch updated admins after deletion
        closeDeleteModal() // Close the delete confirmation modal
    } catch (error) {
        toastr.error('Failed to delete admin.')
        console.error('Error deleting admin:', error)
    }
}

// Modal controls
const openAddModal = () => {
    showAddModal.value = true
}
const closeAddModal = () => {
    showAddModal.value = false
    newAdmin.value = { name: '' } // Reset form
}

const openEditModal = (admin) => {
    currentAdmin.value = { ...admin } // Copy admin data
    showEditModal.value = true
}
const closeEditModal = () => {
    showEditModal.value = false
    currentAdmin.value = { id: '', name: '', email: '', password: '' } // Reset form
}
const closeDeleteModal = () => {
    showDeleteModal.value = false // Close the delete confirmation modal
}

// Toggle password visibility
const togglePasswordVisibility = () => {
    isPasswordVisible.value = !isPasswordVisible.value;
};

// Fetch admins on component mount
onMounted(() => {
    fetchAdmins()
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