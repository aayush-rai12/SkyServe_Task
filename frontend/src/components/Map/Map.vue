<template>
  <div id="map-container">
    <!-- Map Container -->
    <div ref="map" id="map"></div>

    <!-- Download Button (Anchor Tag) -->
    <a :href="downloadLink" v-if="showDownloadButton" download="map-shapes.geojson" class="download-button">
      <i class="fa-solid fa-circle-arrow-down fa-fade"></i> Downlaod
    </a>
    <!-- Style Switching Buttons -->
    <div v-if="distance" id="distance" class="distance-container">
      <pre style="margin: 0px;">Total distance: {{ distance }} km</pre>
    </div>
    <div class="style-buttons addedAllButton">
      <button class="addedButton" @click="changeProjection('globe')">Globe</button>
      <button class="addedButton" @click="changeProjection('mercator')">Mercator</button>
      <button class="addedButton" @click="changeMapStyle('standard')">Standard</button>
      <button class="addedButton" @click="changeMapStyle('satellite')">Satellite</button>
      <button class="addedButton" @click="changeMapStyle('streets')">Streets</button>
      <button class="addedButton" @click="changeMapStyle('outdoors')">Outdoors</button>
      <button class="addedButton" @click="changeMapStyle('light')">Light</button>
      <button class="addedButton" @click="changeMapStyle('dark')">Dark</button>
      <button class="addedButton" @click="changeMapStyle('osm')">OSM</button>
    </div>
  </div>
</template>

<script>
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import * as turf from "@turf/turf";
import "mapbox-gl/dist/mapbox-gl.css";
import dotenv from "dotenv";
// Import Rectangle and Circle modes


