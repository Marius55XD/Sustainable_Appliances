# Sustainable Appliances

Sustainable Appliances is a full-stack web app for browsing and buying energy-efficient products.  
It includes user accounts, admin product management, a shopping cart, checkout flow, and purchase history.

## Tech Stack

- **Frontend:** React (Create React App), React Router, Bootstrap, Axios
- **Backend:** Node.js, Express, Mongoose, Multer, Bcrypt
- **Database:** MongoDB
- **Payments:** PayPal Sandbox integration

## Main Features

- Product catalog with product details
- Shopping cart with quantity management and local storage persistence
- User registration, login, logout, and profile editing
- Admin functionality for:
  - adding/editing/deleting products
  - viewing and deleting users
  - resetting collections and uploads
- Purchase recording and purchase history (admin sees all, user sees own)
- Product image uploads for products and profile photos

## Project Structure

```text
Sustainable_Appliances-main/
├── client/   # React frontend
└── server/   # Express + MongoDB backend
```

## Prerequisites

- Node.js (LTS recommended)
- npm
- MongoDB running locally on default host (`mongodb://localhost`)

## Setup

1. Install frontend dependencies:
   ```bash
   cd /home/runner/work/Sustainable_Appliances/Sustainable_Appliances/Sustainable_Appliances-main/client
   npm install
   ```

2. Install backend dependencies:
   ```bash
   cd /home/runner/work/Sustainable_Appliances/Sustainable_Appliances/Sustainable_Appliances-main/server
   npm install
   ```

3. Configure environment variables in:
   ```text
   /home/runner/work/Sustainable_Appliances/Sustainable_Appliances/Sustainable_Appliances-main/server/config/.env
   ```

   Example values:
   ```env
   DB_NAME=your_database_name
   SERVER_PORT=4000
   UPLOADED_FILES_FOLDER=./uploads
   LOCAL_HOST=http://localhost:3000
   ```

## Run Locally

1. Start MongoDB.
2. Start the backend:
   ```bash
   cd /home/runner/work/Sustainable_Appliances/Sustainable_Appliances/Sustainable_Appliances-main/server
   node server.js
   ```
3. Start the frontend:
   ```bash
   cd /home/runner/work/Sustainable_Appliances/Sustainable_Appliances/Sustainable_Appliances-main/client
   npm start
   ```
4. Open `http://localhost:3000`.

## Frontend Scripts

Run from `/home/runner/work/Sustainable_Appliances/Sustainable_Appliances/Sustainable_Appliances-main/client`:

- `npm start` - start development server
- `npm test` - run tests
- `npm run build` - create production build

## Backend Routes (high level)

- **Products**
  - `GET /products`
  - `GET /products/:id`
  - `POST /products`
  - `PUT /products/:id`
  - `DELETE /products/:id`
  - `POST /products/decrement-stock`

- **Users**
  - `POST /users/register/:name/:email/:password`
  - `POST /users/login/:email/:password`
  - `GET /users`
  - `PUT /users/:id`
  - `DELETE /users/:id`
  - `POST /users/reset_user_collection`

- **Sales**
  - `POST /sales`
  - `GET /sales/history`

## Notes

- Frontend API base URL is currently hardcoded to `http://localhost:4000` in `client/src/config/global_constants.js`.
- Uploaded files are served from `/uploads`.
