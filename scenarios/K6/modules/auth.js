import http from 'k6/http';

/**
 * Authentication module for handling CSRF tokens (crumb) and session initialization
 */

export const auth = {
  /**
   * Get authentication token by visiting the form and extracting crumb from cookies
   * @param {string} baseUrl - Base URL of the application
   * @param {string} formId - Form identifier
   * @returns {Object} Object containing crumb token and session data
   */
  getAuthToken(baseUrl, formId) {
    // Initial request to /{formId} returns 301 with crumb in Set-Cookie
    const initialResponse = http.get(`${baseUrl}/${formId}`, {
      headers: this.getHeaders(),
      redirects: 0,  // Don't follow redirects yet - we need to extract the crumb
    });

    let crumb = null;
    let session = null;

    // Extract crumb from Set-Cookie header in initial response
    const setCookieHeader = initialResponse.headers['Set-Cookie'];
    if (setCookieHeader) {
      const cookies = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];

      for (const cookie of cookies) {
        if (typeof cookie === 'string') {
          const crumbMatch = cookie.match(/crumb=([^;]+)/);
          const sessionMatch = cookie.match(/session=([^;]+)/);

          if (crumbMatch) crumb = crumbMatch[1].trim();
          if (sessionMatch) session = sessionMatch[1].trim();
        }
      }
    }

    if (!crumb) {
      console.error('Failed to extract crumb token from initial response');
      return null;
    }

    // Now follow redirect to actual form page
    const formResponse = http.get(`${baseUrl}/${formId}`, {
      headers: this.getHeaders(),
      redirects: 5,
    });

    if (formResponse.status !== 200) {
      console.error(`Failed to load form page. Status: ${formResponse.status}`);
      return null;
    }

    return {
      crumb: crumb,
      session: session,
    };
  },

  /**
   * Get common HTTP headers for requests
   * @returns {Object} Headers object
   */
  getHeaders() {
    return {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Cache-Control': 'no-cache',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    };
  },
};


