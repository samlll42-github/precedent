# Precedent waitlist

Static landing page for **Precedent**, an early-access waitlist for licensed estate-planning lawyers. Test only. The product is not shipping software.

Live: https://samlll42-github.github.io/precedent/

## Receive waitlist emails

GitHub Pages is static. Submissions are validated in the browser, stored in `localStorage`, and opened as a `mailto:` draft.

To have Formsubmit email you:

1. Open `waitlist.js`.
2. Set your address before the script runs, either:
   - `window.PRECEDENT_FORMSUBMIT_EMAIL = "you@your-domain.com";` in a small snippet above `waitlist.js`, or
   - the `FORMSUBMIT_EMAIL` constant inside `waitlist.js`.
3. Confirm the address with Formsubmit the first time a submission is sent (`https://formsubmit.co`).

Do not commit secrets. Do not put a GitHub token in the frontend.

Samuel: replace `FORMSUBMIT_EMAIL` in `waitlist.js` with `formsubmit.co/YOUR_EMAIL` once you have a real inbox you want to use.

## Local admin

Open the page with `?admin=1` to list waitlist rows stored in this browser.

## Deploy

GitHub Pages, `main` branch, site root `/`.
