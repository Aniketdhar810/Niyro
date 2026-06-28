// src/utils/dateParser.js
// Simple wrapper around chrono-node to parse natural language dates.
import chrono from 'chrono-node';

/**
 * Parse a text string and return an array of ISO date strings.
 * @param {string} text The raw content to parse.
 * @returns {Array<string>} Array of ISO‑8601 date strings.
 */
export function parseDates(text) {
  if (!text) return [];
  const results = chrono.parse(text);
  return results.map(r => r.start.date().toISOString());
}
