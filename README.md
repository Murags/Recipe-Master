# RecipeMaster

RecipeMaster is a full-stack web application that allows users to create, view, and manage recipes. It provides a platform for cooking enthusiasts to share their culinary creations and discover new recipes from other users.

## Features

- User authentication (signup, login, logout)
- Create and edit recipes with ingredients, instructions, and images
- View and search for recipes
- Rate and review recipes
- User profile management
- Responsive design for mobile and desktop

## Tech Stack

### Frontend
- Next.js
- React
- Tailwind CSS
- Axios for API requests
- React DnD for drag-and-drop functionality
- FontAwesome for icons

### Backend
- Node.js
- Express.js
- MySQL database
- Redis for caching
- Swagger for API documentation

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- MySQL
- Redis

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/recipemaster.git
   cd recipemaster
   ```

2. Install dependencies for both frontend and backend:
   ```
   npm install
   cd api && npm install
   ```

3. Set up the database:
   - Create a MySQL database named `recipemaster`
   - Run the SQL script in `api/setup.sql` to create the necessary tables

4. Configure environment variables:
   - Create a `.env` file in the `api` directory with the following variables:
     ```
     PORT=5000
     DB_HOST=localhost
     DB_USER=your_database_user
     DB_PASSWORD=your_database_password
     DB_NAME=recipemaster
     JWT_SECRET=your_jwt_secret
     REDIS_URL=redis://localhost:6379
     ```

5. Start the development servers:
   - For the frontend:
     ```
     npm run dev
     ```
   - For the backend:
     ```
     cd api && npm run start
     ```

6. Open your browser and navigate to `http://localhost:3000`

## API Documentation

The API documentation is available at `http://localhost:5000/api-docs` when the server is running. It provides detailed information about the available endpoints and their usage.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
