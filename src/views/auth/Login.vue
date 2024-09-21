<template>
    <form @submit.prevent="login">
        <div class="grid gap-6">
            <!-- Email input -->
            <div class="space-y-2">
                <Label for="email" value="Email" />
                <InputIconWrapper>
                    <template #icon>
                        <MailIcon aria-hidden="true" class="w-5 h-5" />
                    </template>
                    <Input withIcon id="email" type="email" class="block w-full" placeholder="Email"
                        v-model="loginForm.email" required autofocus autocomplete="username" />
                </InputIconWrapper>
            </div>

            <!-- Password input -->
            <div class="space-y-2">
                <Label for="password" value="Password" />
                <InputIconWrapper>
                    <template #icon>
                        <LockClosedIcon aria-hidden="true" class="w-5 h-5" />
                    </template>
                    <Input withIcon id="password" type="password" class="block w-full" placeholder="Password"
                        v-model="loginForm.password" required autocomplete="current-password" />
                </InputIconWrapper>
            </div>

            <!-- Remember me -->
            <div class="flex items-center justify-between">
                <label class="flex items-center">
                    <Checkbox name="remember" v-model:checked="loginForm.remember" />
                    <span class="ml-2 text-sm text-gray-600">Remember me</span>
                </label>

                <router-link :to="{ name: 'ForgotPassword' }" class="text-sm text-blue-500 hover:underline">Forgot your
                    password?</router-link>
            </div>

            <!-- Login button -->
            <div>
                <Button type="submit" class="justify-center w-full gap-2" :disabled="loginForm.processing"
                    v-slot="{ iconSizeClasses }">
                    <LoginIcon aria-hidden="true" :class="iconSizeClasses" />
                    <span>Log in</span>
                </Button>
            </div>

            <!-- Register link -->
            <p class="text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?
                <router-link :to="{ name: 'Register' }" class="text-blue-500 hover:underline">Register</router-link>
            </p>
        </div>
    </form>
</template>

<script setup>
import { reactive, ref } from 'vue'
import axios from 'axios'
import toastr from 'toastr'
import 'toastr/build/toastr.min.css' // Import Toastr CSS
import { useRouter } from 'vue-router'
import InputIconWrapper from '@/components/InputIconWrapper.vue'
import Label from '@/components/Label.vue'
import Input from '@/components/Input.vue'
import Checkbox from '@/components/Checkbox.vue'
import Button from '@/components/Button.vue'
import { MailIcon, LockClosedIcon, LoginIcon } from '@heroicons/vue/outline'

const router = useRouter()

const loginForm = reactive({
    email: '',
    password: '',
    remember: false,
    processing: false
})

const login = async () => {
    loginForm.processing = true
    try {
        const response = await axios.post('http://127.0.0.1:8000/api/auth/login', {
            email: loginForm.email,
            password: loginForm.password,
            remember: loginForm.remember
        })

        // Save the JWT token
        const token = localStorage.setItem('token', response.data.access_token)

        // Show success message
        toastr.success('Login successful')

        // Redirect to the dashboard
        router.push({ name: 'Dashboard' })
    } catch (error) {
        // Handle errors and show error message
        console.error('Login error:', error.response.data)
        toastr.error(error.response.data.error || 'Login failed. Please try again.')
    } finally {
        loginForm.processing = false
    }
}
</script>
