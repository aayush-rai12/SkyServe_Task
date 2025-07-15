<template>
  <div class="register-form">
    <h3>Create Your Account</h3>


    <form @submit.prevent="registerUser" enctype="multipart/form-data">
      <!-- Image Upload Section -->
      <div class="image-upload">
        <label for="image" v-show="!image" class="image-upload-label" title="Upload Profile Image">
          <i class="fa fa-camera" style="color: #34495e;"></i>
          <input type="file" id="image" name="image" ref="fileInput" @change="handleImageUpload" accept="image/*" />
        </label>
        <div v-if="imagePreview" class="image-preview" @click="resetImage">
          <img :src="imagePreview" alt="Profile Image Preview" />
        </div>
      </div>

      <small v-if="errors.image" class="error-text">{{ errors.image }}</small>

      <!-- Name and Email Fields in One Row -->
      <div class="form-group name-email-row">
        <div class="name-field">
          <label for="name">Name</label>
          <input type="text" id="name" v-model="name" placeholder="Enter your name"
            :class="{ 'input-error': errors.name }" />
          <small v-if="errors.name" class="error-text">{{ errors.name }}</small>
        </div>
        <div class="email-field">
          <label for="email">Email</label>
          <input type="email" id="email" v-model="email" placeholder="Enter your email"
            :class="{ 'input-error': errors.email }" />
          <small v-if="errors.email" class="error-text">{{ errors.email }}</small>
        </div>
      </div>

      <!-- Location Section -->
      <div class="form-group">
        <label for="location">Location</label>
        <input type="text" id="location" v-model="location" placeholder="Enter your location"
          :class="{ 'input-error': errors.location }" />
        <small v-if="errors.location" class="error-text">{{ errors.location }}</small>
      </div>

      <!-- Password and Confirm Password in One Row -->
      <div class="form-group password-row">
        <div class="password-field">
          <label for="password">Password</label>
          <input type="password" id="password" v-model="password" placeholder="Enter your password"
            :class="{ 'input-error': errors.password }" />
          <small v-if="errors.password" class="error-text">{{ errors.password }}</small>
        </div>
        <div class="password-field">
          <label for="confirmPassword">Confirm Password</label>
          <input type="password" id="confirmPassword" v-model="confirmPassword" placeholder="Confirm your password"
            :class="{ 'input-error': errors.confirmPassword }" />
          <small v-if="errors.confirmPassword" class="error-text">{{ errors.confirmPassword }}</small>
        </div>
      </div>

      <!-- Submit Button -->
      <button type="submit" :disabled="isSubmitting" class="submit-btn">
        {{ isSubmitting ? 'Submitting...' : 'Register' }}
      </button>

      <!--  Success and Error Messages  -->
      <p v-if="successMessage" class="success">{{ successMessage }}</p>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </form>

    <!-- Login Link  -->
    <p class="login-link">
      Already have an account?
      <router-link to="/login">Login</router-link>
    </p>
  </div>
</template>

<script>
import apiClient from '../../utils/apiClient';

