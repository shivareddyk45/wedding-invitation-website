/**
 * Vercel Serverless Function: /api/calendar
 * Serves RFC 5545 compliant .ics calendar files inline for Apple Calendar, Outlook, etc.
 *
 * Query Parameters:
 *   ?event=<id>  (defaults to 'wedding')
 *
 * Headers:
 *   Content-Type: text/calendar; charset=utf-8
 *   Content-Disposition: inline; filename="wedding-nageshwar-neeraja.ics"
 *   Cache-Control: public, max-age=300
 */

const weddingData = require('../src/data/wedding.js');
const calendarHelper = require('../src/data/calendar-helper.js');

module.exports = function handler(req, res) {
  // Support CORS if needed
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const eventId = req.query?.event || 'wedding';
    const icsContent = calendarHelper.generateIcs(weddingData, eventId);

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', 'inline; filename="wedding-nageshwar-neeraja.ics"');
    res.setHeader('Cache-Control', 'public, max-age=300');

    return res.status(200).send(icsContent);
  } catch (err) {
    console.error('Error generating calendar file:', err);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(500).send('Internal Server Error generating calendar file.');
  }
};
