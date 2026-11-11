# WaterWiseKids domain-email cutover plan

## Current production evidence

Checked on 2026-11-11:

- `waterwisekids.com` publishes Mailgun MX records (`mxa.mailgun.org` and
  `mxb.mailgun.org`, priority 60).
- the root SPF record authorizes Mailgun (`include:mailgun.org`).
- Cloudflare Email Routing is not onboarded.
- the public site still directs readers to `waterwisekids.com@gmail.com`.

## Safety boundary

Do **not** enable Cloudflare Email Routing while the Mailgun MX records are in
service. Cloudflare's onboarding would require replacing mail DNS and could break
an existing Mailgun sending or receiving workflow. The trust improvement is a
domain-branded address, not a particular mail provider.

## Preferred completion path

Use the existing Mailgun domain:

1. Sign in to the Mailgun account that owns `waterwisekids.com` and verify the
   domain is active.
2. Inspect existing inbound routes before changing anything.
3. Add or confirm an exact route for `hello@waterwisekids.com` to the existing
   monitored WWK mailbox. Do not create a catch-all.
4. Send a test from an unrelated external mailbox, verify receipt, and reply from
   the domain address. Check SPF/DKIM/DMARC alignment on the received message.
5. Only after both directions pass, replace the public Gmail address in the
   contact page, privacy page, About page, footer sources, and generated content.
6. Keep the Gmail address as the verified destination, not as the public contact.

If the current Mailgun account cannot receive mail, choose a deliberate provider
migration and inventory all Mailgun-dependent services first. Do not change MX
records as a side effect of a website release.

## Evidence required for publication

Record the route identifier (redacted if necessary), test timestamp, sender,
recipient, received-message authentication results, and the person who verified
the inbox. A repository change must never claim the domain address works solely
because the DNS record exists.