export default {
  data() {
    return {
      geojsondata: null,
      showDownloadButton: false,
      mapProjectionstyle: "globe", // Default projection
      styleMap: "mapbox://styles/mapbox/streets-v9",
      map: null, // Store the map instance here
      distance: null,
    };
  },
  computed: {
    downloadLink() {
      // If no data is available, return a fallback link
      if (!this.geojsondata || this.geojsondata.features.length === 0) {
        return "#";
      }

      // Convert GeoJSON data to a string
      const jsonString = JSON.stringify(this.geojsondata, null, 2);

      // Create a Blob (file-like object) from the JSON string
      //  A Blob is a file-like object that represents raw data. It stands for Binary Large Object, and in this case, it represents a chunk of data (like a file) that can be handled in JavaScript. Blobs are often used to store or transfer large binary data, such as images, videos, or even JSON files.

      const blob = new Blob([jsonString], { type: "application/json" });
      // Generate a URL for the Blob
      return URL.createObjectURL(blob);
    },
  },
  methods: {
    //Add methods object here
    calculateDistance(geojsonData) {
      let totalDistance = 0;
      // Loop through the features in geojsonData
      geojsonData.features.forEach(feature => {
        if (feature.geometry.type) {
          // Use turf to calculate the length of the line
          totalDistance += turf.length(feature, { units: 'kilometers' }); // in kilometers
        }
      });
      this.distance = totalDistance.toFixed(2); // Limit the decimal places
    },
    changeProjection(style) {
      const projectionMap = {
        globe: "globe",
        mercator: "mercator",
      };
      if (this.map && projectionMap[style]) {
        this.map.setProjection(projectionMap[style]);
      } else {
        console.error("Map is not initialized or invalid projection.");
      }
    },
    changeMapStyle(style) {
      const styleMap = {
        standard: "mapbox://styles/mapbox/streets-v11",
        satellite: "mapbox://styles/mapbox/satellite-v9",
        streets: "mapbox://styles/mapbox/streets-v11",
        outdoors: "mapbox://styles/mapbox/outdoors-v11",
        light: "mapbox://styles/mapbox/light-v10",
        dark: "mapbox://styles/mapbox/dark-v10",
        osm: "mapbox://styles/mapbox/outdoors-v11",
      };
      if (this.map && styleMap[style]) {
        this.map.setStyle(styleMap[style]);
      } else {
        console.error("Map is not initialized or invalid style.");
      }
    },
  },
  mounted() {
    this.$nextTick(() => {
      // Get GeoJSON data from query params
      const geoJSONDataStr = this.$route.query.geoJSONData;
      let geoJSONData;
      try {
        if (geoJSONDataStr) {
          // Parse the cleaned string
          geoJSONData = JSON.parse(geoJSONDataStr);
          geoJSONData = JSON.parse(geoJSONData);

          // Validate GeoJSON structure
          if (!geoJSONData) {
            throw new Error("Invalid GeoJSON data: Data is null or undefined");
          }
          if (typeof geoJSONData.type !== "string" || geoJSONData.type.toLowerCase() !== "featurecollection") {
            throw new Error("Invalid GeoJSON data: 'type' must be 'FeatureCollection'");
          }
          if (!Array.isArray(geoJSONData.features)) {
            throw new Error("Invalid GeoJSON structure: 'features' must be an array");
          }
        }
      } catch (error) {
        console.error("Error parsing geoJSONData:", error);
        geoJSONData = null;
      }

      // Fallback GeoJSON data (used if no data is provided or parsing fails)
      geoJSONData = geoJSONData || { "type": "FeatureCollection", "features": [{ "type": "Feature", "properties": {}, "geometry": { "coordinates": [[75.0391007337202, 18.304366974068827], [79.14966450908554, 25.087185252984995], [81.2202284513229, 18.52362846247408], [74.43038826390207, 22.866842647743752], [82.68295838359887, 23.070042914401867], [75.09713056979308, 18.36251928396409]], "type": "LineString" } }] };

      // Initialize Mapbox GL
      mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

      const mapContainer = this.$refs.map;
      if (!mapContainer) {
        alert("Map container element not found");
        return;
      }

      // Create a new map
      this.map = new mapboxgl.Map({
        container: mapContainer,
        style: this.styleMap, // Use the data property
        projection: this.mapProjectionstyle, // Use the data property
        zoom: 1.5,
        center: [0, 0],
      });

      // Add navigation controls (zoom in/out, fullscreen, etc.)
      this.map.addControl(new mapboxgl.NavigationControl(), "top-right");
      this.map.addControl(new mapboxgl.FullscreenControl(), "top-right");
      this.map.addControl(new mapboxgl.ScaleControl(), "bottom-left");

      // Add Geolocate control (find user's location)
      const geolocate = new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserLocation: true,
      });
      this.map.addControl(geolocate);

      // Add Mapbox Geocoder (Search) control
      const geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl,
        marker: true, // Add a marker at the searched location
        placeholder: "Search places", // Placeholder text for the search bar
      });
      this.map.addControl(geocoder, "top-left"); // Position the search bar

      // Set default atmosphere style (fog effect)
      this.map.on("style.load", () => {
        this.map.setFog({});
      });

      // Add Mapbox Draw control (draw points, lines, polygons)
      const draw = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
          point: true,
          line_string: true,
          combine_features: true, // Enable edit (combine) tool
          uncombine_features: true, // Enable edit (uncombine) tool
          polygon: true,
          circle: true,
          trash: true,
        },
      });
      this.map.addControl(draw, "top-left");

      // Add GeoJSON data as a source and layer to the map
      this.map.on("load", () => {

        // Add GeoJSON source
        this.map.addSource("geoJSON-source", {
          type: "geojson",
          data: geoJSONData,
        });
        this.calculateDistance(geoJSONData); // Call the method here


        // Add layers based on geometry type (points, lines, polygons)
        geoJSONData.features.forEach((feature, index) => {
          const layerId = `geoJSON-layer-${index}`;
          const sourceId = `geoJSON-source-${index}`;

          // Add source for each feature
          this.map.addSource(sourceId, {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: [feature],
            },
          });

          // Add layer based on geometry type
          switch (feature.geometry.type) {
            case "Point":
              this.map.addLayer({
                id: layerId,
                type: "circle", // Ensure type is defined
                source: sourceId,
                paint: {
                  "circle-radius": 6,
                  "circle-stroke-width": 2,
                  "circle-color": "red",
                  "circle-stroke-color": "white",
                },
              });
              break;

            case "LineString":
              this.map.addLayer({
                id: layerId,
                type: "line", // Ensure type is defined
                source: sourceId,
                paint: {
                  "line-color": "blue",
                  "line-width": 2,
                },
              });
              break;

            case "Polygon":
              this.map.addLayer({
                id: layerId,
                type: "fill", // Ensure type is defined
                source: sourceId,
                paint: {
                  "fill-color": "green",
                  "fill-opacity": 0.5,
                },
              });
              break;

            default:
              console.warn(`Unsupported geometry type: ${feature.geometry.type}`);
              break;
          }
        });


        // Fit the map to the bounds of the GeoJSON data
        const bounds = new mapboxgl.LngLatBounds();
        geoJSONData.features.forEach((feature) => {
          if (feature.geometry && feature.geometry.coordinates) {
            if (feature.geometry.type === "Point") {
              bounds.extend(feature.geometry.coordinates);
            } else if (feature.geometry.type === "LineString") {
              feature.geometry.coordinates.forEach((coord) => bounds.extend(coord));
            } else if (feature.geometry.type === "Polygon") {
              feature.geometry.coordinates[0].forEach((coord) => bounds.extend(coord));
            }
          }
        });

        if (!bounds.isEmpty()) {
          this.map.fitBounds(bounds, { padding: 50 }); // Add padding if needed
        } else {
        }

        // Handle interactions (click)
        this.map.on("click", (e) => {
          const features = this.map.queryRenderedFeatures(e.point);
          if (features.length) {
            const feature = features[0];
            if (feature.properties.name) {
              new mapboxgl.Popup()
                .setLngLat(e.lngLat)
                .setHTML(feature.properties.name ? `<strong>${feature.properties.name_en}</strong>` : '<em>Name not available</em>')
                .addTo(this.map);
            }
          }
        });
      });

      // Handle window resizing
      window.addEventListener("resize", () => {
        this.map.resize();
      });

      // Event listener for drawing actions (create, delete, update)
      this.map.on("draw.create", (e) => {
        this.geojsondata = draw.getAll(); // Update this.geojsondata
        this.showDownloadButton = true;
        this.calculateDistance(this.geojsondata);  // Recalculate the distance
      });

      this.map.on("draw.delete", (e) => {
        this.showDownloadButton = false;
      });

      this.map.on("draw.update", (e) => {
        this.calculateDistance(this.geojsondata);  // Recalculate the distance after update
      });
    });
  },
};
</script>

