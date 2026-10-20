/* ============================================================================
 *  progress.js: your BUILD LOG entries.
 * ----------------------------------------------------------------------------
 *  HOW TO ADD A NEW ENTRY
 *  1. Copy one whole { ... } block below (from the "{" to the "}," ).
 *  2. Paste it at the TOP of the list (newest entries go first).
 *  3. Change the date, tags, images and text.
 *
 *  EACH ENTRY:
 *    date   : "YYYY-MM-DD"            ← shown and sorted by this
 *    tags   : ["Isaac Sim", "C++"]   ← used by the filter buttons
 *    images : ["/assets/img/foo.jpg"]← optional; drop files in assets/img/
 *             (leave as []  if no pictures yet)
 *    en/ja/ms : { title, body }      ← body can be one or many paragraphs.
 *             Write paragraphs as an array: body: ["para 1", "para 2"]
 *             If you only write one language, the others fall back to it.
 *
 *  TIP: you don't have to translate every entry into all 3 languages.
 *       Fill in `en` (or whichever you prefer) and leave the rest: the site
 *       will use whatever is available.
 * ==========================================================================*/

window.PROGRESS_ENTRIES = [

  {
    date: "2026-06-04",
    tags: ["Meta", "Isaac Sim"],
    images: [],
    en: {
      title: "New site, and setting the stage",
      body: [
        "Rebuilt this site: three languages, a dark and light theme, and this build log.",
        "The next few months: learn Isaac Sim, get comfortable in C++, and build the simulation environment the thesis needs. Hardware after that.",
      ],
    },
    ja: {
      title: "サイトを刷新、これからの土台づくり",
      body: [
        "このサイトを作り直しました。3言語、ダークとライト、このビルドログです。",
        "この数か月は、Isaac Simを覚えること、C++に慣れること、卒論のシミュレーション環境を作ることです。実機はそのあとです。",
      ],
    },
    ms: {
      title: "Laman baharu, dan menyediakan asas",
      body: [
        "Saya bina semula laman ini: tiga bahasa, mod gelap dan cerah, dan log pembinaan ini.",
        "Beberapa bulan ini: belajar Isaac Sim, biasakan C++, dan bina persekitaran simulasi untuk tesis. Perkakasan selepas itu.",
      ],
    },
  },

  {
    date: "2026-05-20",
    tags: ["Isaac Sim", "Simulation"],
    images: [],
    en: {
      title: "First 20×20 m world in Isaac Sim",
      body: [
        "First version of the thesis environment: walls and obstacles. Still rough. The robot can drive around, and the sensors mount cleanly.",
      ],
    },
  },

  {
    date: "2026-04-27",
    tags: ["C++", "Learning"],
    images: [],
    en: {
      title: "From Python to C++",
      body: [
        "Started taking C++ seriously this week. After two years of mostly Python, pointers and memory ownership are new. I need C++ for real-time perception.",
      ],
    },
  },

];
