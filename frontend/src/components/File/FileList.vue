<template>
  <div class="file-list-container">
    <h1 class="page-title">Your Uploaded Files</h1>

    <!-- Check if the user is logged in -->
    <div v-if="user" class="file-list-wrapper">
      <!-- Display files if any exist -->
      <div v-if="uploadedFiles.length" class="file-grid">
        <div v-for="file in uploadedFiles" :key="file._id" class="file-card">
          <div class="file-card-content">
            <h3 class="file-name">{{ file.name }}</h3>
            <p class="file-description">{{ file.description }}</p>
          </div>
        </div>
      </div>
      <!-- If no files uploaded -->
      <p v-else class="no-files">No files uploaded yet.</p>
    </div>

    <!-- Message when user is not logged in -->
    <div v-else class="login-message">
      <p>Please log in to see your uploaded files.</p>
    </div>

    <!-- Error message when fetching fails -->
    <div v-if="fetchError" class="error-message">
      <p>Failed to fetch uploaded files. Please try again later.</p>
    </div>
  </div>
</template>

<script>
import apiClient from '../../utils/apiClient';

export default {
  data() {
    return {
      user: null, // User info will be set after login
      uploadedFiles: [], // Array to store the files uploaded by the user
      fetchError: false, // Flag to show error message
    };
  },
  async created() {
    // Check if user data is available in localStorage
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      this.user = storedUser; // Set the user data from localStorage
      await this.fetchUserFiles(); // Fetch the files if user is found
    } else {
      console.log("User not logged in.");
    }
  },
  methods: {
    async fetchUserFiles() {
      try {
        // Make the API call using the user's ID
        const response = await apiClient.get(`/files/user/${this.user._id}`);
        this.uploadedFiles = response.data;
        this.fetchError = false; // Reset any previous error flag
      } catch (error) {
        console.error("Error fetching files:", error);
        this.fetchError = true; // Set error flag to true and display error message
      }
    },
  },
};
</script>

<style scoped>
/* Container for the entire file list page */
.file-list-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px;
  font-family: 'Arial', sans-serif;
  background: #f0f4f7; /* Light blue-gray background */
  border-radius: 8px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  background: linear-gradient(135deg, #f0f4f7 0%, #ffffff 100%); /* Gradient background */
  color: #333;
}

/* Page Title */
.page-title {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 30px;
  color: #2c3e50; /* Dark blue color */
  font-weight: bold;
}

/* Wrapper around the file list */
.file-list-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Error message style */
.error-message {
  color: #e74c3c; /* Red color */
  font-weight: bold;
  text-align: center;
  background-color: #fdecec;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Grid layout for files */
.file-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  width: 100%;
  margin-top: 20px;
}

/* Individual file card */
.file-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease-in-out, box-shadow 0.3s ease;
  padding: 20px;
  border: 1px solid #e0e0e0;
  background: #fafafa;
}

.file-card:hover {
  transform: translateY(-5px); /* Hover effect */
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

/* Content section in file card */
.file-card-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* File name styling */
.file-name {
  font-size: 1.4rem;
  font-weight: bold;
  color: #34495e; /* Dark blue color */
  margin: 0;
  text-transform: capitalize;
}

/* File description */
.file-description {
  font-size: 1rem;
  color: #7f8c8d; /* Gray color */
  margin: 0;
}

/* No files uploaded message */
.no-files {
  font-size: 1.2rem;
  font-weight: bold;
  color: #999;
  text-align: center;
  margin-top: 20px;
}

/* Login message when user is not logged in */
.login-message {
  text-align: center;
  font-size: 1.2rem;
  margin-top: 20px;
  color: #34495e; /* Dark blue color */
}
</style>
