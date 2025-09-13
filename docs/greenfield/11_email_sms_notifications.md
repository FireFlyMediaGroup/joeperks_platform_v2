# 11 — Notifications: SendGrid (Email) + Twilio (SMS)

## SendGrid
Env (per backend and/or specific apps):
```bash
SENDGRID_API_KEY=
EMAIL_FROM=noreply@joeperks.com
```
Implementation:
- Create a notification service in Medusa that sends order confirmations, status updates.
- Templating: store templates in repo or SendGrid dynamic templates.

## Twilio
Env:
```bash
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_MESSAGING_SERVICE_SID=
```
Implementation:
- SMS for critical updates (shipping, delivery, passwordless codes if needed).

## Opt-in and compliance
- Store user consent preferences and honor unsubscribes.

## Tests
- Mock providers in unit tests; avoid sending real messages in CI.

