# Build and Deployment Guide

This guide provides instructions for building, testing, and deploying the PEPPOL SMP server.

## 🛠️ Building the Server

To create a production-ready build of the server, run the following command:

```bash
npm run build
```

This will compile the TypeScript code into JavaScript in the `dist` directory.

## 🧪 Testing

Before deploying, it is crucial to test the server in the appropriate mode.

### Running in Certification Mode

To run the server in `certification` mode for PEPPOL compliance testing, first set the mode via the API and then restart the server.

1.  **Start the server in development mode:**

    ```bash
    npm run dev
    ```

2.  **Set the mode to `certification`:**

    ```bash
    curl -X PUT -H "Content-Type: application/json" -d '{"mode":"certification"}' http://localhost:3001/api/mode
    ```

3.  **Restart the server** to apply the new mode.

### Running in UAE Certification Mode

For `uae-certification`, follow the same steps as above, but set the mode to `uae-certification`.

## 🚀 Deployment

Once the server has been thoroughly tested and is ready for production, follow these steps to deploy.

1.  **Build the application:**

    ```bash
    npm run build
    ```

2.  **Set the mode to `production`:**

    **Warning: This is an irreversible step.**

    ```bash
    curl -X PUT -H "Content-Type: application/json" -d '{"mode":"production"}' http://localhost:3001/api/mode
    ```

3.  **Start the server in production:**

    ```bash
    npm start
    ```

## 📜 PEPPOL Certification

To be a compliant PEPPOL SMP server, you must obtain a certificate from a **PEPPOL-approved Certificate Authority**. The certification process ensures that your server correctly implements the PEPPOL specifications.

-   The `certification` mode is designed to help you with this process.
-   The `uae-certification` mode is for testing against the specific requirements of the UAE PEPPOL Authority.

Once you have passed certification, you can switch the server to `production` mode.
