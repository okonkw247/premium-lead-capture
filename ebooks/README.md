# /ebooks

This directory previously hosted the static ebook files. Local assets have been removed to use the main external ebook.

## Main Ebook URL
- **Main Ebook**: [WPS Docworkspace](https://eu.docworkspace.com/d/sbRaddRMS482BEiK_mr4pqf8xmv0lubk92v)

## Redirects
Both local (Express server in `server.js`) and production (Vercel routes in `vercel.json`) route the legacy PDF paths to the main ebook URL:
- `/ebooks/monk-mode-starter-kit.pdf` → `https://eu.docworkspace.com/d/sbRaddRMS482BEiK_mr4pqf8xmv0lubk92v`
- `/monk-mode-starter-kit.pdf` → `https://eu.docworkspace.com/d/sbRaddRMS482BEiK_mr4pqf8xmv0lubk92v`
