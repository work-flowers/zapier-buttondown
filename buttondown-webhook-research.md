# Buttondown Webhooks → Zapier REST Hook Triggers: Research

## 1. Supported Webhook Event Types

Buttondown has a comprehensive event system following the `<source>.<object>.<action>` naming convention. The full list of events available for webhook subscriptions:

### Subscriber Events (highest value for Zapier triggers)

| Event | Description |
|---|---|
| `subscriber.created` | New subscriber created |
| `subscriber.confirmed` | Subscriber confirmed enrolment (fires immediately after `created` if no double opt-in) |
| `subscriber.unsubscribed` | Subscriber manually unsubscribed |
| `subscriber.deleted` | Subscriber deleted from newsletter |
| `subscriber.updated` | Subscriber notes/metadata changed |
| `subscriber.bounced` | Email bounced |
| `subscriber.delivered` | Email successfully delivered |
| `subscriber.opened` | Subscriber opened an email |
| `subscriber.clicked` | Subscriber clicked a link |
| `subscriber.replied` | Subscriber replied to an email |
| `subscriber.commented` | Subscriber commented on an email |
| `subscriber.complained` | Subscriber complained about an email |
| `subscriber.rejected` | Subscriber/provider rejected email |
| `subscriber.changed_email` | Subscriber's email address changed |
| `subscriber.churned` | Subscriber unenrolled from paid offering |
| `subscriber.paid` | Subscriber enrolled in paid offering |
| `subscriber.paused` | Subscriber paused subscription |
| `subscriber.resumed` | Subscriber resumed subscription |
| `subscriber.referred` | Subscriber referred someone |
| `subscriber.referred.paid` | Referral converted to paid |
| `subscriber.responded_to_survey` | Subscriber responded to a survey |
| `subscriber.tags.changed` | Subscriber's tags modified |
| `subscriber.type.changed` | Subscriber's type changed |
| `subscriber.trial_started` | Trial started |
| `subscriber.trial_ended` | Trial ended |
| `subscriber.viewed_checkout_page` | Subscriber viewed checkout page |

### Email Events

| Event | Description |
|---|---|
| `email.created` | New email created, delivery starting |
| `email.sent` | Email finished delivery |
| `email.deleted` | Email deleted |
| `email.updated` | Email content/metadata updated |
| `email.status.changed` | Email status changed (e.g. draft → sent) |

### Other Events

| Event | Description |
|---|---|
| `note.created` / `note.deleted` | Notes lifecycle |
| `survey.created` / `survey.updated` / `survey.deleted` / `survey.cleared_responses` | Survey lifecycle |
| `form.created` / `form.updated` / `form.deleted` | Form lifecycle |
| `export.created` / `export.completed` / `export.failed` | Export lifecycle |
| `external_feed_item.created` | New item in an RSS feed |
| `advertising_slot.purchased` | Ad slot purchased |
| `automation.invoked` | Automation manually invoked |
| `mention.created` | Newsletter mentioned elsewhere |
| `social_mention.created` | Mentioned on social media (Reddit, Twitter, Bluesky, etc.) |
| `firewall.blocked` | Incoming request blocked by firewall |
| `date.day.started` / `date.week.started` / `date.month.started` / `date.year.started` | Temporal events (midnight UTC) |

### Third-Party Integration Events

Stripe, Memberful, Patreon, Shopify, and BigCommerce events are also available (e.g. `stripe.subscription.activated`, `shopify.customer.created`, etc.).


## 2. Webhook Configuration

### Via API (required for Zapier REST Hooks)

Buttondown provides a full CRUD API for webhooks — this is exactly what's needed for `performSubscribe` and `performUnsubscribe`.

**Create webhook:**
```
POST https://api.buttondown.com/v1/webhooks
Authorization: Token <API_KEY>

{
  "status": "enabled",
  "event_types": ["subscriber.created", "email.sent"],
  "url": "https://hooks.zapier.com/hooks/catch/...",
  "description": "Zapier trigger",
  "signing_key": "optional-hmac-key"
}
```

