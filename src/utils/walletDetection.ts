/**
 * Wallet Detection Utilities
 * 
 * This module provides utilities for detecting mobile devices,
 * MetaMask browser environment, and generating deep links for mobile.
 */

/**
 * Detects if the current device is a mobile device
 */
export const isMobileDevice = (): boolean => {
  return /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

/**
 * Detects if the app is running inside MetaMask mobile browser
 */
export const isMetaMaskBrowser = (): boolean => {
  return !!(window.ethereum && window.ethereum.isMetaMask);
};

/**
 * Gets the appropriate deep link URL for MetaMask Mobile
 * Handles both development and production environments
 * Uses multiple formats to ensure compatibility
 */
export const getMetaMaskDeepLink = (): string => {
  const isDevelopment = window.location.hostname === 'localhost' || 
                        window.location.hostname.includes('192.168') ||
                        window.location.hostname === '127.0.0.1';
  
  let baseUrl: string;
  
  if (isDevelopment) {
    // For development, use the fixed IP address with http
    baseUrl = 'localhost:3000';
  } else {
    // For production, use the current domain with https
    baseUrl = window.location.host + window.location.pathname + window.location.search;
  }
  
  // Return the complete URL for the dApp browser
  return `metamask://dapp/${baseUrl}`;
};

/**
 * Determines if the user should be redirected to MetaMask mobile
 */
export const shouldRedirectToMetaMask = (): boolean => {
  return isMobileDevice() && !isMetaMaskBrowser();
};

/**
 * Redirects user to MetaMask mobile app with enhanced compatibility
 * Uses multiple techniques to ensure the dApp browser opens correctly
 */
export const redirectToMetaMask = (): void => {
  if (!shouldRedirectToMetaMask()) return;
  
  const deepLink = getMetaMaskDeepLink();
  console.log('Redirecting to MetaMask with deep link:', deepLink);
  
  // Method 1: Try window.location.href (most reliable)
  try {
    window.location.href = deepLink;
  } catch (error) {
    console.warn('Method 1 failed:', error);
    
    // Method 2: Try window.open as fallback
    try {
      window.open(deepLink, '_self');
    } catch (error2) {
      console.warn('Method 2 failed:', error2);
      
      // Method 3: Create a temporary link and click it
      try {
        const link = document.createElement('a');
        link.href = deepLink;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error3) {
        console.error('All redirect methods failed:', error3);
        // Show user-friendly message
        showMetaMaskInstallPrompt();
      }
    }
  }
};

/**
 * Shows a prompt to install MetaMask if deep linking fails
 */
const showMetaMaskInstallPrompt = (): void => {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);
  
  let storeUrl = '';
  if (isIOS) {
    storeUrl = 'https://apps.apple.com/app/metamask/id1438144202';
  } else if (isAndroid) {
    storeUrl = 'https://play.google.com/store/apps/details?id=io.metamask';
  }
  
  if (storeUrl) {
    const userWantsToInstall = window.confirm('MetaMask not found. Would you like to install it?');
    if (userWantsToInstall) {
      window.open(storeUrl, '_blank');
    }
  }
};

/**
 * Checks if MetaMask is available in the current environment
 */
export const isMetaMaskAvailable = (): boolean => {
  return typeof window.ethereum !== 'undefined';
};

/**
 * Alternative deep link method using universal links (fallback)
 * Some devices respond better to this approach
 */
export const getMetaMaskUniversalLink = (): string => {
  const isDevelopment = window.location.hostname === 'localhost' || 
                        window.location.hostname.includes('192.168') ||
                        window.location.hostname === '127.0.0.1';
  
  let fullUrl: string;
  
  if (isDevelopment) {
    fullUrl = `http://localhost:3000${window.location.pathname}${window.location.search}`;
  } else {
    fullUrl = window.location.href;
  }
  
  // URL encode the full URL for the universal link
  const encodedUrl = encodeURIComponent(fullUrl);
  return `https://metamask.app.link/dapp/${encodedUrl}`;
};

/**
 * Enhanced redirect with timeout and fallback to universal link
 */
export const redirectToMetaMaskWithFallback = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!shouldRedirectToMetaMask()) {
      resolve(false);
      return;
    }
    
    const deepLink = getMetaMaskDeepLink();
    const universalLink = getMetaMaskUniversalLink();
    
    console.log('Primary deep link:', deepLink);
    console.log('Fallback universal link:', universalLink);
    
    // Set a flag to detect if we're still on the page after attempting redirect
    let redirectAttempted = false;
    
    // First attempt: Standard deep link
    const attemptDeepLink = () => {
      redirectAttempted = true;
      window.location.href = deepLink;
    };
    
    // Fallback attempt: Universal link after timeout
    const fallbackTimeout = setTimeout(() => {
      if (redirectAttempted) {
        console.log('Deep link may have failed, trying universal link...');
        window.location.href = universalLink;
      }
    }, 2500);
    
    // Detect if user comes back to the page (deep link failed)
    const visibilityChangeHandler = () => {
      if (document.visibilityState === 'visible' && redirectAttempted) {
        clearTimeout(fallbackTimeout);
        console.log('Returned to page, deep link may have failed');
        // Try universal link as backup
        setTimeout(() => {
          window.location.href = universalLink;
        }, 1000);
      }
    };
    
    document.addEventListener('visibilitychange', visibilityChangeHandler);
    
    // Clean up after 10 seconds
    setTimeout(() => {
      document.removeEventListener('visibilitychange', visibilityChangeHandler);
      clearTimeout(fallbackTimeout);
      resolve(true);
    }, 10000);
    
    // Start the redirect process
    attemptDeepLink();
  });
};

/**
 * Gets a user-friendly description of the current wallet environment
 */
export const getWalletEnvironmentInfo = (): {
  isMobile: boolean;
  isMetaMaskBrowser: boolean;
  hasMetaMask: boolean;
  shouldRedirect: boolean;
} => {
  return {
    isMobile: isMobileDevice(),
    isMetaMaskBrowser: isMetaMaskBrowser(),
    hasMetaMask: isMetaMaskAvailable(),
    shouldRedirect: shouldRedirectToMetaMask()
  };
};
