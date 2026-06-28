// src/lib/calendarClient.js
// Google Calendar API wrapper.
// Provides free‑busy queries and event creation for a given user UID.

import { google } from 'googleapis';
import { getAccessToken } from './tokenProvider.js';

/**
 * Initialise a calendar client with a valid access token for the user.
 * @param {string} uid Firebase UID of the user.
 * @returns {Promise<calendar_v3.Calendar>} Authenticated Calendar client.
 */
async function getCalendarClient(uid) {
  const accessToken = await getAccessToken(uid);
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.calendar({ version: 'v3', auth });
}

/**
 * Query free‑busy information for a user.
 * @param {string} uid Firebase UID.
 * @param {string} timeMin ISO timestamp (inclusive).
 * @param {string} timeMax ISO timestamp (exclusive).
 * @returns {Promise<Object>} Free‑busy response.
 */
export async function queryFreeBusy(uid, timeMin, timeMax) {
  const calendar = await getCalendarClient(uid);
  const response = await calendar.freebusy.query({
    requestBody: {
      timeMin,
      timeMax,
      items: [{ id: 'primary' }],
    },
  });
  return response.data;
}

/**
 * Create a calendar event for the user.
 * @param {string} uid Firebase UID.
 * @param {Object} event Calendar event object as defined by Google API.
 * @returns {Promise<Object>} Created event resource.
 */
export async function createEvent(uid, event) {
  const calendar = await getCalendarClient(uid);
  const response = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: event,
  });
  return response.data;
}
export async function deleteEvent(uid, eventId) {
  const calendar = await getCalendarClient(uid);
  await calendar.events.delete({ calendarId: 'primary', eventId });
}

/**
 * List calendar events for the user within a time range.
 * @param {string} uid Firebase UID.
 * @param {string} timeMin ISO timestamp (inclusive).
 * @param {string} timeMax ISO timestamp (exclusive).
 * @returns {Promise<Array>} Array of event objects.
 */
export async function listEvents(uid, timeMin, timeMax) {
  const calendar = await getCalendarClient(uid);
  const response = await calendar.events.list({
    calendarId: 'primary',
    timeMin,
    timeMax,
    singleEvents: true,
    orderBy: 'startTime',
  });
  return response.data.items || [];
}
