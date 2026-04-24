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
- `STRIPE_POINTS_WEBHOOK_SECRET`
- `STRIPE_POINTS_PRICE_100`
- `STRIPE_POINTS_PRICE_300`
- `STRIPE_POINTS_PRICE_1000`

## Required D1 Binding

- Binding name: `POINTS_DB`
- D1 database name: `aipictors-points`
- D1 database id: `04dfe201-ad19-493e-9a93-bdbac483cebb`

Use `docs/d1-points-schema.sql` for manual schema creation if needed.
