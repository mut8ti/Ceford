// Error Handler and Console Error Fixes
(function() {
    'use strict';
    
    // Global error handler
    window.addEventListener('error', function(event) {
        console.warn('Error caught:', event.error);
        // Prevent default error handling
        event.preventDefault();
    });
    
    // Promise rejection handler
    window.addEventListener('unhandledrejection', function(event) {
        console.warn('Unhandled promise rejection:', event.reason);
        event.preventDefault();
    });
    
    // CSP violation handler
    if (window.SecurityPolicyViolationEvent) {
        document.addEventListener('securitypolicyviolation', function(event) {
            console.warn('CSP Violation:', {
                blockedURI: event.blockedURI,
                violatedDirective: event.violatedDirective,
                sourceFile: event.sourceFile
            });
        });
    }
    
    // Safe console methods
    const safeConsole = {
        log: function(...args) {
            if (console && console.log) {
                console.log(...args);
            }
        },
        warn: function(...args) {
            if (console && console.warn) {
                console.warn(...args);
            }
        },
        error: function(...args) {
            if (console && console.error) {
                console.error(...args);
            }
        }
    };
    
    // Make safe console available globally
    window.safeConsole = safeConsole;
    
    // Performance monitoring with error handling
    window.addEventListener('load', function() {
        try {
            if (window.performance && window.performance.timing) {
                const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
                safeConsole.log('Page load time:', loadTime + 'ms');
                
                // Check for cached resources
                if (window.performance.getEntriesByType) {
                    const entries = window.performance.getEntriesByType('resource');
                    entries.forEach(entry => {
                        if (entry.transferSize === 0) {
                            safeConsole.log('Loaded from cache:', entry.name);
                        }
                    });
                }
            }
        } catch (error) {
            safeConsole.warn('Performance monitoring error:', error);
        }
    });
    
    // Safe DOM manipulation
    window.safeDOM = {
        getElement: function(selector) {
            try {
                return document.querySelector(selector);
            } catch (error) {
                safeConsole.warn('DOM query error:', error);
                return null;
            }
        },
        
        addEventListener: function(element, event, handler) {
            try {
                if (element && element.addEventListener) {
                    element.addEventListener(event, handler);
                    return true;
                }
            } catch (error) {
                safeConsole.warn('Event listener error:', error);
            }
            return false;
        }
    };
})();
