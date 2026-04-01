import http from 'k6/http';
import { auth } from './auth.js';

/**
 * Request module for handling form submissions and HTTP operations
 */

export const requests = {
  /**
   * Submit a form page with the given data
   * @param {string} baseUrl - Base URL of the application
   * @param {string} formId - Form identifier
   * @param {string} pageSlug - The page identifier (e.g., 'page-name')
   * @param {Object} formData - Form fields to submit
   * @param {string} crumb - CSRF token (crumb)
   * @returns {Object} HTTP response object
   */
  submitFormPage(baseUrl, formId, pageSlug, formData, crumb) {
    const url = `${baseUrl}/form/${formId}/${pageSlug}`;

    // Build the form data payload
    const payload = {
      ...formData,
      crumb: crumb,
    };

    const response = http.post(url, payload, {
      headers: auth.getHeaders(),
      redirects: 5,
    });

    return response;
  },

  /**
   * Upload a file for the form
   * Simulates file upload by posting an empty file reference with crumb
   * @param {string} baseUrl - Base URL of the application
   * @param {string} formId - Form identifier
   * @param {string} crumb - CSRF token (crumb)
   * @returns {Object} HTTP response object
   */
  uploadFile(baseUrl, formId, crumb) {
    const url = `${baseUrl}/form/${formId}/proof-of-address`;

    // Note: K6 has different file upload mechanism compared to JMeter
    // This simulates the form submission with file reference
    // For actual file upload, you would use http.file()
    const payload = {
      crumb: crumb,
      // File would be included here: http.file(fileContent, 'filename.txt', 'text/plain')
    };

    const response = http.post(url, payload, {
      headers: auth.getHeaders(),
      redirects: 5,
    });

    return response;
  },

  /**
   * Get a form page without submitting data
   * @param {string} baseUrl - Base URL of the application
   * @param {string} formId - Form identifier
   * @param {string} pageSlug - The page identifier
   * @returns {Object} HTTP response object
   */
  getFormPage(baseUrl, formId, pageSlug) {
    const url = `${baseUrl}/form/${formId}/${pageSlug}`;

    const response = http.get(url, {
      headers: auth.getHeaders(),
      redirects: 5,
    });

    return response;
  },
};
