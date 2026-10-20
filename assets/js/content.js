/* ============================================================================
 *  content.js: EVERY WORD on this site lives here.
 * ----------------------------------------------------------------------------
 *  HOW TO EDIT
 *  • To change text: find the line, edit what's inside the "quotes". Done.
 *  • Three languages: en (English), ja (日本語), ms (Melayu). Keep them in sync,
 *    but it's fine if a few are rough: you can polish anytime.
 *  • Keep the structure (the keys / commas / brackets) the same. Only change
 *    the text inside the quotes. If the site goes blank, you probably deleted a
 *    comma or a quote: undo and try again.
 *  • Lists look like ["item one", "item two"]: add/remove items freely.
 *  • To add a LOG entry, edit progress.js instead (separate file).
 * ==========================================================================*/

window.SITE_CONTENT = {

  /* =====================================================================
   *  ENGLISH
   * ===================================================================*/
  en: {
    langName: "EN",
    dir: "ltr",

    nav: {
      about: "About",
      research: "Research",
      now: "Now",
      log: "Log",
      writing: "Writing",
      contact: "Contact",
    },

    hero: {
      eyebrow: "Robotics Engineering",
      name: "Aiman Hazim",
      // One short line under the name. (One entry = static; several rotate.)
      roles: [
        "Autonomous navigation",
      ],
      intro:
        "Fourth-year robotics student at Fukui University, Intelligent Robot Research Laboratory. My thesis is robot navigation with a thermal camera. It runs in simulation for now. I plan to put it on a real robot.",
      ctaPrimary: "Research",
      ctaSecondary: "Build log",
      location: "Japan",
      available: "Open to 2027 roles",
    },

    // The Professional | Personal view toggle in the hero.
    mode: {
      pro: "Professional",
      personal: "Personal",
    },

    // The "currently learning" panel in the hero.
    learning: {
      heading: "Currently learning",
      caption: "in rough order of urgency",
      items: [
        { label: "NVIDIA Isaac Sim", detail: "large-scale dynamic worlds" },
        { label: "C++",              detail: "from Python to real-time perception" },
      ],
    },

    about: {
      heading: "About",
      lead: "I want to build robots that can find their own way around.",
      paragraphs: [
        "Most of my time goes to autonomous navigation. A robot senses its surroundings and chooses where to go.",
        "Fourth year at Fukui University, Intelligent Robot Research Laboratory. My thesis is robot navigation with a thermal camera. It is all in simulation for now. Control, probability, and linear algebra take about as much of the week as the code.",
        "I moved to Japan for university and started from zero: a new language, and no contacts. Settling in took patience. The research takes patience too. I spend time on the fundamentals.",
      ],
      facts: [
        { label: "University", value: "Fukui University, Robotics Course" },
        { label: "Lab",        value: "Intelligent Robot Research Lab" },
        { label: "Year",       value: "B4 · graduating Mar 2027" },
        { label: "Languages",  value: "English · Japanese · Malay" },
      ],
    },

    research: {
      kicker: "Bachelor's thesis, 2025-26",
      heading: "Thermal-camera navigation, in simulation",
      summary:
        "Robot navigation with a thermal camera. It is built and tested in simulation first, then moves to a real robot.",
      sensorsLabel: "Stack",
      sensors: [
        "Thermal camera",
        "NVIDIA Isaac Sim",
        "Mega Rover · sim2real target",
      ],
      phasesHeading: "The plan",
      phases: [
        { tag: "Phase 1", title: "Build the world",
          desc: "An indoor environment in Isaac Sim for the robot to drive in." },
        { tag: "Phase 2", title: "Navigation",
          desc: "Robot navigation with a thermal camera, tested in simulation." },
        { tag: "Phase 3", title: "Evaluate",
          desc: "Test it across many simulated conditions and compare it with existing methods." },
        { tag: "Phase 4", title: "Hand it over",
          desc: "Document the environment, code, and analysis scripts so next year's students can continue without me." },
      ],
      sim2realLabel: "Sim → Real",
      sim2real:
        "Simulation first. What holds up in the Isaac Sim experiments moves to a real Mega Rover.",
    },

    now: {
      heading: "What I'm doing now",
      lead: "Hardware is expensive and lab time is limited, so simulation comes before a real robot. Roughly in order:",
      roadmap: [
        { date: "2026 · now",  title: "Learn Isaac Sim properly",
          desc: "Environments and sensors. C++ alongside. Python is not enough for real-time perception.", state: "active" },
        { date: "2026 · H2",   title: "Thesis experiments",
          desc: "Run the thesis experiments in simulation and write them up.", state: "next" },
        { date: "2027",        title: "Onto real hardware",
          desc: "Move the sim work onto a Mega Rover, and start a hardware build of my own.", state: "future" },
        { date: "Mar 2027",    title: "Graduate",
          desc: "Finish at Fukui University. Then work in autonomous driving or mobile robotics.", state: "future" },
      ],
    },

    skills: {
      heading: "Toolbox",
      lead: "What I use, and for how long.",
      groups: [
        { name: "Comfortable", items: [
          { name: "Python", note: "~2 yrs" },
          { name: "Linux",  note: "~3 yrs" },
        ]},
        { name: "Building", items: [
          { name: "C++",       note: "learning" },
          { name: "Isaac Sim", note: "learning" },
          { name: "ROS",       note: "~6 mo" },
          { name: "Docker",    note: "~6 mo" },
          { name: "Git",       note: "~6 mo" },
        ]},
        { name: "Domains", items: [
          { name: "SLAM" }, { name: "3D LiDAR" }, { name: "Thermal vision" },
          { name: "Deep learning / ViT" }, { name: "Control theory" },
        ]},
      ],
    },

    projects: {
      heading: "Logbook",
      lead: "Selected work.",
      items: [
        { title: "PyroScout: Thermal × LiDAR search-and-rescue",
          desc: "A 2D robotics simulator I wrote from scratch. A mobile robot with no map uses 2D LiDAR to map and a thermal sensor to find a victim, then explores, plans with A*, and drives there. 8/8 runs solved, zero wall collisions. The write-up is a notebook you can run.",
          tags: ["Python", "LiDAR", "Thermal", "A*", "Sensor fusion"],
          links: [{ href: "/projects/pyroscout/", label: "Read the write-up" },
                  { href: "https://github.com/a-haz/pyroscout", label: "GitHub" }] },
        { title: "Thermal × 3D LiDAR human following",
          desc: "Human following that fuses 3D LiDAR point clouds with thermal data, so tracking still works where cameras fail.",
          tags: ["Python", "LiDAR", "Thermal", "SLAM"],
          link: "https://github.com/a-haz", linkLabel: "GitHub" },
        { title: "Transformer trackers (ViT / SPT)",
          desc: "Reading and reimplementing Vision Transformer and SPT trackers for place recognition and object tracking. I build them from scratch.",
          tags: ["Python", "Deep learning", "ViT"],
          link: "https://github.com/a-haz", linkLabel: "GitHub" },
        { title: "Embedded C & hardware logic",
          desc: "Register-level C: 7-segment displays, and control logic for a larger robot state machine.",
          tags: ["C", "Embedded"],
          link: "https://github.com/a-haz", linkLabel: "GitHub" },
        { title: "Robot Engineering Creative Experiment",
          desc: "Our team's creative-experiment project won the Eiwa System Management Prize.",
          tags: ["Award · 2025", "Teamwork"],
          link: "", linkLabel: "" },
      ],
    },

    contact: {
      heading: "Get in touch",
      lead: "Looking for autonomous driving and mobile robotics roles from 2027. Questions about SLAM, simulation, or this site are welcome.",
      coinAria: "Flip the photo to switch between professional and personal",
      altPro: "Aiman Hazim (professional)",
      altPersonal: "Aiman Hazim (personal)",
      resumeEn: "Résumé (EN)",
      resumeJa: "履歴書 (JP)",
      links: [
        { label: "GitHub", value: "github.com/a-haz", href: "https://github.com/a-haz" },
        { label: "LinkedIn",  value: "linkedin.com/in/a-haz", href: "https://www.linkedin.com/in/a-haz" },
        { label: "X",         value: "@manjym_", href: "https://x.com/manjym_" },
        { label: "Instagram", value: "@manjym_", href: "https://instagram.com/manjym_" },
        { label: "Email",     value: "contact@aimanhazim.com", href: "mailto:contact@aimanhazim.com" },
      ],
      formHeading: "Send a message",
      form: {
        name: "Name",
        email: "Email",
        message: "Message",
        send: "Send",
      },
    },

    footer: {
      tagline: "HTML, CSS, and a little JavaScript. No framework, no build step.",
      backToTop: "Back to top ↑",
    },

    /* ---------------- the Personal side ---------------- */
    personal: {
      intro:
        "This side is for things that are not work. Moving to Japan and starting from zero shaped me more than any course. Some of the writing is about that.",
      writingHeading: "Writing",
      writingBlurb: "Occasional personal essays.",
      allWriting: "All writing →",
      logHeading: "Build Log",
      logBlurb: "Week-to-week notes from the thesis.",
      fullLog: "Full log →",
      nothingYet: "Nothing yet.",
    },

    // The Writing page (writing.html)
    writingPage: {
      eyebrow: "Personal notes",
      title: "Writing",
      lead: "Personal essays, occasionally.",
      empty: "Nothing here yet.",
      home: "← Home",
    },

    // The Build Log page (progress.html)
    progressPage: {
      eyebrow: "Field notes",
      title: "Build Log",
      lead: "Thesis notes, as I go. Newest first.",
      filterAll: "All",
      empty: "No entries yet.",
      home: "← Home",
      readMore: "Read",
    },

    ui: {
      themeToLight: "Switch to light mode",
      themeToDark: "Switch to dark mode",
      langLabel: "Language",
      menu: "Menu",
      modeLabel: "Side",
    },
  },

  /* =====================================================================
   *  日本語  (JAPANESE)
   * ===================================================================*/
  ja: {
    langName: "JA",
    dir: "ltr",

    nav: {
      about: "自己紹介",
      research: "研究",
      now: "いま",
      log: "ログ",
      writing: "書きもの",
      contact: "連絡",
    },

    hero: {
      eyebrow: "ロボティクス専攻",
      name: "アイマン・ハジム",
      roles: [
        "自律ナビゲーション",
      ],
      intro:
        "福井大学 知能ロボット研究室の4年です。卒論は、熱画像カメラを使ったロボットのナビゲーションです。いまはシミュレーションで、そのあと実機に載せます。",
      ctaPrimary: "研究を見る",
      ctaSecondary: "ビルドログ",
      location: "日本",
      available: "2027年からの就業を希望",
    },

    mode: {
      pro: "仕事",
      personal: "個人",
    },

    learning: {
      heading: "いま学んでいること",
      caption: "急ぎの順に",
      items: [
        { label: "NVIDIA Isaac Sim", detail: "大規模・動的環境の構築" },
        { label: "C++",              detail: "Pythonからリアルタイム認識へ" },
      ],
    },

    about: {
      heading: "自己紹介",
      lead: "自分で道を見つけて動くロボットをつくりたい。",
      paragraphs: [
        "いちばん時間を使っているのは自律ナビゲーションです。ロボットが周囲を見て、自分で行き先を決めます。",
        "福井大学の4年で、知能ロボット研究室です。卒論は熱画像カメラを使ったロボットのナビゲーションです。いまはすべてシミュレーションです。制御、確率、線形代数にも、コードと同じくらい時間を使っています。",
        "大学のために来日して、言葉も知り合いもゼロからでした。慣れるまで忍耐が要りました。研究でも基礎に時間をかけています。",
      ],
      facts: [
        { label: "大学",   value: "福井大学 ロボティクスコース" },
        { label: "研究室", value: "知能ロボット研究室" },
        { label: "学年",   value: "B4 · 2027年3月卒業見込み" },
        { label: "言語",   value: "英語 · 日本語 · マレー語" },
      ],
    },

    research: {
      kicker: "卒業論文、2025-26",
      heading: "熱画像カメラによるナビゲーション（シミュレーション）",
      summary:
        "熱画像カメラを使ったロボットのナビゲーションです。まずシミュレーションで作って試し、そのあと実機に移します。",
      sensorsLabel: "構成",
      sensors: [
        "熱画像カメラ",
        "NVIDIA Isaac Sim",
        "メガローバー · sim2realの実機",
      ],
      phasesHeading: "計画",
      phases: [
        { tag: "フェーズ1", title: "環境を作る",
          desc: "ロボットが走るための屋内環境をIsaac Simで作ります。" },
        { tag: "フェーズ2", title: "ナビゲーション",
          desc: "熱画像カメラを使ったナビゲーションを、シミュレーションで試します。" },
        { tag: "フェーズ3", title: "評価",
          desc: "いろいろなシミュレーション条件で試し、既存手法と比べます。" },
        { tag: "フェーズ4", title: "引き継ぎ",
          desc: "環境、コード、解析スクリプトを文書にして、来年の学生が、私がいなくても続けられるようにします。" },
      ],
      sim2realLabel: "Sim → Real",
      sim2real:
        "まずはすべてシミュレーションです。Isaac Simで確かめられたものを、実機のメガローバーへ移します。",
    },

    now: {
      heading: "いまやっていること",
      lead: "実機は高く、研究室の時間も限られています。だから先にシミュレーションです。だいたいこの順です。",
      roadmap: [
        { date: "2026 · 現在", title: "Isaac Simを身につける",
          desc: "環境とセンサ。リアルタイムの認識にはPythonだけでは足りないので、C++も並行して練習します。", state: "active" },
        { date: "2026 · 後半", title: "卒論の実験",
          desc: "シミュレーションで卒論の実験をして、論文にまとめます。", state: "next" },
        { date: "2027",       title: "実機へ",
          desc: "シミュレーションの成果をメガローバーに移し、自作のハードウェアも始めます。", state: "future" },
        { date: "2027年3月",  title: "卒業",
          desc: "福井大学を卒業し、自動運転か移動ロボットの仕事を始めます。", state: "future" },
      ],
    },

    skills: {
      heading: "ツールボックス",
      lead: "使っているものと、その期間。",
      groups: [
        { name: "得意", items: [
          { name: "Python", note: "約2年" },
          { name: "Linux",  note: "約3年" },
        ]},
        { name: "習得中", items: [
          { name: "C++",       note: "学習中" },
          { name: "Isaac Sim", note: "学習中" },
          { name: "ROS",       note: "約半年" },
          { name: "Docker",    note: "約半年" },
          { name: "Git",       note: "約半年" },
        ]},
        { name: "分野", items: [
          { name: "SLAM" }, { name: "3D LiDAR" }, { name: "熱画像認識" },
          { name: "深層学習 / ViT" }, { name: "制御理論" },
        ]},
      ],
    },

    projects: {
      heading: "ログブック",
      lead: "選んだ仕事と実験。",
      items: [
        { title: "PyroScout：熱画像 × LiDAR の探索救助",
          desc: "ゼロから書いた2Dロボットシミュレータです。地図のない移動ロボットが、2D LiDARで地図を作り、熱センサで要救助者を見つけ、探索し、A*で経路を計画して、自分でそこへ行きます。8回中8回成功、壁との衝突はゼロ。実行できるノートブックにまとめています。",
          tags: ["Python", "LiDAR", "熱画像", "A*", "センサ融合"],
          links: [{ href: "/projects/pyroscout/", label: "解説を読む" },
                  { href: "https://github.com/a-haz/pyroscout", label: "GitHub" }] },
        { title: "熱画像 × 3D LiDAR 人追従",
          desc: "3D LiDARの点群と熱画像を合わせた人追従です。普通のカメラでは追えない場所でも追跡します。",
          tags: ["Python", "LiDAR", "熱画像", "SLAM"],
          link: "https://github.com/a-haz", linkLabel: "GitHub" },
        { title: "Transformerトラッカー（ViT / SPT）",
          desc: "場所認識と物体追跡のため、Vision TransformerとSPTのトラッカーを読んで、自分で実装しています。",
          tags: ["Python", "深層学習", "ViT"],
          link: "https://github.com/a-haz", linkLabel: "GitHub" },
        { title: "組込みCとハードウェア制御",
          desc: "レジスタを直接触るCです。7セグの制御と、より大きなロボットの状態機械につながる制御です。",
          tags: ["C", "組込み"],
          link: "https://github.com/a-haz", linkLabel: "GitHub" },
        { title: "ロボット工学創造実験",
          desc: "チームの創造実験プロジェクトで永和システムマネジメント賞を受賞しました。",
          tags: ["受賞 · 2025", "チーム"],
          link: "", linkLabel: "" },
      ],
    },

    contact: {
      heading: "連絡先",
      lead: "2027年から、自動運転か移動ロボットの仕事を探しています。SLAM、シミュレーション、このサイトのことも、聞いてください。",
      coinAria: "写真をめくって「仕事」と「個人」を切り替える",
      altPro: "アイマン・ハジム（仕事）",
      altPersonal: "アイマン・ハジム（個人）",
      resumeEn: "履歴書（英語）",
      resumeJa: "履歴書（日本語）",
      links: [
        { label: "GitHub", value: "github.com/a-haz", href: "https://github.com/a-haz" },
        { label: "LinkedIn",  value: "linkedin.com/in/a-haz", href: "https://www.linkedin.com/in/a-haz" },
        { label: "X",         value: "@manjym_", href: "https://x.com/manjym_" },
        { label: "Instagram", value: "@manjym_", href: "https://instagram.com/manjym_" },
        { label: "メール",    value: "contact@aimanhazim.com", href: "mailto:contact@aimanhazim.com" },
      ],
      formHeading: "メッセージを送る",
      form: {
        name: "お名前",
        email: "メール",
        message: "メッセージ",
        send: "送信",
      },
    },

    footer: {
      tagline: "HTML、CSS、少しのJavaScriptです。フレームワークもビルドもありません。",
      backToTop: "上へ戻る ↑",
    },

    personal: {
      intro:
        "ここは仕事以外の場所です。来日してゼロから始めたことは、どの授業よりも自分を形作りました。書きものの一部はその話です。",
      writingHeading: "書きもの",
      writingBlurb: "ときどき、個人的なエッセイ。",
      allWriting: "すべて読む →",
      logHeading: "ビルドログ",
      logBlurb: "卒論の週ごとの記録。",
      fullLog: "全部見る →",
      nothingYet: "まだありません。",
    },

    writingPage: {
      eyebrow: "個人ノート",
      title: "書きもの",
      lead: "個人的なエッセイを、ときどき。",
      empty: "まだありません。",
      home: "← ホーム",
    },

    progressPage: {
      eyebrow: "フィールドノート",
      title: "ビルドログ",
      lead: "卒論の記録です。新しい順。",
      filterAll: "すべて",
      empty: "まだ記録はありません。",
      home: "← ホーム",
      readMore: "読む",
    },

    ui: {
      themeToLight: "ライトモードへ",
      themeToDark: "ダークモードへ",
      langLabel: "言語",
      menu: "メニュー",
      modeLabel: "表示",
    },
  },

  /* =====================================================================
   *  MELAYU  (MALAY)
   * ===================================================================*/
  ms: {
    langName: "MS",
    dir: "ltr",

    nav: {
      about: "Tentang",
      research: "Penyelidikan",
      now: "Sekarang",
      log: "Log",
      writing: "Penulisan",
      contact: "Hubungi",
    },

    hero: {
      eyebrow: "Kejuruteraan Robotik",
      name: "Aiman Hazim",
      roles: [
        "Navigasi autonomi",
      ],
      intro:
        "Pelajar robotik tahun empat di Makmal Penyelidikan Robot Pintar, Universiti Fukui. Tesis saya navigasi robot dengan kamera terma. Sekarang dalam simulasi. Lepas ini saya pindahkan ke robot sebenar.",
      ctaPrimary: "Penyelidikan",
      ctaSecondary: "Log pembinaan",
      location: "Jepun",
      available: "Terbuka untuk peluang 2027",
    },

    mode: {
      pro: "Profesional",
      personal: "Peribadi",
    },

    learning: {
      heading: "Sedang saya pelajari",
      caption: "ikut keutamaan, lebih kurang",
      items: [
        { label: "NVIDIA Isaac Sim", detail: "dunia dinamik berskala besar" },
        { label: "C++",              detail: "dari Python ke persepsi masa nyata" },
      ],
    },

    about: {
      heading: "Tentang",
      lead: "Saya mahu membina robot yang boleh mencari jalannya sendiri.",
      paragraphs: [
        "Yang paling saya buat ialah navigasi autonomi. Robot mengesan sekeliling dan pilih ke mana hendak pergi. Kebanyakan masa belajar dan projek saya di situ.",
        "Tahun empat di Universiti Fukui, Makmal Penyelidikan Robot Pintar. Tesis saya navigasi robot dengan kamera terma. Buat masa ini semuanya dalam simulasi. Kawalan, kebarangkalian, dan algebra linear ambil masa lebih kurang sama dengan kod.",
        "Saya pindah ke Jepun untuk universiti dan mula dari kosong: bahasa baru, tiada kenalan. Menetap ambil masa, dan kesabaran itu ada dalam penyelidikan juga. Saya luangkan masa pada asas.",
      ],
      facts: [
        { label: "Universiti", value: "Universiti Fukui, Kursus Robotik" },
        { label: "Makmal",     value: "Makmal Penyelidikan Robot Pintar" },
        { label: "Tahun",      value: "B4 · bergraduat Mac 2027" },
        { label: "Bahasa",     value: "Inggeris · Jepun · Melayu" },
      ],
    },

    research: {
      kicker: "Tesis sarjana muda, 2025-26",
      heading: "Navigasi kamera terma, dalam simulasi",
      summary:
        "Navigasi robot dengan kamera terma. Dibina dan diuji dalam simulasi dahulu, kemudian dipindah ke robot sebenar.",
      sensorsLabel: "Susunan",
      sensors: [
        "Kamera terma",
        "NVIDIA Isaac Sim",
        "Mega Rover · sasaran sim2real",
      ],
      phasesHeading: "Pelan",
      phases: [
        { tag: "Fasa 1", title: "Bina dunia",
          desc: "Persekitaran dalaman dalam Isaac Sim untuk robot bergerak." },
        { tag: "Fasa 2", title: "Navigasi",
          desc: "Navigasi robot dengan kamera terma, diuji dalam simulasi." },
        { tag: "Fasa 3", title: "Nilai",
          desc: "Uji dalam pelbagai keadaan simulasi dan banding dengan kaedah sedia ada." },
        { tag: "Fasa 4", title: "Serah tugas",
          desc: "Dokumenkan persekitaran, kod, dan skrip analisis supaya pelajar tahun depan boleh sambung tanpa saya." },
      ],
      sim2realLabel: "Sim → Nyata",
      sim2real:
        "Simulasi dahulu. Yang bertahan dalam eksperimen Isaac Sim dipindah ke Mega Rover sebenar.",
    },

    now: {
      heading: "Apa yang saya buat sekarang",
      lead: "Perkakasan mahal dan masa makmal terhad, jadi simulasi dahulu, sebelum robot sebenar. Lebih kurang ikut urutan ini:",
      roadmap: [
        { date: "2026 · kini", title: "Belajar Isaac Sim betul-betul",
          desc: "Persekitaran dan sensor. C++ sekali. Python sahaja tak cukup untuk persepsi masa nyata.", state: "active" },
        { date: "2026 · S2",   title: "Eksperimen tesis",
          desc: "Jalankan eksperimen tesis dalam simulasi, kemudian tulis.", state: "next" },
        { date: "2027",        title: "Ke perkakasan sebenar",
          desc: "Pindah kerja simulasi ke Mega Rover, dan mula bina perkakasan sendiri.", state: "future" },
        { date: "Mac 2027",    title: "Bergraduat",
          desc: "Tamat di Universiti Fukui. Kemudian kerja dalam pandu autonomi atau robot mudah alih.", state: "future" },
      ],
    },

    skills: {
      heading: "Kotak alat",
      lead: "Apa yang saya guna, dan berapa lama.",
      groups: [
        { name: "Selesa", items: [
          { name: "Python", note: "~2 thn" },
          { name: "Linux",  note: "~3 thn" },
        ]},
        { name: "Membina", items: [
          { name: "C++",       note: "belajar" },
          { name: "Isaac Sim", note: "belajar" },
          { name: "ROS",       note: "~6 bln" },
          { name: "Docker",    note: "~6 bln" },
          { name: "Git",       note: "~6 bln" },
        ]},
        { name: "Bidang", items: [
          { name: "SLAM" }, { name: "LiDAR 3D" }, { name: "Penglihatan terma" },
          { name: "Pembelajaran dalam / ViT" }, { name: "Teori kawalan" },
        ]},
      ],
    },

    projects: {
      heading: "Buku log",
      lead: "Kerja terpilih.",
      items: [
        { title: "PyroScout: Mencari & menyelamat Terma × LiDAR",
          desc: "Simulator robotik 2D yang saya tulis dari awal. Robot mudah alih tanpa peta guna LiDAR 2D untuk peta dan sensor terma untuk cari mangsa, kemudian teroka, rancang dengan A*, dan pandu ke sana. 8/8 larian berjaya, sifar perlanggaran dinding. Tulisannya nota yang boleh dijalankan.",
          tags: ["Python", "LiDAR", "Terma", "A*", "Gabungan sensor"],
          links: [{ href: "/projects/pyroscout/", label: "Baca tulisan" },
                  { href: "https://github.com/a-haz/pyroscout", label: "GitHub" }] },
        { title: "Pengikutan manusia Terma × LiDAR 3D",
          desc: "Ikut manusia dengan awan titik LiDAR 3D dan data terma, supaya penjejakan kekal di tempat kamera gagal.",
          tags: ["Python", "LiDAR", "Terma", "SLAM"],
          link: "https://github.com/a-haz", linkLabel: "GitHub" },
        { title: "Penjejak Transformer (ViT / SPT)",
          desc: "Baca dan tulis semula penjejak Vision Transformer dan SPT untuk pengecaman tempat dan penjejakan objek. Saya bina dari awal.",
          tags: ["Python", "Pembelajaran dalam", "ViT"],
          link: "https://github.com/a-haz", linkLabel: "GitHub" },
        { title: "C terbenam & logik perkakasan",
          desc: "C peringkat daftar: paparan 7-segmen, dan logik kawalan untuk mesin keadaan robot yang lebih besar.",
          tags: ["C", "Terbenam"],
          link: "https://github.com/a-haz", linkLabel: "GitHub" },
        { title: "Eksperimen Kreatif Kejuruteraan Robot",
          desc: "Projek eksperimen kreatif pasukan kami memenangi Hadiah Eiwa System Management.",
          tags: ["Anugerah · 2025", "Berpasukan"],
          link: "", linkLabel: "" },
      ],
    },

    contact: {
      heading: "Hubungi saya",
      lead: "Saya cari kerja pandu autonomi dan robot mudah alih mulai 2027. Soalan tentang SLAM, simulasi, atau laman ini boleh.",
      coinAria: "Balikkan foto untuk tukar antara profesional dan peribadi",
      altPro: "Aiman Hazim (profesional)",
      altPersonal: "Aiman Hazim (peribadi)",
      resumeEn: "Resume (BI)",
      resumeJa: "Resume (JP)",
      links: [
        { label: "GitHub", value: "github.com/a-haz", href: "https://github.com/a-haz" },
        { label: "LinkedIn",  value: "linkedin.com/in/a-haz", href: "https://www.linkedin.com/in/a-haz" },
        { label: "X",         value: "@manjym_", href: "https://x.com/manjym_" },
        { label: "Instagram", value: "@manjym_", href: "https://instagram.com/manjym_" },
        { label: "E-mel",     value: "contact@aimanhazim.com", href: "mailto:contact@aimanhazim.com" },
      ],
      formHeading: "Hantar mesej",
      form: {
        name: "Nama",
        email: "E-mel",
        message: "Mesej",
        send: "Hantar",
      },
    },

    footer: {
      tagline: "HTML, CSS, dan sedikit JavaScript. Tiada rangka kerja, tiada binaan.",
      backToTop: "Ke atas ↑",
    },

    personal: {
      intro:
        "Bahagian ini untuk yang bukan kerja. Pindah ke Jepun dan mula dari kosong membentuk saya lebih daripada mana-mana kelas. Sebahagian tulisan tentang itu.",
      writingHeading: "Penulisan",
      writingBlurb: "Esei peribadi, sekali-sekala.",
      allWriting: "Semua penulisan →",
      logHeading: "Log Pembinaan",
      logBlurb: "Nota mingguan daripada tesis.",
      fullLog: "Log penuh →",
      nothingYet: "Belum ada.",
    },

    writingPage: {
      eyebrow: "Nota peribadi",
      title: "Penulisan",
      lead: "Esei peribadi, sekali-sekala.",
      empty: "Belum ada apa-apa.",
      home: "← Laman utama",
    },

    progressPage: {
      eyebrow: "Nota lapangan",
      title: "Log Pembinaan",
      lead: "Nota tesis semasa berjalan. Terbaharu dahulu.",
      filterAll: "Semua",
      empty: "Belum ada catatan.",
      home: "← Laman utama",
      readMore: "Baca",
    },

    ui: {
      themeToLight: "Tukar ke mod cerah",
      themeToDark: "Tukar ke mod gelap",
      langLabel: "Bahasa",
      menu: "Menu",
      modeLabel: "Sisi",
    },
  },
};
