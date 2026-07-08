/* ============================================================================
 *  progress.js  —  your BUILD LOG entries.
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
 *       Fill in `en` (or whichever you prefer) and leave the rest — the site
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
        "Rebuilt this site from scratch: three languages, dark/light theme, and this build log, so I can show the work instead of just describing it.",
        "The next few months are set. Learn Isaac Sim, get comfortable in C++, and build the simulation environment the thesis needs. Hardware waits until that's done.",
      ],
    },
    ja: {
      title: "サイトを刷新、これからの土台づくり",
      body: [
        "このサイトをゼロから作り直しました。3言語対応、ダーク/ライト、そしてこのビルドログ。説明するより、作っている様子をそのまま見せたいと思います。",
        "これからの数か月ですることは決まっています。Isaac Simを覚える、C++に慣れる、卒論に必要なシミュレーション環境を作る。実機はその後です。",
      ],
    },
    ms: {
      title: "Laman baharu, dan menyediakan asas",
      body: [
        "Saya bina semula laman ini dari awal: tiga bahasa, mod gelap/cerah, dan log pembinaan ini, supaya saya boleh tunjuk kerja dan bukan sekadar cerita.",
        "Beberapa bulan akan datang sudah tetap. Belajar Isaac Sim, biasakan diri dengan C++, dan bina persekitaran simulasi yang tesis saya perlukan. Perkakasan tunggu selepas itu.",
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
        "Blocked out the first version of the thesis environment: walls, obstacles, and a few occluders so the sensors have something to struggle with. Still rough, but the robot can drive around and the sensors mount cleanly.",
        "Next step is dropping in human agents and logging TIR + LiDAR sequences.",
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
        "Started taking C++ seriously this week. After two years of mostly Python, pointers and memory ownership take some getting used to. It's the right tool for real-time perception though, so I'm sticking with it.",
      ],
    },
  },

];
