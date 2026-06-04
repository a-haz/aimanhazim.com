# aimanhazim.com

Personal portfolio for **Aiman Hazim** — robotics engineering student at Fukui
University, building TIR-LiDAR active SLAM in simulation toward real-hardware sim2real.

🔗 Live: <https://aimanhazim.com>

Trilingual (English / 日本語 / Melayu), dark + light mode, and a **Build Log** for
day-to-day progress. Plain HTML/CSS/JS — no build step, no frameworks.

---

## ✍️ Editing the site (the important part)

You almost never touch the HTML. **All the words live in two files:**

| I want to… | Edit this file |
| --- | --- |
| Change any text on the main page (in any language) | `assets/js/content.js` |
| Add / edit a Build Log entry | `assets/js/progress.js` |
| Add a photo to a log entry | drop it in `assets/img/`, then link it in `progress.js` |

### Change wording

Open `assets/js/content.js`. It's organised as three blocks — `en`, `ja`, `ms`.
Find the line, change the text **inside the quotes**, save. That's it.

```js
hero: {
  name: "Aiman Hazim",
  intro: "Fourth-year robotics student …",   // ← edit this text
}
```

> ⚠️ Keep the commas, quotes and brackets exactly as they are — only change the
> text inside the `"quotes"`. If the page ever goes blank, you probably removed a
> comma by accident; undo and it's back.

### Add a Build Log entry

Open `assets/js/progress.js`, copy one `{ … }` block, paste it at the **top** of
the list (newest first), and edit the date / tags / text. You only have to fill in
one language — the others fall back to it automatically.

```js
{
  date: "2026-06-10",
  tags: ["Isaac Sim", "C++"],
  images: ["/assets/img/my-screenshot.jpg"],   // or []  for none
  en: { title: "…", body: ["paragraph one", "paragraph two"] },
}
```

### Other tweaks

- **Default language / behaviour:** the site remembers each visitor's last choice.
  To change the fallback, edit `DEFAULT_LANG` near the top of `assets/js/app.js`.
- **Colours:** change the `--accent` values at the top of `assets/css/style.css` to
  re-skin the whole site (both dark and light).
- **"now_learning" bars & roadmap:** edit the `learning` and `now` sections in
  `content.js`.

---

## 🗂 Structure

| File / folder | Purpose |
| --- | --- |
| `index.html` | Main page structure (you rarely edit this) |
| `progress.html` | Build Log page structure |
| `assets/js/content.js` | **★ all site text, 3 languages** |
| `assets/js/progress.js` | **★ Build Log entries** |
| `assets/js/app.js` | Engine: theme, language, rendering, animations |
| `assets/css/style.css` | All styling + theme tokens |
| `assets/img/` | Photos/screenshots for the log |
| `favicon.svg` · `404.html` · `robots.txt` · `sitemap.xml` · `CNAME` | Icon, error page, SEO, domain |

---

## 🔍 Local preview

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

(Use the server rather than opening the file directly — the pages load their content
through `/assets/...` paths.)

## 🚀 Deployment

Served by **GitHub Pages**. Every push to `main` publishes automatically to
<https://aimanhazim.com>.
