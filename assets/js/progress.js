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
        "Relaunched this site from scratch — trilingual, dark/light, and with this very build log so I can show the work instead of just describing it.",
        "The plan for the coming months is simple to say and hard to do: master NVIDIA Isaac Sim, get genuinely good at C++, and build the simulation environment my thesis needs. Hardware comes later; for now every hour goes into simulation.",
      ],
    },
    ja: {
      title: "サイトを刷新、これからの土台づくり",
      body: [
        "このサイトをゼロから作り直しました。3言語対応・ダーク/ライト、そしてこのビルドログ。説明するより、作っている様子を見せたいと思います。",
        "これからの数か月の方針はシンプルです — Isaac Simを習得し、C++を本気で身につけ、卒論に必要なシミュレーション環境を作る。実機は後。いまはすべてをシミュレーションに注ぎます。",
      ],
    },
    ms: {
      title: "Laman baharu, dan menyediakan asas",
      body: [
        "Saya bina semula laman ini dari awal — tiga bahasa, mod gelap/cerah, dan log pembinaan ini supaya saya boleh tunjuk kerja, bukan sekadar cerita.",
        "Pelan beberapa bulan akan datang mudah disebut, sukar dibuat: kuasai Isaac Sim, jadi benar-benar mahir C++, dan bina persekitaran simulasi yang tesis saya perlukan. Perkakasan kemudian; buat masa ini setiap jam untuk simulasi.",
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
        "Blocked out the first version of the indoor environment for the thesis — walls, obstacles, and a few occluders to make perception interesting. Still rough, but the robot can drive around and the sensors mount cleanly.",
        "Next: drop in human agents and start logging TIR + LiDAR sequences.",
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
        "Started taking C++ seriously this week. After two years mostly in Python, pointers and memory ownership are a different way of thinking — but it's the right tool for real-time perception, so I'm putting in the reps.",
      ],
    },
  },

];