Response (201):
```json
{
  "id": "13121cd6-0dfc-424c-bb12-988b0a32fcb3",
  "creation_date": "2020-09-29T00:00:00Z",
  "status": "enabled",
  "event_types": ["subscriber.created"],
  "url": "https://example.com/webhook",
  "description": "",
  "signing_key": ""
}
```

**Delete webhook:**
```
DELETE https://api.buttondown.com/v1/webhooks/{id}
Authorization: Token <API_KEY>
```
Returns 204 No Content.

**List webhooks:**
```
GET https://api.buttondown.com/v1/webhooks
Authorization: Token <API_KEY>
```

Also available: `PATCH /v1/webhooks/{id}` (update), `GET /v1/webhooks/{id}` (retrieve), `POST /v1/webhooks/{id}/test` (test), `GET /v1/webhooks/{id}/attempts` (list attempts).

### Via UI

Users can also create webhooks through Settings → Create webhook in the Buttondown dashboard. This is irrelevant for the Zapier integration since REST Hooks manage subscriptions programmatically.


## 3. Payload Format

Payloads are simple JSON with two top-level fields:

```json
{
  "event_type": "subscriber.confirmed",
  "data": {
    "subscriber": "ac79483b-cd28-49c1-982e-8a88e846d7e7"
  }
}
```

**Key observation:** The `data` object appears to contain entity IDs rather than full objects. This means the `perform` function in a REST Hook trigger may need to make a follow-up API call to hydrate the full subscriber/email object, unless Buttondown sends richer payloads in practice (worth testing with the webhook test endpoint).


## 4. Mapping Webhook Events to Zapier REST Hook Triggers

### Recommended REST Hook triggers (direct replacements for polling)

| Trigger Key | Noun | Event Type(s) | Notes |
|---|---|---|---|
| `new_subscriber` | Subscriber | `subscriber.created` | Primary trigger — replaces polling `GET /v1/subscribers` |
| `subscriber_confirmed` | Subscriber | `subscriber.confirmed` | Useful for double opt-in newsletters |
| `subscriber_unsubscribed` | Subscriber | `subscriber.unsubscribed` | Important for sync workflows |
| `new_email_sent` | Email | `email.sent` | Replaces polling `GET /v1/emails` |
| `email_created` | Email | `email.created` | For draft-aware workflows |
| `subscriber_opened` | Subscriber | `subscriber.opened` | Engagement tracking |
| `subscriber_clicked` | Subscriber | `subscriber.clicked` | Engagement tracking |
| `subscriber_paid` | Subscriber | `subscriber.paid` | Monetisation triggers |
| `subscriber_churned` | Subscriber | `subscriber.churned` | Churn monitoring |
| `subscriber_replied` | Subscriber | `subscriber.replied` | Reply tracking |
| `survey_response` | Survey Response | `subscriber.responded_to_survey` | Survey integration |
| `subscriber_tag_changed` | Subscriber | `subscriber.tags.changed` | Segmentation workflows |

### Triggers to keep as polling

The `date.*` events (day/week/month/year started) don't need webhook triggers — they're time-based and better served by Zapier's own scheduling. Similarly, `export.*` events are low-frequency administrative events that polling handles fine.

### REST Hook trigger skeleton (Platform CLI)

