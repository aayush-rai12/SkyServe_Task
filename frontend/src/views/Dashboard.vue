<template>
  <div v-if="!user" class="notification">
    <p>Please log in to access your dashboard.</p>
    <router-link to="/login" class="btn-link">Go to Login</router-link>
  </div>
  <div v-else>
    <div class="dashboard-container">
      <!-- Sidebar for User Profile -->
      <div class="sidebar">
        <div class="profile-card">
          <div class="profile-header">
            <div class="profile-avatar">

              <!-- <img src="" alt="User Avatar" /> -->
              <img :src="user.image.url" alt="User Profile">

            </div>
          </div>
          <h2 class="profile-name">{{ user.name }}</h2>
          <p class="profile-location">{{ user.location }}</p>
          <p class="profile-email">{{ user.email }}</p>
          <div class="profile-actions">
            <button @click="openUpdateProfileModal" class="update-btn" title="Update your Details">
              <i class="fa fa-edit"></i>
            </button>
            <button @click="logout" class="logout-btn"><i class="fa fa-sign-out-alt"></i> Logout</button>
          </div>
        </div>
        <div class="profile-note">
          <p><strong>Note:</strong> Use this page to upload and manage your GeoJSON files. You can upload and
            visualize your data here.</p>
        </div>
        <!-- Update Profile Modal -->
        <div v-if="isUpdateModalOpen" class="modal-overlay">
          <div class="modal-content">
            <h2>Update Profile</h2>
            <form @submit.prevent="updateProfile" enctype="multipart/form-data">
              <div class="form-group">
                <div class="image-upload" style="display: inline-block;">
                  <label for="image" v-show="!imagePreview" class="image-upload-label" title="Upload Profile Image">
                    <i class="fa fa-camera" style="color: #34495e;"></i>
                    <input type="file" id="image" name="image" ref="fileInput" @change="handleImageUpload"
                      accept="image/*" />
                  </label>
                  <div v-if="imagePreview" class="image-preview" @click="resetImage">
                    <img :src="imagePreview" alt="Profile Image Preview" />
                  </div>
                </div>
              </div>
              <div class="form-group">
                <label for="name">Name</label>
                <input type="text" required id="name" v-model="updatedUser.name" />
              </div>
              <div class="form-group">
                <label for="email">Email</label>
                <input type="email" required id="email" v-model="updatedUser.email" />
              </div>
              <div class="form-group">
                <label for="location">Location</label>
                <input type="text" required id="location" v-model="updatedUser.location" />
              </div>
              <div v-if="isUpdating" class="form-actions">
                <p class="loading-message">Please wait, updating your profile...</p>
              </div>
              <div v-else class="form-actions">
                <button v-if="isSubmitting" type="button" @click="closeUpdateProfileModal"
                  class="cancel-btn">Cancel</button>
                <button v-if="isSubmitting" type="submit" class="save_update_btn">Save Changes</button>
                <p v-if="successMessage" class="success">{{ successMessage }}</p>
                <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="main-content">
        <div class="upload-section">
          <label for="file-upload" class="upload-label">
            <span>Upload GeoJSON File</span>
          </label>
          <input type="file" accept=".geojson" id="file-upload" @change="handleFileUpload" class="file-input" />
          <button v-if="uploadedFile" @click="clearFile" class="clear-btn upload-label">
            Clear File
          </button>
        </div>

        <div class="geojson-data">
          <div v-if="geoJSONData" class="geojson-card">
            <h3>GeoJSON Data: <em>{{ uploadedFile.name }}</em></h3>
            <div class="json-display">
              <textarea v-if="editMode" v-model="editableGeoJSON" class="edit-textarea"
                placeholder="Edit GeoJSON data..."></textarea>
              <pre v-else-if="isCollapsed">{{ truncatedGeoJSON }}</pre>
              <pre v-else>{{ geoJSONData }}</pre>
            </div>
            <div class="action-buttons">
              <button @click="toggleCollapse" class="collapse-btn" v-if="!editMode">
                <i :class="isCollapsed ? 'fa fa-chevron-down' : 'fa fa-chevron-up'"></i>
                {{ isCollapsed ? "Read More" : "Read Less" }}
              </button>
              <button @click="saveGeoJSONData" class="save-btn" :disabled="isLoading" v-if="!editMode && !isSaved">
                <i class="fa fa-save"></i> {{ isLoading ? "Saving..." : "Save GeoJSON" }}
              </button>
              <button @click="saveChanges" class="save-changes-btn" v-if="editMode">
                <i class="fa fa-save"></i> Save Changes
              </button>
              <button @click="cancelEdit" class="cancel-edit-btn" v-if="editMode">
                <i class="fa fa-times"></i> Cancel
              </button>
            </div>
          </div>
          <p v-else class="no-file-message">No file selected. Please upload a file to view its data.</p>
        </div>
      </div>

      <!-- File Management Section -->
      <div class="file-management">
        <div v-if="uploadedFiles.length" class="file-list">
          <h3>Uploaded Files</h3>
          <!-- Display files for the current page -->
          <div v-for="(file, index) in paginatedFiles" :key="index" class="file-item">
            <div class="file-name">
              <p style="margin-top: 1px;margin-bottom: 1px;"><strong>{{ file.name }}</strong></p>
            </div>
            <div class="file-actions">
              <!-- <button @click="confirmToggleFile(file)" class="enable-disable-btn" :class="{ enabled: file.enabled }">
                <i :class="file.enabled ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
                {{ file.enabled ? "Disable" : "Enable" }}
              </button> -->
              <button @click="mapFile(file)" class="map-btn" title="View this geojson data on Map">
                <i class="fas fa-map"></i> Map
              </button>
              <div class="edit-delete-container">
                <button @click="editFile(file)" class="edit-btn" title="Currently Not Working">
                  <i class="fas fa-edit"></i>
                </button>
                <button @click="confirmDeleteFile(index)" class="delete-btn">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Pagination Controls -->
          <div class="pagination" v-if="totalPages > 1">
            <button @click="previousPage" :disabled="currentPage === 1" class="pagination-btn">
              <i class="fa-solid fa-circle-chevron-left"></i> Previous
            </button>
            <span class="page-info">Page {{ currentPage }} of {{ totalPages }}</span>
            <button @click="nextPage" :disabled="currentPage === totalPages" class="pagination-btn">
              Next <i class="fa-solid fa-circle-chevron-right"></i>
            </button>
          </div>
        </div>
        <p v-else class="no-files-message">No files uploaded yet.</p>
      </div>
    </div>
  </div>
