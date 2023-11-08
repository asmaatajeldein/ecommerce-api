# E-Commerce API

## Database Diagram 
<img width="1543" src="https://github.com/asmaatajeldein/ecommerce-api/blob/main/assets/db-diagram-transparent.png">

## Installation
To run this application locally or deploy it to your own server, follow these steps:

- Clone this repository to your local machine.
```bash
$ git clone https://github.com/asmaatajeldein/ecommerce-api.git

$ cd ecommerce-api
```

- Install the required dependencies.

```bash
$ npm install
# or
$ yarn install
```

- Update `.env.example` file name to be `.env` and add values to the variables.

- Run the database migrations to create the necessary tables in your database.

```bash
$ npx prisma migrate dev
```

## Running the app
```bash
# development
$  npm run start

# watch mode
$  npm run start:dev

# production mode
$  npm run start:prod
```

Access the application in your web browser at http://localhost:3333.
