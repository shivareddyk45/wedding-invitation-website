/**
 * Wedding Invitation Configuration File (Re-exports from src/data/wedding.js)
 */
if (typeof require !== 'undefined' && typeof module !== 'undefined') {
  module.exports = require('./src/data/wedding.js');
} else if (typeof window !== 'undefined' && window.WEDDING_DATA) {
  window.WEDDING_CONFIG = window.WEDDING_DATA;
}