</template>

<script>
import apiClient from '../utils/apiClient';
import toGeoJSON from '@mapbox/togeojson';
import { DOMParser } from 'xmldom';

export default {
  data() {
    return {
      user: JSON.parse(localStorage.getItem("user")) || null,
      uploadedFile: null,
      uploadedFiles: [],
      geoJSONData: null,
      editableGeoJSON: "",
      isCollapsed: true,
      isLoading: false,
      editMode: false,
      currentPage: 1, // Track the current page
      itemsPerPage: 5, // Number of items to display per page
      isSaved: false,
      isSubmitting: true,
      isUpdating: false,
      isUpdateModalOpen: false,
      successMessage: "",
      errorMessage: "",
      updatedUser: {
        name: "",
        email: "",
        location: "",
        image: {
          url: "",
        },
      },
      image: null,
      imagePreview: null,
    };
  },
  async created() {
    if (this.user) {
      await this.fetchUserFiles();
      this.imagePreview = this.user.image.url;
      this.updatedUser = { ...this.user };
    }
  },
  computed: {
    truncatedGeoJSON() {
      if (this.geoJSONData) {
        const jsonStr = JSON.stringify(this.geoJSONData, null, 2);
        return jsonStr.length > 200 ? jsonStr.substring(0, 200) + "..." : jsonStr;
      }
      return "";
    },
    // Pagination Computed Properties
    paginatedFiles() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.uploadedFiles.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.uploadedFiles.length / this.itemsPerPage);
    },
  },
  methods: {

    // Check if the updated data is different from the current user data
    hasChanges() {
      return (
        this.updatedUser.name !== this.user.name ||
        this.updatedUser.email !== this.user.email ||
        this.updatedUser.location !== this.user.location ||
        this.image !== null
      );
    },
    resetImage() {
      this.image = null;
      this.imagePreview = null;

      // Ensure that the file input element is available before triggering the file dialog
      if (this.$refs.fileInput) {
        // Trigger the file input dialog
        this.$refs.fileInput.click();
      } 
    },

    handleImageUpload(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          this.imagePreview = reader.result; // Update imagePreview with the newly uploaded image
        };
        reader.readAsDataURL(file);
        this.image = file;  // Store the file for later use

        // Reset the input value after the upload to allow re-upload
        event.target.value = '';
      }
    },


    openUpdateProfileModal() {
      this.isSubmitting = true;
      this.successMessage = "";
      this.isUpdateModalOpen = true;
    },
    closeUpdateProfileModal() {
      this.isUpdateModalOpen = false;
    },
    async updateProfile() {
      // Check if there are any changes
      if (!this.hasChanges()) {
        this.isSubmitting = false;
        this.successMessage = "No changes were made.";
        setTimeout(() => {
          this.closeUpdateProfileModal();
        }, 2000); 
        return;
      }
      try {
        this.isUpdating = true; 
        this.successMessage = "";
        this.errorMessage = "";
        this.isSubmitting = false;

        const formData = new FormData();
        formData.append('name', this.updatedUser.name);
        formData.append('email', this.updatedUser.email);
        formData.append('location', this.updatedUser.location);
        if (this.image) {
          formData.append('image', this.image);
        }

        const response = await apiClient.put(`/users/update/${this.user._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });

        const userDetails = response.data.user;

        // Update the user object with the new details
        this.user = { ...userDetails };
        localStorage.setItem("user", JSON.stringify(this.user));
        this.updatedUser = { ...this.user };

        this.successMessage = "Profile updated successfully!";
        this.errorMessage = "";
        setTimeout(() => {
          this.closeUpdateProfileModal();
        }, 2000);
      } catch (error) {
        this.errorMessage = error.response?.data?.message || 'Failed to update profile.';
        this.successMessage = "";
        setTimeout(()=>{
          this.logout() 
        }, 2000);
      } finally {
        this.isUpdating = false;
        this.isSubmitting = false;
      }
    },
    toggleCollapse() {
      this.isCollapsed = !this.isCollapsed;
    },
    logout() {
      localStorage.removeItem("user");
      this.user = null;
      this.$router.push("/login");
    },
    // Pagination Methods
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
    previousPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
    async fetchUserFiles() {
      try {
        const response = await apiClient.get(`/files/user/${this.user._id}`);
        this.uploadedFiles = response.data;
        const enabledFile = this.uploadedFiles.find(file => file.enabled);
        if (enabledFile) {
          this.geoJSONData = enabledFile.data;
          this.uploadedFile = enabledFile;
        }
      } catch (error) {
        alert(`Failed to fetch uploaded files, ${error.message} Please Login and try again.`);
        this.logout();
      }
    },
    handleFileUpload(event) {
      const file = event.target.files[0];
      if (file) {
        if (file.size > 2 * 1024 * 1024) {
          alert("File size exceeds 2MB. Please upload a smaller file.");
          event.target.value = "";
          return;
        }
        if (file.name.toLowerCase().endsWith(".geojson")) {
          this.uploadedFile = file;
          this.readGeoJSONFile(file);
          this.isSaved = false;
        } else if (file.name.toLowerCase().endsWith(".kml")) {
          this.uploadedFile = file;
          this.readGeoJSONFile(file);
          this.isSaved = false;
        } else {
          alert("Please upload a valid GeoJSON file.");
          event.target.value = "";
        }
      }
    },
    readGeoJSONFile(file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const fileContent = e.target.result;

          // Check if the file is a KML file
          if (file.name.toLowerCase().endsWith('.kml')) {
            alert("Processing KML file...");
            // Parse KML content
            const kmlDom = new DOMParser().parseFromString(fileContent, 'text/xml');
            const geoJSON = toGeoJSON.kml(kmlDom);

            // Validate the converted GeoJSON
            if (geoJSON && geoJSON.type === "FeatureCollection" && Array.isArray(geoJSON.features)) {
              this.geoJSONData = geoJSON;
              this.uploadedFile.data = geoJSON;
              alert("KML file processed successfully.");
            } else {
              alert("Invalid KML structure.");
              this.clearFile();
            }
          }
          // Here I'm checking files is geojson or not
          else if (file.name.toLowerCase().endsWith('.geojson')) {
            alert("Processing GeoJSON file...");
            const data = JSON.parse(fileContent);

            // Here I'm going to validate the GeoJSON data
            if (data && data.type === "FeatureCollection" && Array.isArray(data.features)) {
              this.geoJSONData = data;
              this.uploadedFile.data = data;
              alert("GeoJSON file processed successfully.");
            } else {
              alert("Invalid GeoJSON structure.");
              this.clearFile();
            }
          }
          else {
            alert("Unsupported file type. Please upload a GeoJSON or KML file.");
            this.clearFile();
          }
        } catch (error) {
          alert("Error parsing file: " + error.message);
          this.clearFile();
        }
      };
      reader.readAsText(file);
    },
    clearFile() {
      this.uploadedFile = null;
      this.geoJSONData = null;
      this.editableGeoJSON = "";
      this.editMode = false;
    },

    async saveGeoJSONData() {
      if (!this.geoJSONData || !this.uploadedFile) {
        alert("No file or data to save.");
        return;
      }
      this.isLoading = true;
      try {
        const userData = JSON.parse(localStorage.getItem("user"));
        const payload = {
          geoJSONData: this.geoJSONData,
          fileName: this.uploadedFile.name,
          user: {
            _id: userData._id,
            email: userData.email,
          },
        };
        const response = await apiClient.post("/files/upload", payload);
        this.isSaved = true;

        this.uploadedFiles.push({
          name: this.uploadedFile.name,
          data: this.geoJSONData,
          enabled: true,
          _id: response.data._id,
        });

        await this.fetchUserFiles();
        this.$forceUpdate();    
      } catch (error) {
      } finally {
        this.isLoading = false;
      }
    },
    async editFile(file) {
      try {
        let fileContent;
        if (file === this.uploadedFile) {
          if (!this.geoJSONData) {
            alert("No GeoJSON data found for the uploaded file.");
            return;
          }
          fileContent = JSON.stringify(this.geoJSONData, null, 2);
        } else if (file.path) {
          const filename = file.path.split('\\').pop();
          const response = await apiClient.get(`/files/${filename}`);
          fileContent = response.data.data;
        } else {
          alert("No content available for this file.");
          return;
        }
        this.editMode = true;
        this.editableGeoJSON = fileContent;
      } catch (error) {
        alert("Failed to load file content.");
      }
    },
    saveChanges() {
      try {
        const parsedData = JSON.parse(this.editableGeoJSON);
        if (parsedData && parsedData.type === "FeatureCollection" && Array.isArray(parsedData.features)) {
          this.geoJSONData = parsedData;
          this.editMode = false;
          alert("Changes saved successfully!");
        } else {
          alert("Invalid GeoJSON structure. Please correct the data.");
        }
      } catch (error) {
        alert("Invalid JSON format. Please correct the data.");
      }
    },
    cancelEdit() {
      this.editMode = false;
    },
    mapFile(file) {
      if (file.data) {
        this.$router.push({
          name: 'map',
          params: { geoJSONData: JSON.stringify(file.data) }
        });
      } else if (file.path) {
        this.fetchFileData(file.path);
      } else {
        alert("No GeoJSON data or path available for this file.");
      }
    },
    async fetchFileData(filePath) {
      try {
        const filename = filePath.split('\\').pop();
        const response = await apiClient.get(`/files/${filename}`);
        const fileContent = response.data.data;
        if (fileContent) {
          this.$router.push({
            name: 'map',
            query: { geoJSONData: JSON.stringify(fileContent) }
          });
        } else {
          alert("No GeoJSON data found for this file.");
        }
      } catch (error) {
        alert("Failed to fetch GeoJSON data.",error.message);
      }
    },
    confirmDeleteFile(index) {
      const confirmed = confirm("Are you sure you want to delete this file?");
      if (confirmed) {
        this.deleteFile(index);
      }
    },
    async deleteFile(index) {
      const file = this.uploadedFiles[index];
      try {
        await apiClient.delete(`/files/${file._id}`);
        this.uploadedFiles.splice(index, 1);
        this.geoJSONData = null;
        // Reset currentPage if it cross totalPages after deletion
        if (this.currentPage > this.totalPages) {
          this.currentPage = this.totalPages;
        }
      } catch (error) {
        this.errorMessage = "Failed to fetch uploaded files. Please try again.";
        alert("Failed to delete file.");
      }
    },
  },
};
</script>

<style scoped>
/* Dashboard Container */
.dashboard-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background-color: #1d1f2e;
  height: 482px;
}

/* Notification Style */
.notification {
  background-color: #f8d7da;
  color: #721c24;
  padding: 1.5rem;
  border-radius: 12px;
  text-align: center;
  font-size: 18px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  width: 80%;
  max-width: 500px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: slideIn 0.5s ease-in-out;
}

/* Link Style */
.btn-link {
  padding: 7px;
  font-size: 16px;
  color: #fff;
  background-color: #007bff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  text-decoration: none;
  transition: background-color 0.3s ease;
}

.btn-link:hover {
  background-color: #0056b3;
}

/* Animation for the notification appearance */
@keyframes slideIn {
  0% {
    transform: translate(-50%, -50%) scale(0.5);
    opacity: 0;
  }

  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
}

/* Profile Section */
.sidebar {
  width: 100%;
  background-color: #ffffff;
  padding: 0.4rem;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.profile-card {
  width: 100%;
  padding: 25px 0px;
  background-color: #1d1f2e;
  color: #fff;
  text-align: center;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  font-family: 'Arial', sans-serif;
}

.profile-header {
  position: relative;
}

.profile-avatar img {
  max-width: 150px;
  max-height: 140px;
  border-radius: 40px;
  object-fit: cover;
  border: 2px solid #3498db;
  margin: 0 auto;
}

.profile-name {
  font-size: 22px;
  font-weight: bold;
  margin: 10px 0 5px;
}

.profile-location {
  font-size: 14px;
  color: #a5a5a5;
  margin-bottom: 10px;
}

.profile-email {
  font-size: 16px;
  margin-bottom: 20px;
}

.profile-actions button {
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 8px 20px;
  font-size: 14px;
  margin: 0 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.profile-actions .logout-btn {
  background-color: #34c759;
}

.profile-actions .logout-btn:hover {
  background-color: white;
  color: #28a745;
}

/* Main Content Area */
.main-content {
  width: auto;
  padding: 1rem;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  margin: 0 auto;
}

/* Upload Section */
.upload-section {
  /* display: flex!important; */
  /* flex-direction: column; */
  /* gap: 1rem;
  align-items: center; */
  margin-bottom: 1rem;
}

.upload-label {
  background-color: #1d1f2e;
  color: white;
  padding: 8px 24px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 15px;
  transition: background-color 0.3s ease;
  margin-right: 4px;
}

.upload-label:hover {
  background-color: #2c3e50;
}

.file-input {
  display: none;
}

.clear-btn {
  background-color: #e74c3c;
  color: white;
  /* font-size: 16px; */
  /* padding: 8px 20px; */
  border: none;
  /* border-radius: 5px; */
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.clear-btn:hover {
  background-color: #c0392b;
}

/* GeoJSON Data */
.geojson-data {
  background-color: #f9f9f9;
  padding: 0.5rem 0;
  width: 100%;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  font-family: 'Courier New', Courier, monospace;
}

/* .geojson-card{
  text-align:initial;
} */
/* .action-buttons {
   display: flex;
  justify-content: center; 
} */

.geojson-data h3 {
  font-size: 20px;
  color: #3498db;
  margin-bottom: 1rem;
}

.geojson-data pre {
  background-color: #2c3e50;
  color: #ecf0f1;
  padding: 1rem;
  border-radius: 8px;
  font-size: 14px;
  overflow-x: auto;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.collapse-btn {
  background-color: #3498db;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin: 10px;
}

.collapse-btn:hover {
  background-color: #007bff;
  color: white;
}

/* File Management */
.file-management {
  width: 100%;
  padding: 0.4rem;
  background-color: #fff;
  border-radius: 8px;
}

.no-files-message {
  background-color: #1d1f2e;
  padding: 8px 0px;
  border-radius: 20px;
  color: white;
  margin: 0px 70px;
}

.file-list {
  background-color: #1d1f2e;
  color: #fff !important;
  text-align: center;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  padding: 1px;
}

.file-item {
  display: grid;
  justify-content: center;
  align-items: center;
  margin-bottom: 0.5rem;
  padding: 0.3rem;
  background-color: #f9f9f9;
  border-radius: 12px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.file-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.file-name {
  color: #1d1f2e;
  margin-right: 5px;
}

.file-actions {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
}

/* Enable/Disable Button */
.enable-disable-btn {
  padding: 5px 8px;
  background-color: #2ecc71;
  color: white;
  border: none;
  border-radius: 35px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.enable-disable-btn.enabled {
  background-color: #f39c12;
}

.enable-disable-btn:hover {
  background-color: #27ae60;
}

/* Map Button */
.map-btn {
  padding: 5px 10px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 35px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.map-btn:hover {
  background-color: #2980b9;
}

.json-display {
  padding: 1rem;
  text-align: initial;
}

.save-btn {
  background-color: #34c759;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin: 10px auto;
}

.file-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.edit-delete-container {
  display: flex;
  gap: 0.25rem;
  background-color: #f0f0f0;
  padding: 4px;
  border-radius: 20px;
}

.edit-btn,
.delete-btn {
  padding: 8px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;
}

.edit-btn {
  background-color: #fd7e14;
  color: white;
}

.delete-btn {
  background-color: #e74c3c;
  color: white;
}

/* edit functionality */
.edit-textarea {
  width: 100%;
  height: 200px;
  /* padding: 1rem; */
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 8px;
  resize: vertical;
}

.save-changes-btn {
  background-color: #28a745;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.save-changes-btn:hover {
  background-color: #218838;
}

.cancel-edit-btn {
  background-color: #dc3545;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.cancel-edit-btn:hover {
  background-color: #c82333;
}

/* Media Queries for Responsiveness */
@media (min-width: 768px) {
  .dashboard-container {
    flex-direction: row;
    height: 100%;
  }

  .sidebar {
    width: 300px;
  }

  .main-content {
    width: auto;
  }

  .file-management {
    width: 30%;
  }

  .upload-section {
    /* flex-direction: row; */
    font-size: 5%;
  }
}

@media (max-width: 767px) {
  .dashboard-container {
    flex-direction: column;
    height: 100%;
  }

  .sidebar,
  .main-content,
  .file-management {
    width: auto;
  }

  .upload-section {
    flex-direction: column;
  }

  .file-actions {
    /* flex-direction: column; */
    flex-direction: row;
    gap: 0.5rem;
  }

  .file-item {
    display: flex;
    justify-content: space-between;
    font-size: 80%;
  }
}

.profile-note {
  margin-top: 20px;
  padding: 9px;
  background-color: #fff9c4;
  border-radius: 8px;
  border: 1px solid #1d1f2e;
  font-size: 14px;
  color: #003366;
  text-align: center;
}

.profile-note p {
  margin: 0;
}

.profile-note strong {
  color: #3498db;
  /* Highlight the "Note:" text */
}

@media (max-width: 480px) {
  .profile-card {
    padding: 15px 0;
    /* Reduce padding for smaller screens */
  }

  .profile-name {
    font-size: 18px;
    /* Smaller font size for profile name */
  }

  .profile-email {
    font-size: 14px;
    /* Smaller font size for email */
  }

  .upload-label {
    font-size: 12px;
    /* Smaller font size for upload label */
    padding: 8px 16px;
    /* Adjust padding */
  }

  .clear-btn {
    font-size: 12px;
    /* Smaller font size for clear button */
    padding: 8px 16px;
    /* Adjust padding */
  }

  .main-content {
    padding: 0;
  }

}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 5px;
}

.pagination-btn {
  padding: 5px 10px;
  margin: 0 5px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #f8f9fa;
  cursor: pointer;
}

.pagination-btn:disabled {
  background-color: #e9ecef;
  cursor: not-allowed;
}

.page-info {
  margin: 0 10px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: #0e0f17;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
  color: white;
}

.form-group {
  margin-bottom: 8px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: white;
}

.form-group input {
  width: 95%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  color: rebeccapurple;
}

.cancel-btn,
.save_update_btn {
  padding: 8px 16px;
  border: 1px solid rebeccapurple;
  border-radius: 30px 0px;
  cursor: pointer;
  transition: background 0.5s ease, color 0.3s ease;
}

.cancel-btn {
  background: #ccc;
}

.save_update_btn {
  background: #42b983;
  color: white;
}

.save_update_btn:hover {
  background: #0c0c0e;
  color: white;
}

.cancel-btn:hover {
  background: #272525;
  color: white;
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

.loading-message {
  color: #3498db;
  font-style: italic;
  margin: 10px 0;
}

.success {
  color: #2ecc71;
  font-weight: bold;
  margin: 10px 0;
}

.error {
  color: #e74c3c;
  font-weight: bold;
  margin: 10px 0;
}
</style>
