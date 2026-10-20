# aimanhazim.com

My personal website, live at <https://aimanhazim.com>.

It is a static site served by GitHub Pages from `main`. The pages are
`index.html`, `progress.html` (build log) and `writing.html`. Most of the text
lives in JavaScript files:

| File | Contents |
| --- | --- |
| `assets/js/content.js` | Main page text in English, Japanese and Malay |
| `assets/js/progress.js` | Build log entries, newest first |
| `assets/js/writing.js` | Writing posts |
| `assets/js/app.js` | Theme, language and rendering |
| `assets/css/style.css` | Styles and theme colours |

Images for the build log go in `assets/img/`. Project write-ups are under
`projects/`, and `compare/` holds theme experiments that are not linked from
the main nav.

## Local preview

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>. Opening the files directly does not work,
because the pages load content from `/assets/...` paths.
