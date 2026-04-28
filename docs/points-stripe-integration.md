# Points + Stripe Integration

## API Endpoints

- Checkout API: `/api/stripe/points-checkout` (POST)
- Stripe Webhook API: `/api/stripe/points-webhook` (POST)
- Points Summary API: `/api/points/summary` (GET)
- Points Transaction API: `/api/points/transaction` (POST)

## Stripe Webhook Endpoint URL

Set the following URL in Stripe Dashboard Webhook settings:

`https://www.aipictors.com/api/stripe/points-webhook`

For preview/dev, replace the domain with your deployed domain.

### Stripe webhook events to subscribe

- `checkout.session.completed`
- `charge.refunded`

## Required Cloudflare Variables

- `STRIPE_SECRET_KEY`

## Required Internal API Variables

- `AIPICTORS_API_BASE_URL`
- `AIPICTORS_API_INTERNAL_TOKEN`
- `AIPICTORS_API_CF_ACCESS_CLIENT_ID` (optional)
- `AIPICTORS_API_CF_ACCESS_CLIENT_SECRET` (optional)

Points balance, ledger, and Stripe webhook processing are handled by `aipictors-api` on Neon.
The `/api/stripe/points-webhook` route now forwards the raw Stripe payload to `aipictors-api` for signature verification and persistence.
