/* ============================================================================
 *  writing.js: your PERSONAL WRITING (essays, notes, thoughts).
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
 *               Fill in whichever language you wrote in: the others fall
 *               back to it automatically.
 * ==========================================================================*/

window.WRITING_ENTRIES = [

  {
    date: "2026-06-10",
    en: {
      title: "A place to write",
      body: [
        "Notes that do not fit in the build log. Coming to Japan, learning in a third language, and other things I want to write down.",
      ],
    },
    ja: {
      title: "書く場所",
      body: [
        "ビルドログに入らない文章です。日本に来たこと、三つ目の言語で学ぶこと、そのほか書いておきたいこと。",
      ],
    },
    ms: {
      title: "Tempat untuk menulis",
      body: [
        "Tulisan yang tak muat dalam log pembinaan. Datang ke Jepun, belajar dalam bahasa ketiga, dan nota lain.",
      ],
    },
  },

];
