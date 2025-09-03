# PowerShell script to convert images to WebP format
# This script requires ImageMagick to be installed

$imageExtensions = @("*.jpg", "*.jpeg", "*.png")
$sourceDir = ".\images"
$quality = 80  # Quality setting (1-100), lower = smaller file size but lower quality

# Check if ImageMagick is installed
if (-not (Get-Command magick -ErrorAction SilentlyContinue)) {
    Write-Host "ImageMagick is not installed. Please install it first from https://imagemagick.org/"
    exit 1
}

# Process each image file
Get-ChildItem -Path $sourceDir -Include $imageExtensions -Recurse | ForEach-Object {
    $webpFile = [System.IO.Path]::ChangeExtension($_.FullName, ".webp")
    
    # Skip if WebP version already exists and is newer
    if ((Test-Path $webpFile) -and ($_.LastWriteTime -le (Get-Item $webpFile).LastWriteTime)) {
        Write-Host "Skipping $($_.Name) - WebP version already exists and is up to date"
        return
    }
    
    Write-Host "Converting $($_.Name) to WebP..."
    
    # Convert to WebP with specified quality
    & magick $_.FullName -quality $quality -define webp:lossless=false -define webp:method=6 $webpFile
    
    # Get original and new file sizes
    $originalSize = (Get-Item $_.FullName).Length / 1KB
    $newSize = (Get-Item $webpFile).Length / 1KB
    $savings = [math]::Round((1 - ($newSize / $originalSize)) * 100, 2)
    
    Write-Host "  Original: $($originalSize.ToString('0.00')) KB"
    Write-Host "  WebP:     $($newSize.ToString('0.00')) KB"
    Write-Host "  Savings:  $savings%"
    
    # Update the file timestamp to match original
    (Get-Item $webpFile).LastWriteTime = $_.LastWriteTime
}

Write-Host "\nOptimization complete!"
