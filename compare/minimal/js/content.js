/* ============================================================================
 *  content.js  —  EVERY WORD on this site lives here.
 * ----------------------------------------------------------------------------
 *  HOW TO EDIT
 *  • To change text: find the line, edit what's inside the "quotes". Done.
 *  • Three languages: en (English), ja (日本語), ms (Melayu). Keep them in sync,
 *    but it's fine if a few are rough — a missing key falls back to English.
 *  • Keep the structure (the keys / commas / brackets) the same. If the site
 *    goes blank, you probably deleted a comma or a quote — undo and try again.
 *  • LOG entries live in progress.js; WRITING entries live in writing.js.
 * ==========================================================================*/

window.SITE_CONTENT = {

  /* =====================================================================
   *  ENGLISH
   * ===================================================================*/
  en: {
    langName: "EN",
    dir: "ltr",

    hero: {
      name: "Aiman Hazim",
      tagline: "Robotics student. Building autonomous navigation.",
    },

    // The Professional | Personal toggle.
    mode: {
      pro: "Professional",
      personal: "Personal",
    },

    /* ---------------- professional side ---------------- */
    intro:
      "Fourth-year robotics student in Fukui University's Intelligent Robot Lab. I build autonomous navigation that fuses thermal vision with 3D LiDAR — in simulation now, real hardware next.",

    research: {
      heading: "Research",
      summary:
        "My thesis is TIR-LiDAR active SLAM: a robot that chooses where to look. I'm building a crowded indoor world in Isaac Sim and developing navigation that holds up in the dark, in crowds, and behind occlusions — then proving it against existing methods and carrying it sim2real onto a Mega Rover.",
    },

    now: {
      heading: "Now",
      body:
        "Mastering Isaac Sim and C++. Thesis experiments late 2026. Real hardware — and graduation — in 2027. Open to autonomous-driving and mobile-robotics roles from 2027.",
    },

    projects: {
      heading: "Projects",
      items: [
        { title: "PyroScout",
          desc: "From-scratch 2D search-and-rescue simulator — LiDAR mapping, thermal victim search, A* navigation. 8/8 runs, zero collisions.",
          links: [{ href: "/projects/pyroscout/", label: "Write-up" },
                  { href: "https://github.com/a-haz/pyroscout", label: "GitHub" }] },
        { title: "Thermal × 3D LiDAR human following",
          desc: "Tracking that survives when plain vision fails. The seed of my thesis.",
          links: [{ href: "https://github.com/a-haz", label: "GitHub" }] },
        { title: "Transformer trackers (ViT / SPT)",
          desc: "Implemented from scratch to actually understand them.",
          links: [{ href: "https://github.com/a-haz", label: "GitHub" }] },
        { title: "Embedded C",
          desc: "Registers, 7-segment displays, control logic for a larger robot state machine.",
          links: [] },
        { title: "Robot Engineering Creative Experiment",
          desc: "Eiwa System Management Prize, 2023.",
          links: [] },
      ],
    },

    contact: {
      heading: "Contact",
      lead: "SLAM, simulation, roles from 2027 — or just robots.",
      links: [
        { label: "Email",     value: "contact@aimanhazim.com", href: "mailto:contact@aimanhazim.com" },
        { label: "GitHub",    value: "a-haz", href: "https://github.com/a-haz" },
        { label: "LinkedIn",  value: "a-haz", href: "https://www.linkedin.com/in/a-haz" },
        { label: "X",         value: "@manjym_", href: "https://x.com/manjym_" },
        { label: "Instagram", value: "@manjym_", href: "https://instagram.com/manjym_" },
      ],
    },

    /* ---------------- personal side ---------------- */
    personal: {
      intro:
        "I came to Japan and built my studies and my life here from zero — that shaped me more than anything else. This side of the site is for everything that isn't work.",
      writingHeading: "Writing",
      writingBlurb: "Occasional personal essays.",
      allWriting: "All writing →",
      logHeading: "Build Log",
      logBlurb: "Week-to-week notes from the thesis.",
      fullLog: "Full log →",
      nothingYet: "Nothing yet.",
    },

    /* ---------------- sub-pages ---------------- */
    writingPage: {
      title: "Writing",
      lead: "Personal essays, occasionally.",
      empty: "Nothing here yet.",
      home: "← Home",
    },

    progressPage: {
      title: "Build Log",
      lead: "Week-to-week progress on the thesis and the sim→real journey. Newest first.",
      filterAll: "All",
      empty: "No entries yet.",
      home: "← Home",
    },

    ui: {
      themeToLight: "Switch to light mode",
      themeToDark: "Switch to dark mode",
      langLabel: "Language",
      modeLabel: "Side",
    },
  },

  /* =====================================================================
   *  日本語  (JAPANESE)
   * ===================================================================*/
  ja: {
    langName: "JA",
    dir: "ltr",

    hero: {
      name: "アイマン・ハジム",
      tagline: "ロボティクス専攻。自律ナビゲーションをつくる。",
    },

    mode: {
      pro: "仕事",
      personal: "個人",
    },

    intro:
      "福井大学 知能ロボット研究室の学部4年。熱画像と3D LiDARを融合した自律ナビゲーションを開発中 — いまはシミュレーション、次は実機。",

    research: {
      heading: "研究",
      summary:
        "卒論テーマはTIR-LiDARアクティブSLAM — ロボット自身が観測地点を選ぶ。Isaac Sim上に人の行き交う屋内環境を構築し、暗所・混雑・遮蔽でも破綻しないナビゲーションを開発。既存手法と比較検証し、sim2realでメガローバーへ。",
    },

    now: {
      heading: "いま",
      body:
        "Isaac SimとC++を習得中。2026年後半に卒論実験。2027年に実機、そして卒業。2027年からの自動運転・移動ロボット分野での就業を希望。",
    },

    projects: {
      heading: "プロジェクト",
      items: [
        { title: "PyroScout",
          desc: "ゼロから作った2D探索救助シミュレータ — LiDAR地図生成・熱センサ探索・A*走行。8/8成功、衝突ゼロ。",
          links: [{ href: "/projects/pyroscout/", label: "解説" },
                  { href: "https://github.com/a-haz/pyroscout", label: "GitHub" }] },
        { title: "熱画像 × 3D LiDAR 人追従",
          desc: "通常の視覚が破綻しても追跡を続ける。卒論の出発点。",
          links: [{ href: "https://github.com/a-haz", label: "GitHub" }] },
        { title: "Transformerトラッカー（ViT / SPT）",
          desc: "理解のためネットワークを自分で実装。",
          links: [{ href: "https://github.com/a-haz", label: "GitHub" }] },
        { title: "組込みC",
          desc: "レジスタ・7セグ表示・制御ロジック。",
          links: [] },
        { title: "ロボット工学創造実験",
          desc: "永和システムマネジメント賞・2023年。",
          links: [] },
      ],
    },

    contact: {
      heading: "連絡",
      lead: "SLAM、シミュレーション、2027年からの就業 — あるいはロボットの話。",
      links: [
        { label: "メール",    value: "contact@aimanhazim.com", href: "mailto:contact@aimanhazim.com" },
        { label: "GitHub",    value: "a-haz", href: "https://github.com/a-haz" },
        { label: "LinkedIn",  value: "a-haz", href: "https://www.linkedin.com/in/a-haz" },
        { label: "X",         value: "@manjym_", href: "https://x.com/manjym_" },
        { label: "Instagram", value: "@manjym_", href: "https://instagram.com/manjym_" },
      ],
    },

    personal: {
      intro:
        "来日して、学業も生活もゼロから築いてきました — それが何よりも自分を形づくった経験です。ここは仕事以外のすべての場所。",
      writingHeading: "書きもの",
      writingBlurb: "ときどき、個人的なエッセイ。",
      allWriting: "すべて読む →",
      logHeading: "ビルドログ",
      logBlurb: "卒論の週ごとの記録。",
      fullLog: "全部見る →",
      nothingYet: "まだありません。",
    },

    writingPage: {
      title: "書きもの",
      lead: "個人的なエッセイを、ときどき。",
      empty: "まだありません。",
      home: "← ホーム",
    },

    progressPage: {
      title: "ビルドログ",
      lead: "卒論とsim→realの歩みの記録。新しい順。",
      filterAll: "すべて",
      empty: "まだ記録はありません。",
      home: "← ホーム",
    },

    ui: {
      themeToLight: "ライトモードへ",
      themeToDark: "ダークモードへ",
      langLabel: "言語",
      modeLabel: "表示",
    },
  },

  /* =====================================================================
   *  MELAYU  (MALAY)
   * ===================================================================*/
  ms: {
    langName: "MS",
    dir: "ltr",

    hero: {
      name: "Aiman Hazim",
      tagline: "Pelajar robotik. Membina navigasi autonomi.",
    },

    mode: {
      pro: "Profesional",
      personal: "Peribadi",
    },

    intro:
      "Pelajar robotik tahun empat di Makmal Robot Pintar, Universiti Fukui. Saya membina navigasi autonomi yang menggabungkan penglihatan terma dengan LiDAR 3D — dalam simulasi sekarang, perkakasan sebenar seterusnya.",

    research: {
      heading: "Penyelidikan",
      summary:
        "Tesis saya: SLAM aktif TIR-LiDAR — robot yang memilih ke mana hendak melihat. Saya membina dunia dalaman yang sesak dalam Isaac Sim dan membangunkan navigasi yang teguh dalam gelap, dalam orang ramai, dan di sebalik halangan — kemudian membuktikannya melawan kaedah sedia ada dan membawanya sim2real ke Mega Rover.",
    },

    now: {
      heading: "Sekarang",
      body:
        "Menguasai Isaac Sim dan C++. Eksperimen tesis hujung 2026. Perkakasan sebenar — dan graduasi — pada 2027. Terbuka untuk peranan pandu autonomi / robot mudah alih mulai 2027.",
    },

    projects: {
      heading: "Projek",
      items: [
        { title: "PyroScout",
          desc: "Simulator mencari & menyelamat 2D dari awal — pemetaan LiDAR, carian terma, navigasi A*. 8/8 larian, sifar perlanggaran.",
          links: [{ href: "/projects/pyroscout/", label: "Tulisan" },
                  { href: "https://github.com/a-haz/pyroscout", label: "GitHub" }] },
        { title: "Pengikutan manusia Terma × LiDAR 3D",
          desc: "Penjejakan yang bertahan apabila penglihatan biasa gagal. Benih tesis saya.",
          links: [{ href: "https://github.com/a-haz", label: "GitHub" }] },
        { title: "Penjejak Transformer (ViT / SPT)",
          desc: "Dilaksanakan dari awal untuk benar-benar memahaminya.",
          links: [{ href: "https://github.com/a-haz", label: "GitHub" }] },
        { title: "C terbenam",
          desc: "Daftar, paparan 7-segmen, logik kawalan.",
          links: [] },
        { title: "Eksperimen Kreatif Kejuruteraan Robot",
          desc: "Hadiah Eiwa System Management, 2023.",
          links: [] },
      ],
    },

    contact: {
      heading: "Hubungi",
      lead: "SLAM, simulasi, peranan mulai 2027 — atau sekadar berbual tentang robot.",
      links: [
        { label: "E-mel",     value: "contact@aimanhazim.com", href: "mailto:contact@aimanhazim.com" },
        { label: "GitHub",    value: "a-haz", href: "https://github.com/a-haz" },
        { label: "LinkedIn",  value: "a-haz", href: "https://www.linkedin.com/in/a-haz" },
        { label: "X",         value: "@manjym_", href: "https://x.com/manjym_" },
        { label: "Instagram", value: "@manjym_", href: "https://instagram.com/manjym_" },
      ],
    },

    personal: {
      intro:
        "Saya datang ke Jepun dan membina pengajian serta kehidupan saya dari sifar — itulah yang paling membentuk diri saya. Sisi ini untuk segala yang bukan kerja.",
      writingHeading: "Penulisan",
      writingBlurb: "Esei peribadi, sekali-sekala.",
      allWriting: "Semua penulisan →",
      logHeading: "Log Pembinaan",
      logBlurb: "Nota mingguan daripada tesis.",
      fullLog: "Log penuh →",
      nothingYet: "Belum ada.",
    },

    writingPage: {
      title: "Penulisan",
      lead: "Esei peribadi, sekali-sekala.",
      empty: "Belum ada apa-apa.",
      home: "← Laman utama",
    },

    progressPage: {
      title: "Log Pembinaan",
      lead: "Kemajuan tesis dan perjalanan sim→nyata. Terbaharu dahulu.",
      filterAll: "Semua",
      empty: "Belum ada catatan.",
      home: "← Laman utama",
    },

    ui: {
      themeToLight: "Tukar ke mod cerah",
      themeToDark: "Tukar ke mod gelap",
      langLabel: "Bahasa",
      modeLabel: "Sisi",
    },
  },
};