```js
const newSubscriber = {
  key: 'new_subscriber',
  noun: 'Subscriber',
  display: {
    label: 'New Subscriber',
    description: 'Triggers instantly when a new subscriber is created.',
  },
  operation: {
    type: 'hook',
    performSubscribe: async (z, bundle) => {
      const response = await z.request({
        url: 'https://api.buttondown.com/v1/webhooks',
        method: 'POST',
        body: {
          status: 'enabled',
          event_types: ['subscriber.created'],
          url: bundle.targetUrl,
          description: `Zapier hook ${bundle.meta.zap.id || 'unknown'}`,
        },
      });
      return response.data; // { id: "...", ... } — id needed for unsubscribe
    },
    performUnsubscribe: async (z, bundle) => {
      const response = await z.request({
        url: `https://api.buttondown.com/v1/webhooks/${bundle.subscribeData.id}`,
        method: 'DELETE',
      });
      return response.data;
    },
    perform: async (z, bundle) => {
      // Webhook payload contains event_type + data with entity ID
      const payload = bundle.cleanedRequest;

      // If payload only has an ID, hydrate from API:
      if (payload.data && payload.data.subscriber && typeof payload.data.subscriber === 'string') {
        const response = await z.request({
          url: `https://api.buttondown.com/v1/subscribers/${payload.data.subscriber}`,
        });
        return [response.data];
      }

      // If payload already contains the full object:
      return [payload.data];
    },
    performList: async (z, bundle) => {
      // Fallback polling for Zap editor testing
      const response = await z.request({
        url: 'https://api.buttondown.com/v1/subscribers',
        params: { ordering: '-creation_date', page_size: 5 },
      });
      return response.data.results;
    },
    sample: {
      id: 'ac79483b-cd28-49c1-982e-8a88e846d7e7',
      email: 'subscriber@example.com',
      creation_date: '2026-01-01T00:00:00Z',
      tags: [],
      metadata: {},
    },
    outputFields: [
      { key: 'id', label: 'Subscriber ID', type: 'string' },
      { key: 'email', label: 'Email', type: 'string' },
      { key: 'creation_date', label: 'Created At', type: 'datetime' },
    ],
  },
};
```


## 5. Limitations and Gotchas

### Retries
Buttondown retries webhook delivery **up to 3 times** on failure. The docs don't specify the retry interval or backoff strategy. This is fairly minimal — if Zapier's endpoint has a transient failure, there's limited retry coverage.

### HMAC Signature Verification
Buttondown supports optional HMAC-SHA256 signing via a `signing_key` field on the webhook. When set, requests include an `X-Buttondown-Signature: sha256=<hex>` header computed over the raw request body. For a Zapier integration, you'd need to verify this in a middleware or in the `perform` function if you choose to set a signing key during subscribe. This is **optional** — the integration can work without it, but it's a nice security hardening if the integration goes public.

### Payload is Lightweight
The documented payload contains entity IDs, not full objects. The `perform` function will likely need to call back to the Buttondown API to fetch the complete subscriber/email record. This adds one API call per webhook invocation — factor this into rate limit considerations.

### No Expiration Mentioned
The docs don't mention webhook expiration. In the Zapier Platform CLI, if webhooks expire you'd return an `expiration_date` from `performSubscribe` so Zapier can auto-resubscribe. This doesn't appear to be needed here.

### Auth is Token-Based
All API calls use `Authorization: Token <API_KEY>`. Straightforward for Zapier — a simple API Key auth type, mapped to the `Authorization` header with `Token ` prefix.

### No Documented Rate Limits on Webhook API
The Buttondown docs don't explicitly mention rate limits on the webhook management endpoints. Exercise standard caution — don't create/delete webhooks in tight loops.

### Webhook Test Endpoint
`POST /v1/webhooks/{id}/test` exists for sending a test payload. Useful during development but not needed in the Zapier integration itself (Zapier uses `performList` for test data).

### Webhook Attempts Endpoint
`GET /v1/webhooks/{id}/attempts` lists delivery attempts. Useful for debugging but not part of the Zapier integration.


## 6. Verdict

**Buttondown's webhook system is fully compatible with Zapier REST Hook triggers.** The API provides all four operations needed:

1. **Subscribe** — `POST /v1/webhooks` (create webhook with `bundle.targetUrl` and desired `event_types`)
2. **Unsubscribe** — `DELETE /v1/webhooks/{id}` (clean up when Zap is turned off)
3. **Receive** — Buttondown POSTs to the target URL with `{ event_type, data }` payload
4. **Fallback poll** — Existing list endpoints (`GET /v1/subscribers`, `GET /v1/emails`, etc.) serve as `performList`

The main implementation consideration is **payload hydration** — testing whether the webhook payload contains just IDs or full objects will determine whether `perform` needs an extra API call. The webhook test endpoint (`POST /v1/webhooks/{id}/test`) can be used during development to inspect the actual payload shape.

**Recommended next steps:**
1. Test the actual webhook payload shape by registering a test webhook and inspecting what arrives
2. Scaffold REST Hook triggers for the highest-value events (subscriber.created, email.sent, subscriber.unsubscribed)
3. Implement HMAC verification if the integration will be shared publicly
4. Add `performList` fallback using the corresponding list endpoints for each trigger
