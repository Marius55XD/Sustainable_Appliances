# Sustainable Appliances

This is a website for selling sustainable and energy-efficient appliances. Users can look at products, add them to a shopping cart, and buy them. There are also admin features for managing products and users.

## What the website can do

- Show all available products
- Show information about one product
- Create an account and log in
- Add products to a shopping cart
- Change or remove items from the cart
- Buy products using PayPal
- See previous purchases
- Add, edit, and delete products as an admin
- Upload product and profile pictures
- Store the data in MongoDB

## Technologies used

### Frontend

- React
- React Router
- Bootstrap
- Axios
- PayPal

### Backend

- Node.js
- Express
- MongoDB
- Mongoose
- Multer for uploading images
- bcrypt for passwords

## Folders

```text
client/   React frontend
server/   Express backend and MongoDB code
```

The frontend and backend need to be run separately.

## What you need installed

Before running the project, install:

- Node.js and npm
- MongoDB

MongoDB should be running on the normal local port, which is `27017`.

## Installing the project

Open a terminal in the main project folder and install the client packages:

```bash
cd client
npm install
```

Then install the server packages:

```bash
cd ../server
npm install
```

## Server settings

Create a file called `.env` inside the `server/config` folder. It can contain:

```env
DB_NAME=sustainable_appliances
SERVER_PORT=4000
LOCAL_HOST=http://localhost:3000
UPLOADED_FILES_FOLDER=./uploads
ACCESS_LEVEL_NORMAL_USER=1
ACCESS_LEVEL_ADMIN=2
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change-this-password
```

The admin email and password can be changed in this file. The `.env` file should not be uploaded to GitHub if it contains real passwords.

## Running the project

First start the backend:

```bash
cd server
node server.js
```

The server runs on `http://localhost:4000`.

Open another terminal and start the frontend:

```bash
cd client
npm start
```

The website will then open at `http://localhost:3000`.

## Useful client commands

Run these commands from the `client` folder:

```bash
npm start
```

Starts the website in development mode.

```bash
npm test
```

Runs the React tests.

```bash
npm run build
```

Creates a production build of the website.

## API routes

The backend has routes for:

- `/products` for product information
- `/users` for registering, logging in, and user accounts
- `/sales` for payments and purchase history
- `/uploads` for displaying uploaded images

The frontend gets the backend address from `client/src/config/global_constants.js`.

## PayPal

The project is set up to use PayPal Sandbox for testing. Real PayPal details should be added before using the website for real payments.

## Possible improvements

Some things that could be improved in the future are adding more tests, improving the login security, and adding more product filters.
