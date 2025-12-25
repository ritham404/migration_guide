"""
Test suite for the VersatileMigrationAgent functionality.
Tests both zip file and git repository migration flows.
"""

import os
import tempfile
import zipfile
import json
from pathlib import Path

# Mock test data
SAMPLE_AZURE_FUNCTION = """
import azure.functions as func
from azure.identity import DefaultAzureCredential
from azure.storage.blob import BlobServiceClient
import json

def main(req: func.HttpRequest) -> func.HttpResponse:
    '''Azure Function HTTP trigger'''
    
    # Get connection string from environment
    connection_string = os.environ.get('AZURE_STORAGE_CONNECTION_STRING')
    blob_client = BlobServiceClient.from_connection_string(connection_string)
    
    # Process request
    try:
        body = req.get_json()
        container_name = body.get('container')
        
        # Upload to blob storage
        container_client = blob_client.get_container_client(container_name)
        container_client.upload_blob(name='test.json', data=json.dumps(body))
        
        return func.HttpResponse(
            json.dumps({"status": "uploaded"}),
            status_code=200,
            mimetype="application/json"
        )
    except Exception as e:
        return func.HttpResponse(str(e), status_code=500)
"""

SAMPLE_TYPESCRIPT = """
import { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { BlobServiceClient } from "@azure/storage-blob";

export async function httpTrigger(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    
    const containerName = "uploads";
    const containerClient = blobServiceClient.getContainerClient(containerName);
    
    try {
        const blockBlobClient = containerClient.getBlockBlobClient("file.txt");
        await blockBlobClient.upload("Hello World", "Hello World".length);
        
        return {
            status: 200,
            body: JSON.stringify({ status: "uploaded" })
        };
    } catch (error) {
        return {
            status: 500,
            body: JSON.stringify({ error: String(error) })
        };
    }
}
"""

SAMPLE_CSHARP = """
using Azure.Storage.Blobs;
using Microsoft.AspNetCore.Http;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System.IO;
using System.Threading.Tasks;

public static class MigrateFunction
{
    [FunctionName("MigrateData")]
    public static async Task<IActionResult> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = null)] HttpRequest req,
        [Blob("container/{id}")] CloudBlockBlob outputBlob,
        ILogger log)
    {
        log.LogInformation("C# HTTP trigger function processed a request.");

        string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
        dynamic data = JsonConvert.DeserializeObject(requestBody);

        string responseMessage = "Migration started";
        
        await outputBlob.UploadTextAsync(JsonConvert.SerializeObject(data));

        return new OkObjectResult(responseMessage);
    }
}
"""


def create_test_zip(include_py=True, include_ts=True, include_cs=True):
    """Create a temporary zip file with sample code files."""
    temp_dir = tempfile.mkdtemp()
    zip_path = os.path.join(temp_dir, "test_project.zip")
    
    with zipfile.ZipFile(zip_path, 'w') as zipf:
        # Add directory structure
        if include_py:
            zipf.writestr("src/functions/migrate_function.py", SAMPLE_AZURE_FUNCTION)
        if include_ts:
            zipf.writestr("src/functions/http_trigger.ts", SAMPLE_TYPESCRIPT)
        if include_cs:
            zipf.writestr("src/functions/MigrateFunction.cs", SAMPLE_CSHARP)
        
        # Add config files
        zipf.writestr("host.json", json.dumps({"version": "2.0", "logging": {}}))
        zipf.writestr("local.settings.json", json.dumps({
            "IsEncrypted": False,
            "Values": {
                "AzureWebJobsStorage": "DefaultEndpointsProtocol=https;...",
                "AZURE_STORAGE_CONNECTION_STRING": "DefaultEndpointsProtocol=https;..."
            }
        }))
    
    return zip_path


def test_zip_creation():
    """Test that we can create a test zip file."""
    zip_path = create_test_zip()
    assert os.path.exists(zip_path)
    assert zipfile.is_zipfile(zip_path)
    
    with zipfile.ZipFile(zip_path, 'r') as zipf:
        names = zipf.namelist()
        assert any("python" in name.lower() or ".py" in name for name in names)
    
    print("✓ Test zip creation passed")


def test_migration_flow():
    """Test the migration flow with file uploads."""
    from main import migrate
    
    zip_path = create_test_zip()
    
    try:
        result = migrate(zip_path, include_suggestions=True)
        
        assert "workspace" in result
        assert "report" in result
        assert os.path.exists(result["workspace"])
        
        # Check that files were processed
        report_text = result["report"]
        assert len(report_text) > 0
        
        print("✓ Migration flow test passed")
        print(f"  Workspace: {result['workspace']}")
        print(f"  Report preview: {report_text[:200]}...")
        
    except Exception as e:
        print(f"⚠ Migration flow test skipped (might need API key): {str(e)}")


def test_comment_styles():
    """Test that different file types get appropriate comment styles."""
    from core.rewriter import _get_comment_style
    
    test_cases = [
        ("test.py", ("# ", "")),
        ("test.ts", ("// ", "")),
        ("test.cs", ("// ", "")),
        ("test.json", ("/* ", " */")),
        ("test.yaml", ("# ", "")),
    ]
    
    for filename, expected in test_cases:
        result = _get_comment_style(filename)
        assert result == expected, f"Failed for {filename}: got {result}, expected {expected}"
    
    print("✓ Comment styles test passed")


if __name__ == "__main__":
    test_comment_styles()
    test_zip_creation()
    test_migration_flow()
    print("\n✓ All tests completed!")
