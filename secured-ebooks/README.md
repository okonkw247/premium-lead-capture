# Secured Ebooks

This folder is a placeholder for your paid ebook files.

Because you have chosen to host and distribute the paid ebook via **Whop**, you do not need to place any PDF files here. Instead, you only need to configure the `PAID_EBOOK_URL` in `server.js` (or set a `PAID_EBOOK_URL` environment variable in Vercel) to point to your Whop product link.

## Alternative: Self-Hosting
If you ever decide to self-host the PDF file instead of using Whop, follow these steps:
1. Place the PDF file here (e.g. `/secured-ebooks/comeback-unrecognizable.pdf`).
2. Do **NOT** add this folder to the static build files in `vercel.json`. This keeps the file completely private.
3. Update `server.js` to add an authenticated `GET /api/download/comeback-unrecognizable` route that reads from this folder and serves the file using `res.sendFile()`.
