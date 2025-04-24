# Road To Backend with JavaScript
# YouTube Backend Clone 🎥

This is a YouTube backend clone built with **Node.js**, **Express**, and **MongoDB**. It provides robust features such as user authentication, video management, comments, likes, playlists, and subscriptions—designed for scalability and performance.

## 📁 Folder Structure

<pre lang="markdown"> ``` . ├── public/ # Static files (temporary uploads, etc.) ├── src/ │ ├── controllers/ # Route handler logic │ ├── db/ # Database connection │ ├── middlewares/ # Authentication, file uploads │ ├── models/ # Mongoose models for database │ ├── routes/ # Express routes │ └── utils/ # Utilities (e.g., error handling, cloudinary config) ``` </pre>


## 🚀 Features

### 🔐 Authentication & User Management
- Register, login, and logout functionality
- JWT-based access & refresh tokens
- Middleware-protected routes

### 🎬 Video Management
- Upload, update, and delete videos
- View count, likes, and comments per video
- Cloudinary integration for storing video files

### 🗣️ Comments & Likes
- Add comments to videos
- Like/unlike videos and tweets

### 📝 Tweets
- Share short messages (tweets)
- Like/unlike tweets
- Comment on tweets

### 📂 Playlists
- Create and manage video playlists
- Add/remove videos to/from playlists

### 📡 Subscriptions
- Subscribe/unsubscribe to users
- Fetch subscribed users' videos

### 📊 Dashboard
- Admin/user dashboard to view platform stats

### 🧪 Health Check
- API status check route for uptime monitoring

## ⚙️ Technologies Used

- **Node.js** & **Express** – Backend framework
- **MongoDB** & **Mongoose** – Database
- **JWT** – Authentication
- **Cloudinary** – Video and image storage
- **Multer** – File uploads
- **dotenv** – Environment variable management


## 🛠️ Setup Instructions

1. **Clone the repository**

    ```bash
    git clone https://github.com/your-username/youtube-backend-clone.git
    cd youtube-backend-clone
    ```

2. **Install dependencies**

    ```bash
    npm install
    ```

3. **Configure environment variables**
    - Add your secrets and keys based on the `.env` file format

4. **Run the server**

    ```bash
    npm run dev
    ```

## 📂 Environment Variables (`.env`)

```env
MONGODB_URL="your_mongodb_connection_string"

ACCESS_TOKEN_SECRET="your_access_token_secret"
ACCESS_TOKEN_EXPIRY=1d

REFRESH_TOKEN_SECRET="your_refresh_token_secret"
REFRESH_TOKEN_EXPIRY=7d

CLOUDINARY_API_SECRET="your_cloudinary_secret"
CLOUDINARY_API_KEY="your_cloudinary_key"
CLOUDINARY_CLOUD_NAME="your_cloudinary_name" 
```



    