<style scoped>
#map-container {
  height: 100%;
  width: 100%;
  position: relative;
}

#map {
  height: 100%;
  width: 100%;
  position: absolute;
}

/* search button */
#map-container :deep(.mapboxgl-ctrl-geocoder) {
  min-width: 140px;
  border-radius: 15px;
  background: #fff;
  padding: 0px 0px;
  background-color: white;
  color: #0a1935;
}

:deep(.mapboxgl-ctrl-geocoder--input) {
  height: 30px;
}


@media screen and (max-width: 640px) {
  :deep(.mapboxgl-ctrl-geocoder--icon-search) {
    margin: -6px;
    padding: 3px;
  }

  :deep(.mapboxgl-ctrl-geocoder) {
    width: 40%;
    font-size: 90%;
  }
}

:deep(.mapboxgl-ctrl-geocoder--input) {
  border-radius: 13px;
  padding: 6px 33px;
}

#map-container :deep(.mapboxgl-ctrl-group) {
  background: #fff;
  border-radius: 15px;
}

#map-container :deep(.mapboxgl-ctrl-top-right) {
  right: 0;
  top: 37px;
}

/* Download Button */
.download-button {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1;
  background-color: white;
  color: #0a1935;
  border: none;
  padding: 5px 9px;
  cursor: pointer;
  border-radius: 15px;
  text-decoration: none;
  transition: all 0.5s ease-in-out;
}

.download-button:hover {
  background-color: #293c63;
  color: white;
}

.addedAllButton {
  position: absolute;
  top: 95%;
  right: 32%;
  z-index: 1;
  background-color: #020e1f;
  border: none;
  padding: 5px 9px;
  cursor: pointer;
  border-radius: 15px;
  text-decoration: none;
  transition: all 0.5s ease-in-out;
}

.style-buttons button {
  border: none;
  cursor: pointer;
  border-radius: 2px;
  transition: all 0.5s ease-in-out;
  background-color: transparent;
  color: aqua;
}

.style-buttons button:hover {
  background-color: #1b3258;
  color: white;
}

.distance-container {
  position: absolute;
  top: 90%;
  left: 43%;
  z-index: 1;
  background-color: #020e1f;
  color: #7c828e;
  border: none;
  padding: 5px 9px;
  cursor: pointer;
  border-radius: 15px;
  text-decoration: none;
  transition: all 0.5s ease-in-out;
}

@media screen and (max-width: 768px) {
  .addedAllButton {
    right: 0%;
    top: 95%;
  }
  .distance-container {
      left: 35%;
  } 
}
</style>