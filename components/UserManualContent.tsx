import React from 'react';

const HelpSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <section className="mb-8">
        <h2 className="text-2xl font-bold border-b pb-2 mb-4 dark:border-gray-600">{title}</h2>
        <div className="space-y-4 text-gray-700 dark:text-gray-300">
            {children}
        </div>
    </section>
);

const UserManualContent: React.FC = () => {
    return (
        <div className="prose dark:prose-invert max-w-none">
            <HelpSection title="Getting Started">
                <p>
                    Welcome to the PEPPOL SMP Lookup application. This application allows you to find service metadata for any participant registered on the PEPPOL eDelivery Network. You can look up participants, check their capabilities, and verify endpoint details.
                </p>
            </HelpSection>

            <HelpSection title="Core Features">
                <h3 className="text-xl font-semibold">Single Lookup</h3>
                <p>
                    This is the main function of the application. To find a participant:
                </p>
                <ol className="list-decimal list-inside space-y-2">
                    <li>Select the participant's ID scheme from the dropdown (e.g., GLN for 0088).</li>
                    <li>Enter their unique identifier in the text box.</li>
                    <li>Click the search button.</li>
                </ol>
                <p>The application will query the PEPPOL network and display the results.</p>

                <h3 className="text-xl font-semibold">Bulk Lookup</h3>
                <p>
                    To look up multiple participants at once:
                </p>
                <ol className="list-decimal list-inside space-y-2">
                    <li>Navigate to the "Bulk Lookup" view from the side menu.</li>
                    <li>Enter a list of full participant IDs, with each ID on a new line (e.g., <code className="font-mono bg-gray-200 dark:bg-gray-700 p-1 rounded">iso6523-actorid-upis::0088:1234567890123</code>).</li>
                    <li>Click "Start Lookup" to process the list.</li>
                    <li>The results table will show the status for each ID. You can export the results to a JSON file.</li>
                </ol>
            </HelpSection>

            <HelpSection title="Understanding the Results">
                <p>
                    When a lookup is successful, the results are displayed in a series of cards.
                </p>
                <ul className="list-disc list-inside space-y-2">
                    <li><strong>Service Group Card:</strong> Each card represents a document type the participant can receive (e.g., Invoice). Click the card to expand it.</li>
                    <li><strong>Process:</strong> Inside the card, you'll see the business process associated with the document.</li>
                    <li><strong>Endpoint Details:</strong> This section contains the technical details for sending the document, including:
                        <ul className="list-circle list-inside ml-4 mt-2">
                            <li><strong>Transport Profile:</strong> The communication protocol (e.g., AS4).</li>
                            <li><strong>Endpoint URL:</strong> The technical address of the Access Point.</li>
                            <li><strong>Certificate Details:</strong> Information about the endpoint's security certificate.</li>
                        </ul>
                    </li>
                    <li><strong>Certificate Status:</strong> A badge indicates the certificate's validity:
                        <ul className="list-circle list-inside ml-4 mt-2">
                            <li><span className="font-semibold text-green-600">Valid:</span> The certificate is current.</li>
                            <li><span className="font-semibold text-yellow-600">Expiring Soon:</span> The certificate will expire in less than 30 days.</li>
                            <li><span className="font-semibold text-red-600">Expired:</span> The certificate is no longer valid.</li>
                        </ul>
                    </li>
                     <li><strong>Endpoint Health Check:</strong> Click the "Test Endpoint" button to perform a basic check and see if the endpoint URL is responsive.</li>
                </ul>
            </HelpSection>

            <HelpSection title="Advanced Features">
                 <h3 className="text-xl font-semibold">SMP Manager</h3>
                <p>
                    The SMP Manager allows you to maintain a local list of participants that you manage. This is useful for SMP providers to keep track of their clients. You can add, edit, and delete participant records. This does not affect the public PEPPOL network.
                </p>
                 <h3 className="text-xl font-semibold">Admin Panel</h3>
                <p>
                    The Admin view provides access to system-level functions:
                </p>
                 <ul className="list-disc list-inside space-y-2">
                    <li><strong>Change Password:</strong> Update the password for the 'admin' user.</li>
                    <li><strong>System Logs:</strong> View a real-time log of application events, such as settings changes, lookups, and errors. You can clear, export, and import the log history.</li>
                </ul>
            </HelpSection>
            
            <HelpSection title="Settings & Data Management">
                <h3 className="text-xl font-semibold">Settings</h3>
                <p>
                    The settings modal allows you to configure the application's behavior.
                </p>
                <ul className="list-disc list-inside space-y-2">
                    <li><strong>Application Mode:</strong> Choose between <code className="font-mono">Simulator</code> (uses mock data), <code className="font-mono">Certification</code> (connects to the PEPPOL test network), and <code className="font-mono">Production</code> (connects to the live PEPPOL network).</li>
                    <li><strong>Configuration Mode:</strong>
                        <ul className="list-circle list-inside ml-4 mt-2">
                            <li><strong>Automatic:</strong> The application automatically selects the correct SML (Service Metadata Locator) based on the Application Mode.</li>
                            <li><strong>Manual:</strong> Allows you to override the SML or even bypass it entirely by providing a direct SMP URL for lookups.</li>
                        </ul>
                    </li>
                </ul>
                <h3 className="text-xl font-semibold">Data Management</h3>
                 <p>
                    In the Settings modal, you can export all application data into a single JSON file. This backup includes your settings, search history, and system logs. You can later use the "Import Data" button to restore the application to a previous state.
                </p>
            </HelpSection>

        </div>
    );
};

export default UserManualContent;