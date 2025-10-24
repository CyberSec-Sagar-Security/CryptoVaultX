# Test upload script for CryptoVault
$uri = "http://localhost:5000/api/files/"
$filePath = "test_encrypted_upload.txt"
$metadata = @{
    originalFilename = "test.txt"
    size = 100
    ivBase64 = "dGVzdGl2MTIz"
    algo = "AES-256-GCM"
} | ConvertTo-Json

# Read file as bytes
$fileBytes = [System.IO.File]::ReadAllBytes($filePath)
$boundary = [System.Guid]::NewGuid().ToString()

# Create multipart form data
$LF = "`r`n"
$bodyLines = @(
    "--$boundary",
    'Content-Disposition: form-data; name="metadata"',
    '',
    $metadata,
    "--$boundary",
    'Content-Disposition: form-data; name="file"; filename="test_encrypted_upload.txt"',
    'Content-Type: application/octet-stream',
    '',
    [System.Text.Encoding]::GetEncoding("iso-8859-1").GetString($fileBytes),
    "--$boundary--"
)

$body = $bodyLines -join $LF

try {
    $response = Invoke-RestMethod -Uri $uri -Method Post -Body $body -ContentType "multipart/form-data; boundary=$boundary"
    Write-Host "Upload successful:"
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "Upload failed:"
    Write-Host $_.Exception.Message
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        Write-Host $reader.ReadToEnd()
    }
}