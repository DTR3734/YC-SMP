# Build and Deployment Guide

This guide provides detailed instructions on how to build, configure, and deploy the PEPPOL SMP server for a production environment. Please read this document carefully to ensure that your SMP server is set up correctly.

## 1. Introduction

The PEPPOL SMP server is a Node.js application that can be deployed to any environment that supports Node.js. The server is designed to be highly available and scalable, and it can be deployed behind a load balancer for increased performance and reliability.

This guide will walk you through the process of setting up a production-ready SMP server, including configuring the database, managing SSL certificates, and deploying the application.

## 2. Prerequisites

Before you begin, you will need the following:

-   A server with Node.js (v18 or later) installed.
-   A PostgreSQL database (v14 or later).
-   A registered domain name for your SMP server.
-   An SSL certificate for your domain.
-   A PEPPOL-compliant certificate for signing your Service Metadata.

## 3. Database Setup

The SMP server uses a PostgreSQL database to store all participant and service information. You will need to create a new database and a user with full permissions on that database.

1.  **Create a new database:**

    ```sql
    CREATE DATABASE smp_server;
    ```

2.  **Create a new user:**

    ```sql
    CREATE USER your_postgres_user WITH PASSWORD 'your_postgres_password';
    ```

3.  **Grant permissions to the user:**

    ```sql
    GRANT ALL PRIVILEGES ON DATABASE smp_server TO your_postgres_user;
    ```

## 4. Server Configuration

The server is configured using environment variables. You will need to create a `.env` file in the root of the project and add the following variables:

```env
# .env

# Database configuration
DB_HOST=your_postgres_host
DB_USER=your_postgres_user
DB_PASSWORD=your_postgres_password
DB_DATABASE=smp_server

# SMP configuration
SMP_BASE_URL=https://your-smp-domain.com

# SSL certificate configuration
# The paths to your SSL certificate and key
SSL_CERT_PATH=./cert.pem
SSL_KEY_PATH=./key.pem
```

## 5. Build and Deployment

To build the server for production, run the following command:

```bash
npm run build
```

This will create a `dist` directory containing the compiled JavaScript files. To deploy the server, you can either run the application directly using Node.js or use a process manager like `pm2`.

### Running with Node.js

To run the server with Node.js, use the following command:

```bash
npm run start
```

### Running with pm2

To run the server with `pm2`, you can use the following command:

```bash
pm2 start dist/server.js --name smp-server
```

## 6. SSL Certificate

For a production environment, you will need to obtain an SSL certificate from a trusted Certificate Authority (CA). Once you have obtained your certificate, you will need to update the `SSL_CERT_PATH` and `SSL_KEY_PATH` environment variables to point to your certificate and key files.

## 7. PEPPOL-Specific Configuration

To be a compliant PEPPOL SMP server, you will need to do the following:

1.  **Obtain a PEPPOL-compliant certificate**: This certificate will be used to sign your `ServiceMetadata` XML files. You will need to obtain this certificate from a PEPPOL-approved Certificate Authority.

2.  **Configure your DNS**: You will need to create a CNAME record for your domain that points to the PEPPOL SML (Service Metadata Locator). This will allow other participants in the PEPPOL network to discover your SMP server.

3.  **Publish your participant information**: You will need to use the SMP server's API to publish the information for all of your participants. This includes their PEPPOL identifiers, their supported document types, and their endpoint information.
