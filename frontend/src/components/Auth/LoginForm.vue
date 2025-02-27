<template>
  <div class="login-form">
    <h2>Login to Your Account</h2>
    <form @submit.prevent="loginUser">
      <div class="form-group">
        <label for="email">Email</label>
        <input type="email" id="email" v-model="email" placeholder="Enter your email"
          :class="{ 'input-error': errors.email }" />
        <small v-if="errors.email" class="error-text">{{ errors.email }}</small>
      </div>

      <div class="form-group">
        <label for="password">Password</label>
        <input type="password" id="password" v-model="password" placeholder="Enter your password"
          :class="{ 'input-error': errors.password }" />
        <small v-if="errors.password" class="error-text">{{ errors.password }}</small>
      </div>

      <button type="submit" :disabled="isSubmitting" class="submit-btn">
        {{ isSubmitting ? 'Logging In...' : 'Login' }}
      </button>

      <p v-if="successMessage" class="success">{{ successMessage }}</p>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </form>
    <p class="register-link">
      Don't have an account? 
      <router-link to="/register">Register</router-link>
    </p>
  </div>
</template>

<script>
import apiClient from '../../utils/apiClient';

export default {
  data() {
    return {
      email: '',
      password: '',
      successMessage: '',
      errorMessage: '',
      isSubmitting: false,
      errors: {},
    };
  },
  mounted() {
    // Check if session has expired when the page loads
    if (this.isSessionExpired()) {
      console.log('Session expired! Logging out...');
      this.logout();
    }
  },
  methods: {
    // Validate form fields
    validateForm() {
      let isValid = true;
      this.errors = {};

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
      }

      return isValid;
    },

    // Validate email format
    validateEmail(email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    },

    // Login user and manage session
    async loginUser() {
      if (!this.validateForm()) return;

      this.isSubmitting = true;
      this.successMessage = '';
      this.errorMessage = '';

      try {
        const response = await apiClient.post('/users/login', {
          email: this.email,
          password: this.password,
        });

        // alert('Login successfulllllyyy!');
        const { user, token, expiresIn } = response.data;

        // Calculate expiration time (expiresIn is in seconds, convert to milliseconds)
        const expiryTime = new Date().getTime() + expiresIn * 1000;
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', token);
        localStorage.setItem('tokenExpiry', expiryTime);

        this.successMessage = 'Login successful!';
        this.$router.push('/dashboard');

        // Automatically log out after expiresIn seconds
        setTimeout(() => {
          console.log('Session expired! Logging outtest...');
          this.logout();
        }, expiresIn * 1000); // expiresIn is in seconds
      } catch (error) {
        this.errorMessage = error.response?.data?.message || 'Login failed!';
      } finally {
        this.isSubmitting = false;
      }
    },

    isSessionExpired() {
      const tokenExpiry = localStorage.getItem('tokenExpiry');
      if (!tokenExpiry) return true;

      const currentTime = new Date().getTime();
      return currentTime > parseInt(tokenExpiry);
    },

    // Logout user and clear session data
    logout() {
      console.log('Logging out...');
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('tokenExpiry');
      this.$router.push('/login');
    }
  }
};
</script>

<style scoped>
/* Container Styling */
.login-form {
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
  background: #34495e;
  border: 1px solid #ddd;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

/* Heading */
.login-form h2 {
  margin-bottom: 20px;
  font-size: 24px;
  font-weight: bold;
  color: #fff;
  text-align: center;
}

/* Form Groups */
.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  font-size: 14px;
  color: #a2a0a0;
  margin-bottom: 5px;
}

.form-group input {
  width: 96%;
  padding: 10px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 5px;
  transition: border-color 0.3s ease;
}

/* Input Focus */
.form-group input:focus {
  border-color: #007bff;
  outline: none;
  box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
}

/* Error Styling */
.input-error {
  border-color: #dc3545 !important;
}

.error-text {
  color: #dc3545;
  font-size: 12px;
  margin-top: 5px;
}

/* Submit Button */
.submit-btn {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  color: #fff;
  background-color: #007bff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.submit-btn:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.submit-btn:hover:not(:disabled) {
  background-color: #0056b3;
}

/* Success and Error Messages */
.success {
  color: #28a745;
  font-size: 14px;
  text-align: center;
  margin-top: 15px;
}

.error {
  color: #dc3545;
  font-size: 14px;
  text-align: center;
  margin-top: 15px;
}

/* Add subtle hover effect */
.form-group input:hover:not(:focus) {
  border-color: #007bff;
}

/* Register Link */
.register-link {
  margin-top: 15px;
  text-align: center;
  font-size: 14px;
  color: #a2a0a0;
}

.register-link a {
  color: #007bff;
  text-decoration: none;
  font-weight: bold;
  transition: color 0.3s ease;
}

.register-link a:hover {
  color: #fcfcfc;
}
/* Responsive Design */
@media (max-width: 480px) {
  .login-form {
    padding: 15px;
  }

  .login-form h2 {
    font-size: 20px;
  }

  .form-group input {
    padding: 8px;
    font-size: 13px;
  }

  .submit-btn {
    padding: 8px;
    font-size: 14px;
  }
}
</style>
