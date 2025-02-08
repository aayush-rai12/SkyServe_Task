<template>
  <div id="map-container">
    <!-- Map Container -->
    <div ref="map" id="map"></div>

    <!-- Download Button (Anchor Tag) -->
    <a :href="downloadLink" v-if="showDownloadButton" download="map-shapes.geojson" class="download-button">
      <i class="fa-solid fa-circle-arrow-down fa-fade"></i> Downlaod
    </a>
  </div>
</template>

<script>
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
// Import Rectangle and Circle modes


export default {
  data() {
    return {
      geojsondata: null,
      showDownloadButton: false,
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
  mounted() {
    this.$nextTick(() => {
      // Get GeoJSON data from query params
      const geoJSONDataStr = this.$route.query.geoJSONData;
      console.log("Raw geoJSONData from query:", geoJSONDataStr);

      let geoJSONData;
      try {
        if (geoJSONDataStr) {
          // Parse the cleaned string
          geoJSONData = JSON.parse(geoJSONDataStr);
          geoJSONData = JSON.parse(geoJSONData);
          console.log("Parsed GeoJSON Data:", geoJSONData);

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
      geoJSONData = geoJSONData || {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {},
            geometry: {
              coordinates: [138.60657067293045, 36.40282454027016],
              type: "Point",
            },
          },
          {
            type: "Feature",
            properties: {},
            geometry: {
              coordinates: [
                [73.09111445708831, 26.185152777759626],
                [81.82941051806944, 20.01391957256537],
              ],
              type: "LineString",
            },
          },
          {
            type: "Feature",
            properties: {},
            geometry: {
              coordinates: [
                [
                  [77.7356512648347, 9.496458854692307],
                  [77.7356512648347, 35.061915878872895],
                  [71.74847521163937, 22.262760683671317],
                  [83.05758553434191, 22.262760683671317],
                  [77.7356512648347, 9.496458854692307],
                ],
              ],
              type: "Polygon",
            },
          },
        ],
      };

      // Initialize Mapbox GL
      mapboxgl.accessToken = "pk.eyJ1IjoicGhpbDk4NzY3OCIsImEiOiJjbGx5NDJjZGQwdGpuM2VvOTBmaG54bW5rIn0.KyeDHVXR8dAEaD5gFKMVIg";

      const mapContainer = this.$refs.map;
      if (!mapContainer) {
        alert("Map container element not found");
        return;
      }

      // Create a new map
      const map = new mapboxgl.Map({
        container: mapContainer,
        style: "mapbox://styles/mapbox/streets-v9",
        projection: "globe", //globe || mercator || Use globe projection
        zoom: 1.5, // Initial zoom level
        center: [0, 0], // Initial center
      });

      // Add navigation controls (zoom in/out, fullscreen, etc.)
      map.addControl(new mapboxgl.NavigationControl(), "top-right");
      map.addControl(new mapboxgl.FullscreenControl(), "top-right");
      map.addControl(new mapboxgl.ScaleControl(), "bottom-left");

      // Add Geolocate control (find user's location)
      const geolocate = new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserLocation: true,
      });
      map.addControl(geolocate);

      // Add Mapbox Geocoder (Search) control
      const geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl,
        marker: true, // Add a marker at the searched location
        placeholder: "Search places", // Placeholder text for the search bar
      });
      map.addControl(geocoder, "top-left"); // Position the search bar

      // Set default atmosphere style (fog effect)
      map.on("style.load", () => {
        map.setFog({});
      });

      // Add Mapbox Draw control (draw points, lines, polygons)
      const draw = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
          point: true,
          line_string: true,
          polygon: true,
          trash: true,
        },
      });
      map.addControl(draw, "top-left");

      // Add GeoJSON data as a source and layer to the map
      map.on("load", () => {
        console.log("Map loaded. Adding GeoJSON source and layer...");

        // Add GeoJSON source
        map.addSource("geoJSON-source", {
          type: "geojson",
          data: geoJSONData,
        });

        console.log("GeoJSON source added:", map.getSource("geoJSON-source"));

        // Add layers based on geometry type (points, lines, polygons)
        geoJSONData.features.forEach((feature, index) => {
          const layerId = `geoJSON-layer-${index}`;
          const sourceId = `geoJSON-source-${index}`;

          // Add source for each feature
          map.addSource(sourceId, {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: [feature],
            },
          });

          // Add layer based on geometry type
          switch (feature.geometry.type) {
            case "Point":
              map.addLayer({
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
              map.addLayer({
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
              map.addLayer({
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
          console.log("Fitting map to bounds:", bounds.toArray());
          map.fitBounds(bounds, { padding: 50 }); // Add padding if needed
        } else {
          console.warn("GeoJSON bounds are empty. Cannot fit map to bounds.");
        }

        // Handle interactions (click)
        map.on("click", (e) => {
          const features = map.queryRenderedFeatures(e.point);
          if (features.length) {
            const feature = features[0];
            console.log("Clicked Feature:", feature.properties.name);
            if (feature.properties.name) {
              new mapboxgl.Popup()
                .setLngLat(e.lngLat)
                .setHTML(feature.properties.name ? `<strong>${feature.properties.name}</strong>` : '<em>Name not available</em>')
                .addTo(map);
            }
          }
        });
      });

      // Handle window resizing
      window.addEventListener("resize", () => {
        map.resize();
      });

      // Event listener for drawing actions (create, delete, update)
      map.on("draw.create", (e) => {
        this.geojsondata = draw.getAll(); // Update this.geojsondata
        console.log("Created Shape:", this.geojsondata);
        this.showDownloadButton = true;
      });

      map.on("draw.delete", (e) => {
        console.log("Deleted Shape:", e);
        this.showDownloadButton = false;
      });

      map.on("draw.update", (e) => {
        console.log("Updated Shape:", e);
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

:deep(.mapboxgl-ctrl-geocoder--input){
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
</style>