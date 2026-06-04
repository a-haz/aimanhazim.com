# aimanhazim.com

Personal portfolio for **Aiman Hazim** — a robotics engineering student focused on
autonomous systems, SLAM, and machine perception.

🔗 Live site: <https://aimanhazim.com>

## Stack

Hand-written, dependency-free **HTML + CSS**. No build step, no frameworks, no JavaScript.

## Structure

| File | Purpose |
| --- | --- |
| `index.html` | Single-page site (hero, projects, contact) |
| `style.css` | Theming, layout, responsive + accessibility rules |
| `favicon.svg` | Inline "AH" monogram favicon |
| `404.html` | Themed not-found page |
| `robots.txt` / `sitemap.xml` | SEO / crawler hints |
| `CNAME` | Custom domain mapping for GitHub Pages |

## Local preview

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deployment

Served via **GitHub Pages**. Pushes to `main` publish automatically to <https://aimanhazim.com>.
