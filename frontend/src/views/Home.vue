<template>
  <div class="home-view">
    <!-- Text Content Above the Video -->
    <div class="text-content">
      <h1>Welcome to Geospatial App</h1>
      <p>Manage and visualize your geospatial data</p>
    </div>

    <!-- Video Element -->
    <div class="video-container">
      <video autoplay muted loop>
        <source src="../assets/earth2.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  </div>
</template>

<script>
export default {
  name: "HomeView",
};
</script>

<style scoped>
html, body {
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.home-view {
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  height: 100vh; 
  width: 100%;
}

/* Style the text content */
.text-content {
  z-index: 10; /* Ensure text appears above the video */
  margin-bottom: 20px;
  position: absolute; 
  top: 50%; 
  left: 50%; 
  transform: translate(-50%, -50%); 
  padding: 20px;
  text-align: center;
  color: white;
  background-color: rgba(0, 0, 0, 0.6); 
  border-radius: 10px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.5);
  animation: slideIn 0.7s ease-in;
}

/* Keyframes for the slideIn animation */
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

.home-view h1 {
  font-size: 28px;
  font-weight: bold;
  margin: 0;
  letter-spacing: 2px;
}

.home-view p {
  font-size: 20px;
  margin-top: 10px;
}

/* Style for the video container */
.video-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%; 
  z-index: -1; /* Send video behind the text */
}

video {
  object-fit: cover; 
  width: 100%;
  height: 100%;
}
</style>
