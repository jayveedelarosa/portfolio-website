# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio website for Jayvee C. Dela Rosa — a static, zero-dependency SPA (single-page application) built with vanilla HTML/CSS/JS. No framework, no build tools, no package manager. Files are served directly.

**Hosting stack:** Porkbun DNS → AWS CloudFront (CDN, HTTPS via ACM certificate) → AWS S3 (static assets). Contact form integrates with AWS API Gateway (ap-southeast-1) → Lambda (Python) → SES → Gmail inbox.

## Development

No build step required. Open `index.html` directly in a browser, or serve locally with any static file server:

```powershell
# Quick local server options
npx serve .
python -m http.server 8080
```

There are no tests, no linter config, and no CI pipeline files in this repo.

## Architecture

Three source files make up the entire site:

| File | Lines | Role |
|---|---|---|
| `index.html` | ~683 | Markup for all 6 sections; data attributes drive JS behavior |
| `script.js` | ~700 | All client-side logic, organized in 10 sequential blocks |
| `styles.css` | ~1970 | Theming, layout, all component styles |

### Navigation model
Hash-based SPA with sections: `#about`, `#projects`, `#certificates`, `#education`, `#contact`, `#architecture`. The active section is set by toggling `.active` on section elements; the sidebar and mobile nav highlight the current item via `data-section` attributes.

### JavaScript structure (`script.js`)
Code is divided into clearly commented blocks in this order:
1. State & DOM references
2. Section navigation
3. Theme toggle (persisted in `localStorage`)
4. Certificate lightbox
5. External link delegation (`data-url` attributes open `window.open`)
6. Contact form — validation, rate limiting (30 s cooldown, 3 submissions/session), POST to API Gateway
7. Notification dropdown
8. Username system (persisted in `localStorage`, 1–9 chars)
9. Global event listeners (click-outside, keyboard shortcuts)
10. Initialization

### CSS conventions
- All colors and spacing use CSS custom properties defined on `:root` (dark mode default) and `[data-theme="light"]`
- Primary accent: orange (`--accent-primary`)
- Background: deep navy (`--bg-primary: #0f1117`)
- Component classes follow a panel/card/button naming pattern; no utility-first approach

### Data attribute patterns
- `data-section="<id>"` — nav items and buttons that switch sections
- `data-url="<href>"` — any element that should open an external link (handled by delegated click listener)
- `data-cert="<img-src>"` — certificate thumbnails that open the lightbox

## Contact API

```
POST https://wvj6qecu19.execute-api.ap-southeast-1.amazonaws.com/contact
Content-Type: application/json
Body: { "name": string, "email": string, "message": string }
```

**Request flow:**
1. Browser validates fields, then JS POSTs to API Gateway
2. API Gateway checks rate limit
3. Lambda (Python) re-validates the payload
4. SES delivers a plain-text email to the owner's Gmail
5. Browser shows a green success message on completion

The endpoint URL is hardcoded in `script.js`. Client-side rate limiting (30 s cooldown, 3 submissions/session) is enforced before the request even leaves the browser.
