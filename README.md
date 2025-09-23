# PEPPOL SMP Server

<p align="center">
  <a href="https://peppol.eu/" target="_blank">
    <img src="https://raw.githubusercontent.com/DTR3734/YC-SMP/main/assets/peppol-logo.svg" alt="PEPPOL Logo" width="150"/>
  </a>
</p>

<h3 align="center">A production-ready, full-stack PEPPOL SMP server application.</h3>

<p align="center">
  <img src="https://img.shields.io/badge/status-active-brightgreen" alt="Project Status"/>
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="License"/>
  <a href="CONTRIBUTING.md">
    <img src="https://img.shields.io/badge/PRs-welcome-orange" alt="PRs Welcome"/>
  </a>
  <br/>
  <img src="https://img.shields.io/badge/Node.js-%3E%3D18.x-339933?logo=nodedotjs" alt="Node.js version"/>
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript" alt="TypeScript version"/>
  <img src="https://img.shields.io/badge/PostgreSQL-14.x-336791?logo=postgresql" alt="PostgreSQL version"/>
</p>

---

This repository contains a full-stack, production-ready PEPPOL Service Metadata Publisher (SMP) server. It is designed to be a complete solution for publishing your organization's PEPPOL capabilities, enabling you to participate in the PEPPOL eDelivery Network.

The server is built with Node.js, Express, and TypeScript, and it uses a PostgreSQL database to store all participant and service information. It generates all necessary PEPPOL-compliant XML documents, including digitally signed Service Metadata, and exposes a RESTful API for managing your SMP data.

## ✨ Key Features

-   **PEPPOL-Compliant**: Generates `ServiceGroup` and `SignedServiceMetadata` XML documents in full compliance with the PEPPOL SMP specification.
-   **Digital Signatures**: All `ServiceMetadata` is digitally signed using XMLDSig with a SHA-256 digest, ensuring the integrity and authenticity of your published data.
-   **Database-Driven**: All participant and service information is stored in a robust PostgreSQL database, providing a reliable and scalable data store.
-   **RESTful API**: A comprehensive RESTful API allows for easy management of participants, services, and document types.
-   **Domain-Driven**: The SMP is configured to serve a specific domain, and all generated XMLs contain absolute URLs that point to this domain.
-   **Ready to Deploy**: With a few simple configuration steps, this SMP server is ready to be deployed to a production environment.

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

    Create a `.env` file in the root of the project and add your database connection details and the base URL of your SMP:

    ```env
    # .env
    DB_HOST=localhost
    DB_USER=your_postgres_user
    DB_PASSWORD=your_postgres_password
    DB_DATABASE=smp_server
    SMP_BASE_URL=https://smp.edc.fatcloud.ea
    ```

For more detailed build and deployment instructions, please see the [**BUILD.md**](BUILD.md) file.

## 🛠️ Usage

To run the server in development mode, use the following command:

```bash
npm run dev
```

The server will start on `https://localhost:3001`.

To build the server for production, use:

```bash
npm run build
```

And to run the production server, use:

```bash
npm run start
```

## 🤝 Contributing

Contributions are welcome! Please see our [**CONTRIBUTING.md**](CONTRIBUTING.md) for details on how to contribute to this project.

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for more information.
