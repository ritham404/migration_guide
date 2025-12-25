SERVICE_MAP = {
    "azure_blob_storage": {
        "patterns": ["BlobServiceClient", "azure.storage.blob", "blob.core.windows.net"],
        "gcp_equivalent": "Google Cloud Storage",
        "docs_url": "https://cloud.google.com/storage/docs/reference/libraries"
    },
    "azure_sql_database": {
        "patterns": ["pyodbc", "azure.sql", "database.windows.net"],
        "gcp_equivalent": "Google Cloud SQL",
        "docs_url": "https://cloud.google.com/sql/docs/mysql/connect-connectors"
    },
    "azure_functions": {
        "patterns": ["azure.functions", "func.HttpResponse"],
        "gcp_equivalent": "Google Cloud Functions",
        "docs_url": "https://cloud.google.com/functions/docs/first-python"
    },
    "azure_cosmos_db": {
        "patterns": ["azure.cosmos", "cosmos.azure.com"],
        "gcp_equivalent": "Google Cloud Firestore",
        "docs_url": "https://cloud.google.com/firestore/docs/client/libraries-python"
    }
}
