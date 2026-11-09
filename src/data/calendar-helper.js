/**
 * Calendar Helper for Wedding Invitation
 * Generates RFC 5545 compliant iCalendar (.ics) and Google Calendar URLs
 * Single shared helper ensuring on-page text, .ics, and Google Calendar stay in sync.
 *
 * NOTE ON REMINDERS:
 * RFC 5545 .ics includes a guaranteed 1-day reminder via VALARM (TRIGGER:-PT15H for all-day).
 * Google Calendar TEMPLATE links CANNOT set reminders via URL parameters due to Google's API limitations;
 * the user's personal Google Calendar default notification settings apply for the Google option.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.CALENDAR_HELPER = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /**
   * Escape text for RFC 5545 TEXT values:
   * backslash, semicolon, comma, and newline
   */
  function escapeIcsText(str) {
    if (!str) return '';
    return String(str)
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\r\n|\n|\r/g, '\\n');
  }

  /**
   * Fold lines to maximum 75 octets per RFC 5545 section 3.1
   * Each continuation line starts with a single space.
   */
  function foldIcsLine(line, maxOctets) {
    maxOctets = maxOctets || 75;
    const encoder = typeof TextEncoder !== 'undefined' ? new TextEncoder() : null;

    function getByteLength(str) {
      if (encoder) return encoder.encode(str).length;
      if (typeof Buffer !== 'undefined') return Buffer.byteLength(str, 'utf8');
      return unescape(encodeURIComponent(str)).length;
    }

    if (getByteLength(line) <= maxOctets) {
      return line;
    }

    const chunks = [];
    let currentLine = '';
    let currentBytes = 0;
    let isFirst = true;

    // Iterate character by character (supports surrogate pairs)
    for (const char of line) {
      const charBytes = getByteLength(char);
      const limit = isFirst ? maxOctets : (maxOctets - 1); // 1 octet reserved for leading space

      if (currentBytes + charBytes > limit) {
        chunks.push(currentLine);
        currentLine = char;
        currentBytes = charBytes;
        isFirst = false;
      } else {
        currentLine += char;
        currentBytes += charBytes;
      }
    }

    if (currentLine) {
      chunks.push(currentLine);
    }

    return chunks.join('\r\n ');
  }

  /**
   * Resolve event data from wedding config
   */
  function getResolvedEvent(weddingData, eventId) {
    eventId = eventId || 'wedding';
    const groom = weddingData?.couple?.groom?.firstName || 'Nageshwar Reddy';
    const bride = weddingData?.couple?.bride?.firstName || 'Neeraja';
    const weddingTitle = `Wedding of ${groom} & ${bride}`;

    let event = null;
    if (weddingData?.journey?.events) {
      event = weddingData.journey.events.find(function (e) {
        return e.id === eventId;
      });
    }

    const siteUrl = weddingData?.meta?.url || 'https://wedding-invitation-website-x854.vercel.app/';
    const domain = siteUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '') || 'wedding-invitation-website-x854.vercel.app';
    const venue = event?.venueRef || weddingData?.venue || {};
    const venueName = venue.fullText || 'DJ Usthav Mahal, Bhavanipuram, Vijayawada';
    const mapsUrl = venue.mapsUrl || 'https://maps.google.com/?q=DJ+Usthav+Mahal,+Bhavanipuram,+Vijayawada';

    const isWedding = (!event || event.id === 'wedding');
    const title = isWedding ? weddingTitle : `${event.title?.en || 'Event'} - ${weddingTitle}`;

    const dateISO = event?.dateISO || weddingData?.weddingDate?.dateISO || '2026-12-03';
    const isTimeUnknown = (!event?.time || event.time === 'TODO_CONFIRM');

    if (isTimeUnknown) {
      console.warn(`[Calendar] Start time is TODO_CONFIRM for event "${eventId}". Generating an ALL-DAY calendar event for ${dateISO}.`);
    }

    // Build standard description as specified
    const description = `Join us in celebrating the wedding of ${groom} & ${bride}.\n\nWedding Invitation: ${siteUrl}\nVenue Directions: ${mapsUrl}`;

    return {
      id: eventId,
      title: title,
      dateISO: dateISO,
      isAllDay: isTimeUnknown,
      startISO: event?.startISO,
      endISO: event?.endISO,
      venue: venueName,
      siteUrl: siteUrl,
      mapsUrl: mapsUrl,
      domain: domain,
      description: description,
      groom: groom,
      bride: bride
    };
  }

  /**
   * Helper: Add days to YYYY-MM-DD string
   */
  function addDays(isoDateStr, days) {
    const d = new Date(isoDateStr + 'T00:00:00Z');
    d.setUTCDate(d.getUTCDate() + days);
    const yyyy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(d.getUTCDate()).padStart(2, '0');
    return `${yyyy}${mm}${dd}`;
  }

  /**
   * Format ISO date to YYYYMMDD
   */
  function toDateStamp(isoDateStr) {
    return isoDateStr.replace(/-/g, '');
  }

  /**
   * Format UTC Date to YYYYMMDDTHHMMSSZ
   */
  function toUtcStamp(isoString) {
    const d = new Date(isoString);
    const yyyy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(d.getUTCDate()).padStart(2, '0');
    const hh = String(d.getUTCHours()).padStart(2, '0');
    const min = String(d.getUTCMinutes()).padStart(2, '0');
    const ss = String(d.getUTCSeconds()).padStart(2, '0');
    return `${yyyy}${mm}${dd}T${hh}${min}${ss}Z`;
  }

  /**
   * Generate RFC 5545 compliant iCalendar string
   */
  function generateIcs(weddingData, eventId) {
    const ev = getResolvedEvent(weddingData, eventId);
    const uid = `${ev.id}-${ev.dateISO}@${ev.domain}`;
    // Stable DTSTAMP based on release
    const dtstamp = '20261109T000000Z';

    const rawLines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Wedding Invitation//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${dtstamp}`
    ];

    if (ev.isAllDay) {
      const dtStart = toDateStamp(ev.dateISO);
      const dtEnd = addDays(ev.dateISO, 1);
      rawLines.push(`DTSTART;VALUE=DATE:${dtStart}`);
      rawLines.push(`DTEND;VALUE=DATE:${dtEnd}`);
    } else {
      rawLines.push(`DTSTART:${toUtcStamp(ev.startISO)}`);
      rawLines.push(`DTEND:${toUtcStamp(ev.endISO)}`);
    }

    rawLines.push('STATUS:CONFIRMED');
    rawLines.push(`SUMMARY:${escapeIcsText(ev.title)}`);
    rawLines.push(`DESCRIPTION:${escapeIcsText(ev.description)}`);
    rawLines.push(`LOCATION:${escapeIcsText(ev.venue)}`);
    rawLines.push(`URL:${ev.siteUrl}`);

    // Required 1-Day Reminder VALARM
    // For all-day events, -P1D would trigger at midnight, so -PT15H (9:00 AM day before) is used
    rawLines.push('BEGIN:VALARM');
    rawLines.push('ACTION:DISPLAY');
    rawLines.push(`DESCRIPTION:Reminder: ${escapeIcsText(ev.title)} is tomorrow`);
    if (ev.isAllDay) {
      rawLines.push('TRIGGER:-PT15H');
    } else {
      rawLines.push('TRIGGER:-P1D');
    }
    rawLines.push('END:VALARM');

    rawLines.push('END:VEVENT');
    rawLines.push('END:VCALENDAR');

    // Fold each line to <= 75 octets and join with CRLF
    const foldedLines = rawLines.map(function (line) {
      return foldIcsLine(line, 75);
    });

    return foldedLines.join('\r\n') + '\r\n';
  }

  /**
   * Generate Google Calendar Render Link
   *
   * LIMITATION NOTE: Google Calendar template URLs do NOT support custom notification/reminder parameters.
   * The user's default Google Calendar reminder will apply.
   */
  function generateGoogleUrl(weddingData, eventId) {
    const ev = getResolvedEvent(weddingData, eventId);
    let datesParam = '';

    if (ev.isAllDay) {
      const dtStart = toDateStamp(ev.dateISO);
      const dtEnd = addDays(ev.dateISO, 1);
      datesParam = `${dtStart}/${dtEnd}`;
    } else {
      datesParam = `${toUtcStamp(ev.startISO)}/${toUtcStamp(ev.endISO)}`;
    }

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: ev.title,
      dates: datesParam,
      details: ev.description,
      location: ev.venue,
      ctz: 'Asia/Kolkata'
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }

  return {
    generateIcs: generateIcs,
    generateGoogleUrl: generateGoogleUrl,
    getResolvedEvent: getResolvedEvent,
    foldIcsLine: foldIcsLine,
    escapeIcsText: escapeIcsText
  };
});
