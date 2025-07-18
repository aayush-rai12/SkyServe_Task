<template>
  <div id="app">
    <!-- App Header -->
    <header v-if="$route.path !== '/'">
      <nav>
        <ul>
          <li><router-link to="/">Home</router-link></li>
          <li><router-link to="/register">Register</router-link></li>
          <li v-if="$route.path !== '/map'"><router-link to="/map">Demo Map</router-link></li>
          <li><router-link to="/dashboard">Dashboard</router-link></li>
          <li><router-link to="/filelist">File List</router-link></li>
        </ul>
      </nav>
    </header>

    <!-- Main Content -->
    <main>
      <router-view /> <!-- Render components based on the route -->
    </main>

    <!-- App Footer -->
    <footer>
      <p>&copy; 2025 Geo-Data App. All rights reserved.</p>
    </footer>
  </div>
</template>

<script>
export default {
  name: "App",
   methods: {
    reloadPage() {
      window.location.reload();
    }
  }
};
</script>

<style>
/* Root styles for the app */
#app {
  font-family: Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
}

header {
  background: #34495e;
  color: #fff;
  padding: 1rem;
}

header nav ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  justify-content: center;
}

header nav ul li {
  margin: 0 1rem;
}

header nav ul li a {
  color: #fff;
  text-decoration: none;
}

header nav ul li a:hover {
  text-decoration: underline;
}

main {
  flex-grow: 1;
  padding: 0;
}

footer {
  background: #2c3e50;
  color: #fff;
  padding: 0.5rem;
  position: relative;
}
</style>