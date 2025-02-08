# GeoJson_data_Task
Full-stack web app for managing and visualizing geospatial data. Features include user accounts, file uploads (GeoJSON/KML/TIFF), custom shape drawing, distance measurement, point marker management, and Mapbox integration. Built with Vue.js, Git version control, and responsive design.

Geo-Data App - Backend Setup
Introduction
This is the backend setup for the Geo-Data App, which will handle user authentication, file uploads, and geospatial data processing.

Prerequisites
Before setting up the project, ensure you have the following installed:

  Node.js (v16 or later) - Download here
  MongoDB - Download or use MongoDB Atlas
  Git - For version control.

Setup Instructions
1. Create the Project Directory
    Run the following commands to create the project and initialize it:

      bash
        mkdir geo-data-app
        cd geo-data-app

2. Initialize Node.js Project
    Initialize a new Node.js project:

    bash
      npm init -y
      This will create a package.json file in your project directory.

3. Install Required Dependencies
    Install the necessary packages for the backend:

    bash
      npm install express npm i dotenv body-parser multer jsonwebtoken bcryptjs mongoose cors

      Installed Dependencies
      Here is a list of the installed dependencies and their purposes:

      Dependency	-  Description
      express	    -  A web framework for building APIs.
      body-parser	-  Parses incoming request bodies in middleware.
      multer	    -  Middleware for handling file uploads.
      jsonwebtoken-	Handles user authentication via JWT.
      bcryptjs	  -  Hashes passwords securely.
      mongoose	  -  A MongoDB object modeling tool.
      cors	      -  Enables cross-origin resource sharing for APIs.

