# PEPPOL SMP Server

A full-stack PEPPOL SMP server application built with Node.js, Express, TypeScript, and PostgreSQL. This server provides all the necessary functionality to manage and publish PEPPOL participant capabilities in a compliant manner.

## ✨ Features

*   **PEPPOL-compliant Endpoints:** Implements the required Service Group and Service Metadata endpoints.
*   **Full-stack Application:** Includes a front-end for administrative tasks.
*   **User Management:** Secure user authentication and management with password hashing.
*   **Participant Management:** CRUD operations for managing SMP participants.
*   **Multiple Modes:** Supports `development`, `certification`, `uae-certification`, and irreversible `production` modes.
*   **Database Support:** Uses PostgreSQL for robust data storage in production.
*   **Secure:** Uses HTTPS with self-signed certificates for development.

## 🚀 Getting Started

To get a local instance of the SMP server up and running, follow the instructions below.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or later)
-   [npm](https://www.npmjs.com/) (included with Node.js)
-   [PostgreSQL](https://www.postgresql.org/) (v14 or later)
-   `openssl` (for generating a self-signed certificate)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/DTR3734/YC-SMP.git
    cd YC-SMP
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Configure your environment:**

    Create a `.env` file in the root of the project and add your database connection details:

    ```env
    # .env
    DB_HOST=localhost
    DB_USER=your_postgres_user
    DB_PASSWORD=your_postgres_password
    DB_DATABASE=smp_server
    DB_PORT=5432
    ```

4.  **Initialize the database:**

    ```bash
    npm run db:init
    ```

5.  **Generate self-signed certificates for HTTPS:**

    ```bash
    npm run generate-certs
    ```

6.  **Run the server in development mode:**

    ```bash
    npm run dev
    ```

The server will be available at `https://localhost:3001`.

## ⚙️ Application Modes

The application can run in several modes:

*   **`development`**: Default mode for local development.
*   **`certification`**: For testing compliance with PEPPOL standards.
*   **`uae-certification`**: For testing compliance with the specific requirements of the UAE PEPPOL Authority.
*   **`production`**: For live, operational use. **This mode is irreversible.**

You can switch modes via the API endpoint `PUT /api/mode` with a JSON body like `{"mode": "certification"}`.

## 🤝 Contributing

We welcome contributions! Please follow these guidelines when contributing to the project.

### Reporting Bugs

-   **Ensure the bug was not already reported** by searching on GitHub under [Issues](https://github.com/DTR3734/YC-SMP/issues).
-   If you're unable to find an open issue addressing the problem, [open a new one](https://github.com/DTR3734/YC-SMP/issues/new). Be sure to include a **title and clear description**, as much relevant information as possible, and a **code sample or an executable test case** demonstrating the expected behavior that is not occurring.

### Suggesting Enhancements

-   Open a new issue with the "enhancement" label.
-   Clearly describe the proposed enhancement, why it would be useful, and provide examples if possible.

### Pull Requests

We welcome pull requests for bug fixes and feature enhancements.

1.  Fork the repository and create your branch from `main`.
2.  If you've added code that should be tested, add tests.
3.  Ensure the test suite passes.
4.  Make sure your code lints (if a linter is configured).
5.  Issue that pull request!

## 📄 License

This project is licensed under the MIT License.
