# Node ExpressJS API Starter

Lightweight starter for a Node JSON API.

## Features

- ES6 Syntax
- JSON Requests (POST, PUT, GET, DELETE)
- Security (Helmet, Cors, Endpoint data validation)
- Mongoose DB (Sample model)
- Code constants
- DB Config support
- .env file support
- Password management
- Winston Logging

## How to install

- Clone the repo.
- In your command prompt or console, enter `npm install`
- Set up your local Mongo database (Create a user and password for the db 't-api').
- Edit the .env file to include your database user and password.
- Run `npm run dev` to create a hot-reload server.
- Please don't commit your actual environment variables in the `.env` file. It's not secure.

## How to seed the database

- The database seeding uses the npm package `mongoose-data-seed`. The seeder files are in the folder `seeders`.
- To run the test seed, type `md-seed run` into your console.
- To create a new `users` seed, type `md-seed g users`.
- Edit the seed file generated in `seeders` to enter the data.
- Run `md-seed run` to add the data to the db.
- NB: The database config is in the `md-seed-config` file, and it used the same environment variables used to run the app.

## Contributions

- Create a separate branch in your fork.
- Push to that branch, and create a PR to the `dev` branch of this repo.

### Update

I'm working on a new version that uses `restify`, `joi`, async/await patterns, services, dependency injectors etc. It's currently pushed to the `restify` branch. Feel free to check it out there.

# TODO
- Add Mongo local setup instructions to README.
- Add tests
- Password management
- Common API responses function
- Can this be a package that is imported?
- Test:
  - signup
  - login
  - forgot pwd
  - change pwd