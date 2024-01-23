# Secure Notes Application

## Description

This project implements a Secure Notes Application that demonstrates the integration of JWT (JSON Web Tokens) for authentication, TOTP (Time-based One-Time Password) for two-factor authentication, and various encryption algorithms to ensure the security and integrity of the notes. It's designed to showcase how these technologies can be combined to create a robust security model for a web application.

## Features

- **JWT Authentication**: Secure user authentication using JSON Web Tokens.
- **TOTP-based 2FA**: Two-factor authentication using Time-based One-Time Passwords.
- **Note Encryption**: Encrypting notes to ensure confidentiality using advanced encryption algorithms.
- **CRUD Operations**: Create, Read, Update, and Delete functionality for notes.

## Technologies Used

- Backend: Spring Boot (Java)
- Frontend: React (JavaScript)
- Database: PostgreSQL
- Additional Libraries: JWT, Spring Security, React Router

## Getting Started

### Prerequisites

- Java JDK 17 or later
- Node.js and npm
- Docker (optional)
- PostgreSQL database

## Set Up the Backend

Navigate to the backend directory and build the project:

```bash
cd backend
./mvnw clean install
```

Run the application:

```bash
./mvnw spring-boot:run
```

## Set Up the Frontend

Navigate to the frontend directory and install the dependencies:

```bash
cd frontend
npm install
```

Run the application:

```bash
npm start
```

## Set Up the Database

### Option 1: Use Docker

Run the following command to start a PostgreSQL database in a Docker container:

```bash
docker run --name postgres -e POSTGRES_PASSWORD=postgres -d -p 5432:5432 postgres
```

### Option 2: Use Local Database

Ensure that you have a PostgreSQL database running locally and create a database called `secure_notes`.

## Usage

Navigate to http://localhost:3000/ to view the application. You can register a new account and create, read, update, and delete notes. You can also enable two-factor authentication for your account.
