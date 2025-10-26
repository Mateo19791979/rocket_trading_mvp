// ======================================================================
// Service Slack — server/services/alerts/slack.js
// ======================================================================

/* eslint-disable */
import fetch from 'node-fetch';

const HOOK = process.env?.SLACK_WEBHOOK_URL || '';

export async function slackAlert(title, payload = {}) {
  if (!HOOK) return false;

  const blocks = [
    { type: 'header', text: { type: 'plain_text', text: title } },
    { type: 'section', text: { type: 'mrkdwn', text: '```' + JSON.stringify(payload, null, 2) + '```' } },
  ];

  const body = { blocks };

  try {
    const r = await fetch(HOOK, { 
      method: 'POST', 
      headers: { 'content-type': 'application/json' }, 
      body: JSON.stringify(body) 
    });
    return r?.ok;
  } catch (e) {
    console.error('[SLACK] send error', e);
    return false;
  }
}