/**
 * Test data module for providing consistent test data and data generators
 */

export const data = {
  /**
   * Get address data for form submission
   * @returns {Object} Address object with standard fields
   */
  getAddressData() {
    return {
      line1: '10 DOWNING STREET',
      line2: '',
      town: 'LONDON',
      postcode: 'RH107EE',
      county: 'Surrey',
    };
  },

  /**
   * Get date data for entry date field
   * @returns {Object} Date object with day, month, year
   */
  getDateData() {
    return {
      day: '1',
      month: '1',
      year: '2025',
    };
  },

  /**
   * Get insurer address data
   * @returns {Object} Address object for insurance company
   */
  getInsurerAddressData() {
    return {
      'cjFAAt__addressLine1': '30 Downing Street',
      'cjFAAt__addressLine2': '',
      'cjFAAt__town': 'London',
      'cjFAAt__postcode': 'rh107ee',
      'cjFAAt__county': 'Surrey',
      'cjFAAt__uprn': '123',
    };
  },

  /**
   * Get insurance expiration date data
   * @returns {Object} Date object for policy expiration
   */
  getExpirationDateData() {
    return {
      'zzIrNa__day': '01',
      'zzIrNa__month': '1',
      'zzIrNa__year': '2025',
    };
  },

  /**
   * Generate random owner name
   * Useful for creating unique data across test runs
   * @returns {string} Random name
   */
  generateRandomName() {
    const names = ['Bob', 'Alice', 'Charlie', 'David', 'Eve', 'Frank'];
    return names[Math.floor(Math.random() * names.length)];
  },

  /**
   * Generate random boat name
   * @returns {string} Random boat name with timestamp
   */
  generateRandomBoatName() {
    const adjectives = ['Swift', 'Mighty', 'Golden', 'Silver', 'Blue'];
    const nouns = ['Sailor', 'Wave', 'Wind', 'Storm', 'Quest'];
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${adjective} ${noun}`;
  },

  /**
   * Generate random email address
   * @returns {string} Random email address
   */
  generateRandomEmail() {
    const timestamp = Date.now();
    return `test-${timestamp}@example.com`;
  },
};
