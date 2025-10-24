# Simple Upload Test
param(
    [string]$url = "http://localhost:5000/api/files/",
    [string]$file = "simple_test.txt"
)

Write-Host "Testing file upload to: $url" -ForegroundColor Green

# Check if file exists
if (-not (Test-Path $file)) {
    Write-Host "Creating test file..." -ForegroundColor Yellow
    "Simple test content" | Out-File -FilePath $file -Encoding ASCII
}

# Read file
$fileBytes = [System.IO.File]::ReadAllBytes($file)
$fileSize = $fileBytes.Length
Write-Host "File size: $fileSize bytes" -ForegroundColor Cyan

# Create metadata
$metadata = @{
    originalFilename = $file
    size = $fileSize
    ivBase64 = "MTIzNDU2Nzg5MDEyMzQ1Ng=="  # Base64 encoded "1234567890123456"
    algo = "AES-256-GCM"
} | ConvertTo-Json -Compress

Write-Host "Metadata: $metadata" -ForegroundColor Cyan

# Create multipart form data
$boundary = [System.Guid]::NewGuid().ToString()
$LF = "`r`n"

$fileEnc = [System.Text.Encoding]::GetEncoding('iso-8859-1').GetString($fileBytes)

$bodyLines = @(
    "--$boundary",
    "Content-Disposition: form-data; name=`"file`"; filename=`"$file`"",
    "Content-Type: text/plain$LF",
    $fileEnc,
    "--$boundary",
    "Content-Disposition: form-data; name=`"metadata`"$LF",
    $metadata,
    "--$boundary--$LF"
) -join $LF

$headers = @{
    "Content-Type" = "multipart/form-data; boundary=$boundary"
}

Write-Host "Sending upload request..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri $url -Method POST -Headers $headers -Body $bodyLines
    Write-Host "SUCCESS!" -ForegroundColor Green
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Green
} catch {
    Write-Host "UPLOAD FAILED!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $errorContent = $reader.ReadToEnd()
        Write-Host "Error details: $errorContent" -ForegroundColor Red
    }
}