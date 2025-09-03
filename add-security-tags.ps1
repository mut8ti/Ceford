# PowerShell script to add security meta tags to HTML files
$htmlFiles = Get-ChildItem -Path . -Filter *.html

# Security meta tags to add
$securityTags = @'
<!-- Security Meta Tags -->
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com https://fonts.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; img-src 'self' data: https:; connect-src 'self'; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self';">
<meta http-equiv="X-Content-Type-Options" content="nosniff">
<meta http-equiv="X-Frame-Options" content="SAMEORIGIN">
<meta http-equiv="Referrer-Policy" content="strict-origin-when-cross-origin">
<meta http-equiv="Feature-Policy" content="geolocation 'none'; microphone 'none'; camera 'none'">
'@

foreach ($file in $htmlFiles) {
    Write-Host "Processing: $($file.Name)"
    
    $content = Get-Content $file.FullName -Raw
    
    # Add security tags after the first <meta> tag or after <head>
    if ($content -match '<head>') {
        $content = $content -replace '<head>', "<head>`n  $securityTags"
    } elseif ($content -match '<meta') {
        $content = $content -replace '(<meta[^>]*>)', "`$1`n  $securityTags"
    }
    
    # Add error handler script reference
    if ($content -notmatch 'error-handler.js') {
        $content = $content -replace '</head>', "  <script src='js/error-handler.js'></script>`n</head>"
    }
    
    # Save changes
    $content | Set-Content $file.FullName -Force -Encoding UTF8
    Write-Host "Updated: $($file.Name)"
}

Write-Host "Security tags added to all HTML files!"
