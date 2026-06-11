/* ============================================================================
 *  writing.js  —  your PERSONAL WRITING (essays, notes, thoughts).
 * ----------------------------------------------------------------------------
 *  Works exactly like progress.js:
 *  1. Copy one whole { ... } block (from "{" to "},").
 *  2. Paste it at the TOP of the list (newest first).
 *  3. Change the date and text.
 *
 *  EACH ENTRY:
 *    date     : "YYYY-MM-DD"
 *    en/ja/ms : { title, body }   ← body is one or many paragraphs:
 *               body: ["para 1", "para 2"]
 *               Fill in whichever language you wrote in — the others fall
 *               back to it automatically.
 * ==========================================================================*/

window.WRITING_ENTRIES = [

  {
    date: "2026-06-10",
    en: {
      title: "A place to write",
      body: [
        "This page is for the writing that doesn't fit in a build log — thoughts about coming to Japan, learning in a third language, and whatever else feels worth putting down. More soon.",
      ],
    },
    ja: {
      title: "書く場所",
      body: [
        "ここはビルドログに収まらない文章のための場所です。日本に来たこと、第三の言語で学ぶこと、その他書き残したいことを。少しずつ。",
      ],
    },
    ms: {
      title: "Tempat untuk menulis",
      body: [
        "Halaman ini untuk tulisan yang tidak muat dalam log pembinaan — tentang datang ke Jepun, belajar dalam bahasa ketiga, dan apa sahaja yang berbaloi dicatat. Lebih lagi nanti.",
      ],
    },
  },

];
