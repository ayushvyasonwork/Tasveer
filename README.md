# Tasveer

Tasveer is a modern social media application designed for sharing moments and thoughts through pictures. It offers a rich, interactive user experience with real-time features, AI-powered content suggestions, and enhanced performance using a robust tech stack.

## ✨ Key Features

- **Interactive Posts**: Engage with content by liking and commenting on posts in real-time.  
- **Dynamic Stories**: Post temporary stories that disappear after a set time.  
- **AI Song Recommendations**: Get AI-powered song suggestions to add to your stories.  
- **AI Tag Detection**: Automatically identifies **AI-generated images** during uploads using the **Gemini API** and attaches an **“AI Generated”** tag to such posts for transparency.  
- **Secure Authentication**: Implements token-based authentication (JWT) for secure sessions and uses bcrypt to hash passwords, ensuring user data is protected.  
- **In-App Game**: A classic Snake game is integrated for users to play.  
- **Dual Theme**: Seamlessly switch between a light and dark mode for comfortable viewing.  
- **Real-time Communication**: Utilizes Socket.io for instant updates on likes, comments, and other interactions.  
- **Optimized Performance**: Leverages Redis for caching, ensuring faster fetching and delivery of stories.  

## 🛠️ Technologies Used

-   **Frontend**: React.js, Redux for state management, Redux Persist
-   **Backend**: Node.js, Express.js, Multer for file handling
-   **Database**: MongoDB
-   **Real-time Engine**: Socket.io
-   **Caching**: Redis
-   **Security**: JSON Web Token (JWT) for authentication, bcrypt for password hashing

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You need to have Node.js and npm installed on your machine. You will also need a running instance of MongoDB and Redis.

### Installation

1.  **Clone the repository**
    ```sh
    git clone [https://github.com/ayushvyasonwork/tasveer.git](https://github.com/ayushvyasonwork/tasveer.git)
    ```

2.  **Install Backend Dependencies**
    ```sh
    cd tasveer/server
    npm install
    ```

3.  **Install Frontend Dependencies**
    ```sh
    cd ../client
    npm install
    ```

4.  **Setup Backend Environment Variables**
    Create a `.env` file in the `backend` directory and add your secret keys.
    ```
    MONGO_URI=your_mongodb_connection_string
    REDIS_URL=your_redis_url
    JWT_SECRET=your_jwt_secret_key
    ```

5.  **Setup Frontend Environment Variables**
    Create a `.env` file in the `frontend` directory and add the following configuration.
    ```
    REACT_APP_API_BASE_URL=http://localhost:5000
    REACT_APP_GEMINI_API_KEY=your_gemini_api_key
    ```

## 🏃 Usage

1.  **Start the Backend Server**
    ```sh
    cd server
    npm start
    ```

2.  **Start the Frontend Development Server**
    ```sh
    cd client
    npm start
    ```
    Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for more details.