export default {
  data() {
    return {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      location: '',
      image: null,
      imagePreview: null,
      successMessage: '',
      errorMessage: '',
      isSubmitting: false,
      errors: {},
    };
  },
  methods: {
    validateForm() {
      let isValid = true;
      this.errors = {};

      if (!this.name) {
        this.errors.name = 'Name is required';
        isValid = false;
      }

      if (!this.email) {
        this.errors.email = 'Email is required';
        isValid = false;
      } else if (!this.validateEmail(this.email)) {
        this.errors.email = 'Invalid email address';
        isValid = false;
      }

      if (!this.password) {
        this.errors.password = 'Password is required';
        isValid = false;
      } else if (this.password.length < 6) {
        this.errors.password = 'Password must be at least 6 characters';
        isValid = false;
      }

      if (this.password !== this.confirmPassword) {
        this.errors.confirmPassword = 'Passwords must match';
        isValid = false;
      }

      if (!this.location) {
        this.errors.location = 'Location is required';
        isValid = false;
      }

      if (!this.image) {
        this.errors.image = 'Profile image is required';
        isValid = false;
      }

      return isValid;
    },

    validateEmail(email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    },

    resetImage() {
      // Ensure that the file input element is available before triggering the file dialog
      if (this.$refs.fileInput) {
        this.$refs.fileInput.click();  // Trigger the file input dialog
      } 
    },

    handleImageUpload(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          this.imagePreview = reader.result;  // Set the preview for the image
        };
        reader.readAsDataURL(file);
        this.image = file;  // Store the file for later use

        // Reset the input value after the upload to allow re-upload
        event.target.value = '';
      }
    },


    async registerUser() {
      if (!this.validateForm()) return;

      this.isSubmitting = true;
      this.successMessage = '';
      this.errorMessage = '';

      try {
        // Create FormData object
        const formData = new FormData();
        formData.append('name', this.name);
        formData.append('email', this.email);
        formData.append('password', this.password);
        formData.append('location', this.location);
        formData.append('image', this.image);
        const response = await apiClient.post('/users/register',formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        this.successMessage = 'Registration successful! Redirecting to Login...';
        this.resetForm();

        setTimeout(() => this.$router.push('/login'), 2000); // Delay before redirect
      } catch (error) {
        this.errorMessage = error.response?.data?.message || 'Registration failed!';
      } finally {
        this.isSubmitting = false;
      }
    },

    resetForm() {
      this.name = '';
      this.email = '';
      this.password = '';
      this.confirmPassword = '';
      this.location = '';
      this.image = null;
      this.imagePreview = null;
      this.errors = {};
    },
  },
};
</script>

<style scoped>
.register-form {
  max-width: 450px;
  margin: 0 auto;
  padding: 30px;
  background-color: #34495e;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  font-family: 'Arial', sans-serif;
  color: white;
  overflow: hidden;
}

h2 {
  text-align: center;
  font-size: 24px;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 5px;
  color: #a2a0a0;
}

input,
textarea {
  width: 100%;
  padding: 10px;
  font-size: 14px;
  border: 1px solid #ddd;
  border-radius: 5px;
  box-sizing: border-box;
  transition: all 0.3s ease;
}

input:focus,
textarea:focus {
  border-color: #007bff;
}

input.input-error,
textarea.input-error {
  border-color: #ff4d4d;
}

small {
  color: #ff4d4d;
  font-size: 12px;
  margin: 1%;
}

.submit-btn {
  width: 100%;
  padding: 12px;
  font-size: 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.submit-btn:hover {
  background-color: #0056b3;
}

.submit-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.success {
  color: green;
  font-size: 14px;
  text-align: center;
}

.error {
  color: red;
  font-size: 14px;
  text-align: center;
}

.login-link a {
  color: #007bff;
  text-decoration: none;
  font-weight: bold;
  transition: color 0.3s ease;
}

.login-link a:hover {
  color: #0056b3;
}

.image-upload {
  text-align: center;
  /* margin-bottom: 5px; */
}

.image-upload-label {
  display: inline-block;
  cursor: pointer;
  font-size: 24px;
  color: #a2a0a0;
  background-color: #fff;
  padding: 1%;
  border-radius: 35%;
}

.image-upload input[type="file"] {
  display: none;
}

.image-preview {
  margin-top: 10px;
  text-align: center;
}

.image-preview img {
  max-width: 150px;
  max-height: 110px;
  border-radius: 40px;
  object-fit: cover;
}

/* Name and Email Fields in the same row */
.name-email-row {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.name-field,
.email-field {
  flex: 1;
}

.name-field input,
.email-field input {
  width: 100%;
}

/* Password and Confirm Password in the same row */
.password-row {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.password-field {
  flex: 1;
}

.password-field input {
  width: 100%;
}
</style>