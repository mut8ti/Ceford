# PowerShell script to update HTML files
$htmlFiles = Get-ChildItem -Path . -Filter *.html

foreach ($file in $htmlFiles) {
    $content = Get-Content $file.FullName -Raw
    
    # Add version to CSS reference
    $content = $content -replace 'href="styles.min.css"', 'href="styles.min.v1.css"'
    
    # Add version to JS references
    $content = $content -replace 'src="main.js"', 'src="main.v1.js"'
    $content = $content -replace 'src="js/theme.js"', 'src="js/theme.v1.js"'
    
    # Add performance monitoring script before </body>
    $monitoringScript = @"
    <script>
        // Performance monitoring
        window.addEventListener('load', function() {
            const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
            console.log('Page load time:', loadTime + 'ms');
            
            const entries = performance.getEntriesByType('resource');
            entries.forEach(entry => {
                if (entry.transferSize === 0) {
                    console.log('Loaded from cache:', entry.name);
                }
            });
        });
    </script>
"@
    
    $content = $content -replace '</body>', "$monitoringScript`n</body>"
    
    # Save changes
    $content | Set-Content $file.FullName -Force
}
