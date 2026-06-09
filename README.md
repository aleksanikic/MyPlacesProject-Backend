# MyPlacesProject-Backend

> A backend application that manages user data, handles authentication, and stores the visited locations for My Places Journal.

**Base API URL:** https://my-places-project-backend.vercel.app/
<br>
**Frontend Repository:** https://github.com/aleksanikic/MyPlacesProject-Frontend


##  Routes and Functionality

### 1. Authentication
Handles secure user registration and login, ensuring that passwords are safely hashed and users receive JWTs for authenticated access to protected routes.

### 2. Users List
Handles a GET request to fetch all registered users directly from the database, providing the data needed for the application's landing page.

### 3. Places Management
Connects to MongoDB to manage the creation, reading, updating, and deletion of user places. Each place is associated with its creator and provides location data for the frontend map interface.

### 4. Image Handling
Manages the receiving, storing, and providing of the custom photos that users upload when they add a new place or create a new account.

## How to run the program locally:
  In the terminal, we run the command npm install.<br>
  Add the following variables to your `.env` file:<br>
  DB_USER=your_dbusername_here<br>
  DB_PASSWORD=your_dbpassword_here<br>
  GOOGLE_API_KEY=your_google_api_key_here<br>
  JWT_KEY=your_jwt_key_here<br>
  CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name_here<br>
  CLOUDINARY_API_KEY=your_cloudinary_api_key_here<br>
  CLOUDINARY_API_SECRET=your_cloudinary_api_secret_key_here<br>
  Then run the [npm start] command in the terminal.<br>
