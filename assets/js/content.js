/* ============================================================================
 *  content.js  —  EVERY WORD on this site lives here.
 * ----------------------------------------------------------------------------
 *  HOW TO EDIT
 *  • To change text: find the line, edit what's inside the "quotes". Done.
 *  • Three languages: en (English), ja (日本語), ms (Melayu). Keep them in sync,
 *    but it's fine if a few are rough — you can polish anytime.
 *  • Keep the structure (the keys / commas / brackets) the same. Only change
 *    the text inside the quotes. If the site goes blank, you probably deleted a
 *    comma or a quote — undo and try again.
 *  • Lists look like ["item one", "item two"] — add/remove items freely.
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
      // These rotate one after another in the hero.
      roles: [
        "Robotics engineering student",
        "Autonomous systems & SLAM",
        "Simulation-first, sim2real bound",
      ],
      intro:
        "Fourth-year robotics student in Fukui University's Intelligent Robot Research Laboratory. I build autonomous navigation that fuses thermal vision with 3D LiDAR — right now entirely in simulation, on a deliberate path toward real hardware.",
      ctaPrimary: "See what I'm building",
      ctaSecondary: "Read the log",
      location: "Japan",
      available: "Open to 2027 roles",
    },

    // The Professional | Personal view toggle in the hero.
    mode: {
      pro: "Professional",
      personal: "Personal",
    },

    // The animated "system monitor" panel in the hero.
    learning: {
      heading: "now_learning",
      caption: "what I'm leveling up this season",
      items: [
        { label: "NVIDIA Isaac Sim", detail: "large-scale dynamic worlds" },
        { label: "C++",              detail: "from Python to real-time perception" },
        { label: "Active SLAM",      detail: "TIR + LiDAR, frontier exploration" },
        { label: "Human-behavior AI", detail: "crowd agents that walk like people" },
      ],
    },

    about: {
      heading: "About",
      lead: "Building autonomous robots that sense and find their own way through the world — one fundamental at a time.",
      paragraphs: [
        "What pulls me into robotics is simple: I want to build machines that can sense the world, make sense of it, and move through it on their own. Autonomous navigation — giving a robot the perception and judgment to find its own path — is the problem I find most worth chasing.",
        "I'm in my fourth year (B4) at Fukui University, in the Intelligent Robot Research Laboratory, working where robotics meets AI — control theory, machine perception, and the math beneath it: linear algebra, probability, and statistics. Right now that means fusing thermal vision with 3D LiDAR, entirely in simulation, on a deliberate path toward real hardware.",
        "I came to Japan and built my studies and my life here from zero, which taught me to step into unfamiliar places without fear. I bring that same patience to research: the higher the goal, the more the unglamorous fundamentals matter — so I solidify the theory first, then build.",
      ],
      facts: [
        { label: "University", value: "Fukui University — Robotics Course" },
        { label: "Lab",        value: "Intelligent Robot Research Lab" },
        { label: "Year",       value: "B4 · graduating Mar 2027" },
        { label: "Languages",  value: "English · Japanese · Malay" },
      ],
    },

    research: {
      kicker: "Bachelor's thesis · 2025–26",
      heading: "TIR-LiDAR Active SLAM, built in simulation",
      summary:
        "I'm building a large-scale simulation environment populated with human-behavior AI, and using it to develop active multimodal SLAM: navigation that fuses a thermal (TIR) camera with 3D LiDAR and stays robust in the dark, in crowds, and behind occlusions.",
      baseLabel: "Building on",
      base:
        "HO3-SLAM / Walk2Map++ — extending it from passive RGB vision to active perception, where the robot chooses where to look.",
      sensorsLabel: "Stack",
      sensors: [
        "Thermal / far-infrared (TIR) camera",
        "Velodyne 3D LiDAR",
        "NVIDIA Isaac Sim",
        "Mega Rover · sim2real target",
      ],
      phasesHeading: "The plan",
      phases: [
        { tag: "Phase 1", title: "Build the world",
          desc: "A 20×20 m indoor environment in Isaac Sim, populated with human agents that each have their own look, walking personality, and a perceive–plan–act loop. The robot navigates while logging TIR/LiDAR sequences." },
        { tag: "Phase 2", title: "Active multimodal SLAM",
          desc: "TIR + LiDAR SLAM driven by active control — collision avoidance, human-following, frontier exploration — evaluated across 100+ environment conditions on accuracy, map usefulness, and compute time." },
        { tag: "Phase 3", title: "Beat the baseline",
          desc: "Implement the proposed method and show it clearly outperforms existing approaches in wide, crowded, dark, and occluded conditions." },
        { tag: "Phase 4", title: "Package & hand over",
          desc: "Document the environment, agent algorithms, and analysis code so next year's students can pick it up cleanly." },
      ],
      sim2realLabel: "Sim → Real",
      sim2real:
        "Everything starts in simulation. The methods I prove in Isaac Sim are meant to transfer onto a real Mega Rover mobile robot — sim2real is the whole point.",
    },

    now: {
      heading: "What I'm doing right now",
      lead: "I'm deliberately simulation-first. Hardware is expensive, so I'm pulling every bit of learning I can out of Isaac Sim before touching a real robot — which is also just how modern robotics scales. The roadmap:",
      roadmap: [
        { date: "2026 · now",  title: "Master simulation",
          desc: "Learn Isaac Sim end to end — environments, sensors, human-behavior AI — and grow my C++ alongside Python.", state: "active" },
        { date: "2026 · H2",   title: "Thesis experiments",
          desc: "Run the active-SLAM evaluation across 100+ simulated conditions and prove the proposed method.", state: "next" },
        { date: "2027",        title: "Onto real hardware",
          desc: "Transfer the work sim2real onto a Mega Rover — and start my own hardware build.", state: "future" },
        { date: "Mar 2027",    title: "Graduate & go pro",
          desc: "Graduate from Fukui University and move into autonomous-driving / mobile-robotics work.", state: "future" },
      ],
    },

    skills: {
      heading: "Toolbox",
      lead: "Honest levels — including the things I'm still climbing.",
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
      lead: "Selected work and experiments.",
      items: [
        { title: "PyroScout — Thermal × LiDAR search-and-rescue",
          desc: "A from-scratch 2D robotics simulator: a blind mobile robot fuses 2D LiDAR (mapping) with a thermal sensor (to find a victim), then explores, plans with A*, and navigates autonomously — 8/8 runs solved with zero wall collisions. Ships with a narrated, runnable write-up.",
          tags: ["Python", "LiDAR", "Thermal", "A*", "Sensor fusion"],
          links: [{ href: "/projects/pyroscout/", label: "Read the write-up" },
                  { href: "https://github.com/a-haz/pyroscout", label: "GitHub" }] },
        { title: "Thermal × 3D LiDAR human following",
          desc: "Autonomous human-following logic that fuses 3D LiDAR point clouds with thermal data to keep tracking when plain vision fails — the seed of my thesis.",
          tags: ["Python", "LiDAR", "Thermal", "SLAM"],
          link: "https://github.com/a-haz", linkLabel: "GitHub" },
        { title: "Transformer trackers (ViT / SPT)",
          desc: "Studying Vision-Transformer and SPT-style trackers for place recognition and object tracking — implementing the networks from scratch to really understand them.",
          tags: ["Python", "Deep learning", "ViT"],
          link: "https://github.com/a-haz", linkLabel: "GitHub" },
        { title: "Embedded C & hardware logic",
          desc: "Lower-level work poking hardware registers and driving 7-segment displays — control logic that plugs into a larger robotic state machine.",
          tags: ["C", "Embedded"],
          link: "https://github.com/a-haz", linkLabel: "GitHub" },
        { title: "Robot Engineering Creative Experiment",
          desc: "Awarded the Eiwa System Management Prize for our robotics creative-experiment project.",
          tags: ["Award · 2023", "Teamwork"],
          link: "", linkLabel: "" },
      ],
    },

    contact: {
      heading: "Let's connect",
      lead: "I'm aiming for autonomous-driving and mobile-robotics roles from 2027. Reach out about SLAM, simulation, machine perception — or just to talk robots.",
      coinAria: "Flip the photo to switch between professional and personal",
      altPro: "Aiman Hazim — professional",
      altPersonal: "Aiman Hazim — personal",
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
        send: "Send transmission",
      },
    },

    footer: {
      tagline: "Built by hand with HTML, CSS & a little JavaScript.",
      backToTop: "Back to top ↑",
    },

    /* ---------------- the Personal side ---------------- */
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
      lead: "Day-to-day and week-to-week progress on the thesis and my sim→real journey. Newest first.",
      filterAll: "All",
      empty: "No entries yet — check back soon.",
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
        "ロボティクス専攻の学生",
        "自律システム・SLAM",
        "シミュレーション先行、sim2realへ",
      ],
      intro:
        "福井大学 知能ロボット研究室に所属する学部4年生です。熱画像と3D LiDARを融合した自律走行システムを研究しています。いまはすべてシミュレーション上で開発し、実機へと着実に進めています。",
      ctaPrimary: "研究を見る",
      ctaSecondary: "ログを読む",
      location: "日本",
      available: "2027年からの就業を希望",
    },

    mode: {
      pro: "仕事",
      personal: "個人",
    },

    learning: {
      heading: "now_learning",
      caption: "いま重点的に学んでいること",
      items: [
        { label: "NVIDIA Isaac Sim", detail: "大規模・動的環境の構築" },
        { label: "C++",              detail: "Pythonからリアルタイム認識へ" },
        { label: "アクティブSLAM",    detail: "TIR + LiDAR・フロンティア探索" },
        { label: "人間行動AI",        detail: "人らしく歩く群衆エージェント" },
      ],
    },

    about: {
      heading: "自己紹介",
      lead: "自ら世界を感知し、進む道を見つける自律ロボットをつくる — 基礎を一歩ずつ。",
      paragraphs: [
        "ロボティクスに惹かれる理由はシンプルです。世界を感じ取り、理解し、自ら動ける機械をつくりたい。ロボットに知覚と判断を与え、自分で進む道を見つけさせる「自律ナビゲーション」こそ、私が最も追い求める価値のある問題だと思っています。",
        "現在は福井大学の学部4年（B4）として知能ロボット研究室に所属し、ロボティクスとAIの融合領域 — 制御理論、機械認識、そしてその土台となる線形代数・確率・統計 — に取り組んでいます。いまは熱画像と3次元LiDARを融合させ、すべてシミュレーション上で、実機への道を見据えて進めています。",
        "来日し、学業も生活もゼロから築いてきました。その経験が、未知の環境にも恐れず飛び込む姿勢を育ててくれました。研究でも同じ忍耐を大切にしています。目標が高いほど地道な基礎が効いてくる — だからまず理論を固めてから作ります。",
      ],
      facts: [
        { label: "大学",   value: "福井大学 — ロボティクスコース" },
        { label: "研究室", value: "知能ロボット研究室" },
        { label: "学年",   value: "B4 · 2027年3月卒業見込み" },
        { label: "言語",   value: "英語 · 日本語 · マレー語" },
      ],
    },

    research: {
      kicker: "卒業論文 · 2025–26",
      heading: "シミュレーションで作る TIR-LiDAR アクティブSLAM",
      summary:
        "人間行動AIを含む大規模シミュレーション環境を構築し、それを用いてアクティブなマルチモーダルSLAMを開発しています。熱画像（TIR）カメラと3D LiDARを融合し、暗所・混雑・遮蔽下でも破綻しない自律走行を目指します。",
      baseLabel: "ベース研究",
      base:
        "HO3-SLAM / Walk2Map++ — 受動的なRGB視覚から、ロボット自身が観測地点を選ぶ「能動的知覚」へ発展させます。",
      sensorsLabel: "構成",
      sensors: [
        "熱画像・遠赤外線（TIR）カメラ",
        "Velodyne 3D LiDAR",
        "NVIDIA Isaac Sim",
        "メガローバー · sim2realの実機",
      ],
      phasesHeading: "計画",
      phases: [
        { tag: "フェーズ1", title: "環境を作る",
          desc: "Isaac Sim上に20×20mの屋内環境を設計。個別の外観・歩行特性・観測/行動/計画を行うAIを持つ人間エージェントを配置し、ロボットが走行しながらTIR/LiDARの系列データを取得します。" },
        { tag: "フェーズ2", title: "アクティブ・マルチモーダルSLAM",
          desc: "衝突回避・人追従・フロンティア法などの能動制御を伴うTIR + LiDAR SLAMを実装。100以上の環境条件で精度・地図有用性・計算時間を評価します。" },
        { tag: "フェーズ3", title: "既存手法を凌駕する",
          desc: "提案手法を実装し、広域・過密・暗所・遮蔽の厳しい条件で既存手法を明確に上回る性能を示します。" },
        { tag: "フェーズ4", title: "資産化と引継ぎ",
          desc: "環境・エージェントのアルゴリズム・解析コードを文書化し、翌年のB3学生へ円滑に技術継承します。" },
      ],
      sim2realLabel: "Sim → Real",
      sim2real:
        "すべてはシミュレーションから始まります。Isaac Simで実証した手法を、実機のメガローバーへ転移する — sim2realこそが目的です。",
    },

    now: {
      heading: "いま取り組んでいること",
      lead: "意図的に「シミュレーション先行」で進めています。ハードウェアは高価なので、実機に触れる前にIsaac Simから学べることを徹底的に吸収します。これは現代ロボティクスの王道でもあります。ロードマップ：",
      roadmap: [
        { date: "2026 · 現在", title: "シミュレーションを習得",
          desc: "Isaac Simを隅々まで — 環境・センサ・人間行動AI — 学び、PythonとともにC++も伸ばします。", state: "active" },
        { date: "2026 · 後半", title: "卒論の実験",
          desc: "100以上の条件でアクティブSLAMを評価し、提案手法を実証します。", state: "next" },
        { date: "2027",       title: "実機へ",
          desc: "成果をsim2realでメガローバーに転移し、自作ハードウェアにも着手します。", state: "future" },
        { date: "2027年3月",  title: "卒業して現場へ",
          desc: "福井大学を卒業し、自動運転・移動ロボットの分野へ進みます。", state: "future" },
      ],
    },

    skills: {
      heading: "ツールボックス",
      lead: "まだ登っている途中のものも含め、正直なレベルです。",
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
      lead: "代表的な成果と実験。",
      items: [
        { title: "PyroScout — 熱画像 × LiDAR の探索救助",
          desc: "ゼロから作った2Dロボットシミュレータ。地図を持たない移動ロボットが2D LiDAR（地図生成）と熱センサ（要救助者の発見）を融合し、フロンティア探査・A*経路計画・自律走行を行う。8回中8回成功・壁との衝突ゼロ。解説付きで実行可能なノートブックを同梱。",
          tags: ["Python", "LiDAR", "熱画像", "A*", "センサ融合"],
          links: [{ href: "/projects/pyroscout/", label: "解説を読む" },
                  { href: "https://github.com/a-haz/pyroscout", label: "GitHub" }] },
        { title: "熱画像 × 3D LiDAR 人追従",
          desc: "3D LiDARの点群と熱画像を融合し、通常の視覚が破綻しても追跡を続ける自律人追従ロジック。卒論の出発点です。",
          tags: ["Python", "LiDAR", "熱画像", "SLAM"],
          link: "https://github.com/a-haz", linkLabel: "GitHub" },
        { title: "Transformerトラッカー（ViT / SPT）",
          desc: "場所認識・物体追跡のためのVision TransformerやSPT系トラッカーを研究。理解のためネットワークを自分で実装しています。",
          tags: ["Python", "深層学習", "ViT"],
          link: "https://github.com/a-haz", linkLabel: "GitHub" },
        { title: "組込みCとハードウェア制御",
          desc: "ハードウェアレジスタの操作や7セグLEDの制御など、下位レイヤの制御ロジック。より大きなロボットの状態機械に接続します。",
          tags: ["C", "組込み"],
          link: "https://github.com/a-haz", linkLabel: "GitHub" },
        { title: "ロボット工学創造実験",
          desc: "創造実験のプロジェクトで永和システムマネジメント賞を受賞しました。",
          tags: ["受賞 · 2023", "チーム"],
          link: "", linkLabel: "" },
      ],
    },

    contact: {
      heading: "つながる",
      lead: "2027年からの自動運転・移動ロボット分野での就業を目指しています。SLAM・シミュレーション・機械認識、あるいはロボットの話、お気軽にどうぞ。",
      coinAria: "写真をめくって「仕事」と「個人」を切り替える",
      altPro: "アイマン・ハジム — 仕事",
      altPersonal: "アイマン・ハジム — 個人",
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
      tagline: "HTML・CSS・少しのJavaScriptで手作りしました。",
      backToTop: "上へ戻る ↑",
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
      eyebrow: "個人ノート",
      title: "書きもの",
      lead: "個人的なエッセイを、ときどき。",
      empty: "まだありません。",
      home: "← ホーム",
    },

    progressPage: {
      eyebrow: "フィールドノート",
      title: "ビルドログ",
      lead: "卒論とsim→realの歩みを、日々・週ごとに記録しています。新しい順。",
      filterAll: "すべて",
      empty: "まだ記録はありません。近日公開。",
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
        "Pelajar kejuruteraan robotik",
        "Sistem autonomi & SLAM",
        "Simulasi dahulu, menuju sim2real",
      ],
      intro:
        "Pelajar robotik tahun empat di Makmal Penyelidikan Robot Pintar, Universiti Fukui. Saya membina navigasi autonomi yang menggabungkan penglihatan terma dengan LiDAR 3D — buat masa ini sepenuhnya dalam simulasi, menuju perkakasan sebenar secara berperingkat.",
      ctaPrimary: "Lihat apa yang saya bina",
      ctaSecondary: "Baca log",
      location: "Jepun",
      available: "Terbuka untuk peluang 2027",
    },

    mode: {
      pro: "Profesional",
      personal: "Peribadi",
    },

    learning: {
      heading: "now_learning",
      caption: "yang sedang saya tingkatkan musim ini",
      items: [
        { label: "NVIDIA Isaac Sim", detail: "dunia dinamik berskala besar" },
        { label: "C++",              detail: "dari Python ke persepsi masa nyata" },
        { label: "SLAM Aktif",       detail: "TIR + LiDAR, penerokaan frontier" },
        { label: "AI tingkah laku manusia", detail: "ejen orang ramai yang berjalan realistik" },
      ],
    },

    about: {
      heading: "Tentang",
      lead: "Membina robot autonomi yang mengesan dan mencari jalannya sendiri di dunia — satu asas pada satu masa.",
      paragraphs: [
        "Apa yang menarik saya kepada robotik mudah sahaja: saya mahu membina mesin yang boleh mengesan dunia, memahaminya, dan bergerak sendiri. Navigasi autonomi — memberi robot persepsi dan pertimbangan untuk mencari jalannya sendiri — ialah masalah yang paling berbaloi saya kejar.",
        "Saya kini di tahun empat (B4) di Universiti Fukui, dalam Makmal Penyelidikan Robot Pintar, bekerja di pertemuan robotik dan AI — teori kawalan, persepsi mesin, dan matematik di sebaliknya: algebra linear, kebarangkalian, dan statistik. Buat masa ini saya menggabungkan penglihatan terma dengan LiDAR 3D, sepenuhnya dalam simulasi, menuju perkakasan sebenar.",
        "Saya datang ke Jepun dan membina pengajian serta kehidupan saya di sini dari sifar, yang mengajar saya melangkah ke tempat asing tanpa rasa takut. Saya bawa kesabaran yang sama ke penyelidikan: semakin tinggi matlamat, semakin penting asas yang membosankan itu — jadi saya kukuhkan teori dahulu, kemudian bina.",
      ],
      facts: [
        { label: "Universiti", value: "Universiti Fukui — Kursus Robotik" },
        { label: "Makmal",     value: "Makmal Penyelidikan Robot Pintar" },
        { label: "Tahun",      value: "B4 · bergraduat Mac 2027" },
        { label: "Bahasa",     value: "Inggeris · Jepun · Melayu" },
      ],
    },

    research: {
      kicker: "Tesis sarjana muda · 2025–26",
      heading: "SLAM Aktif TIR-LiDAR, dibina dalam simulasi",
      summary:
        "Saya membina persekitaran simulasi berskala besar yang dihuni AI tingkah laku manusia, dan menggunakannya untuk membangunkan SLAM multimodal aktif: navigasi yang menggabungkan kamera terma (TIR) dengan LiDAR 3D dan kekal teguh dalam gelap, dalam orang ramai, dan di sebalik halangan.",
      baseLabel: "Berasaskan",
      base:
        "HO3-SLAM / Walk2Map++ — memanjangkannya daripada penglihatan RGB pasif kepada persepsi aktif, di mana robot memilih ke mana hendak melihat.",
      sensorsLabel: "Susunan",
      sensors: [
        "Kamera terma / inframerah jauh (TIR)",
        "Velodyne LiDAR 3D",
        "NVIDIA Isaac Sim",
        "Mega Rover · sasaran sim2real",
      ],
      phasesHeading: "Pelan",
      phases: [
        { tag: "Fasa 1", title: "Bina dunia",
          desc: "Persekitaran dalaman 20×20 m dalam Isaac Sim, dihuni ejen manusia yang masing-masing ada rupa, perwatakan berjalan, dan gelung tanggap–rancang–tindak sendiri. Robot bernavigasi sambil merekod jujukan TIR/LiDAR." },
        { tag: "Fasa 2", title: "SLAM multimodal aktif",
          desc: "SLAM TIR + LiDAR yang dipacu kawalan aktif — mengelak perlanggaran, mengikut manusia, penerokaan frontier — dinilai merentas 100+ keadaan persekitaran dari segi ketepatan, kegunaan peta, dan masa pengiraan." },
        { tag: "Fasa 3", title: "Atasi garis dasar",
          desc: "Laksanakan kaedah yang dicadangkan dan tunjukkan ia jelas mengatasi pendekatan sedia ada dalam keadaan luas, sesak, gelap, dan terhalang." },
        { tag: "Fasa 4", title: "Pakej & serahan",
          desc: "Dokumenkan persekitaran, algoritma ejen, dan kod analisis supaya pelajar tahun depan boleh menyambung dengan lancar." },
      ],
      sim2realLabel: "Sim → Nyata",
      sim2real:
        "Semuanya bermula dalam simulasi. Kaedah yang saya buktikan dalam Isaac Sim akan dipindahkan ke robot mudah alih Mega Rover sebenar — sim2real itulah tujuannya.",
    },

    now: {
      heading: "Apa yang saya buat sekarang",
      lead: "Saya sengaja mendahulukan simulasi. Perkakasan mahal, jadi saya perah setiap pembelajaran daripada Isaac Sim sebelum menyentuh robot sebenar — yang juga cara robotik moden berkembang. Pelan jalannya:",
      roadmap: [
        { date: "2026 · kini", title: "Kuasai simulasi",
          desc: "Belajar Isaac Sim hujung ke hujung — persekitaran, sensor, AI tingkah laku manusia — sambil mengukuhkan C++ di samping Python.", state: "active" },
        { date: "2026 · S2",   title: "Eksperimen tesis",
          desc: "Jalankan penilaian SLAM aktif merentas 100+ keadaan simulasi dan buktikan kaedah yang dicadangkan.", state: "next" },
        { date: "2027",        title: "Ke perkakasan sebenar",
          desc: "Pindahkan kerja sim2real ke Mega Rover — dan mula membina perkakasan sendiri.", state: "future" },
        { date: "Mac 2027",    title: "Bergraduat & bekerja",
          desc: "Bergraduat dari Universiti Fukui dan masuk ke bidang pandu autonomi / robot mudah alih.", state: "future" },
      ],
    },

    skills: {
      heading: "Kotak alat",
      lead: "Tahap yang jujur — termasuk yang masih saya daki.",
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
      lead: "Kerja dan eksperimen terpilih.",
      items: [
        { title: "PyroScout — Mencari & menyelamat Terma × LiDAR",
          desc: "Simulator robotik 2D dari awal: robot mudah alih tanpa peta menggabungkan LiDAR 2D (memetakan) dengan sensor terma (mencari mangsa), kemudian meneroka, merancang dengan A*, dan bergerak secara autonomi — 8/8 larian berjaya tanpa perlanggaran dinding. Disertakan tulisan bernarasi yang boleh dijalankan.",
          tags: ["Python", "LiDAR", "Terma", "A*", "Gabungan sensor"],
          links: [{ href: "/projects/pyroscout/", label: "Baca tulisan" },
                  { href: "https://github.com/a-haz/pyroscout", label: "GitHub" }] },
        { title: "Pengikutan manusia Terma × LiDAR 3D",
          desc: "Logik mengikut manusia secara autonomi yang menggabungkan awan titik LiDAR 3D dengan data terma untuk terus menjejak apabila penglihatan biasa gagal — benih tesis saya.",
          tags: ["Python", "LiDAR", "Terma", "SLAM"],
          link: "https://github.com/a-haz", linkLabel: "GitHub" },
        { title: "Penjejak Transformer (ViT / SPT)",
          desc: "Mengkaji penjejak gaya Vision-Transformer dan SPT untuk pengecaman tempat dan penjejakan objek — melaksanakan rangkaian dari awal untuk benar-benar memahaminya.",
          tags: ["Python", "Pembelajaran dalam", "ViT"],
          link: "https://github.com/a-haz", linkLabel: "GitHub" },
        { title: "C terbenam & logik perkakasan",
          desc: "Kerja peringkat rendah mengendali daftar perkakasan dan memacu paparan 7-segmen — logik kawalan yang bersambung ke mesin keadaan robot yang lebih besar.",
          tags: ["C", "Terbenam"],
          link: "https://github.com/a-haz", linkLabel: "GitHub" },
        { title: "Eksperimen Kreatif Kejuruteraan Robot",
          desc: "Dianugerahkan Hadiah Eiwa System Management untuk projek eksperimen kreatif robotik kami.",
          tags: ["Anugerah · 2023", "Berpasukan"],
          link: "", linkLabel: "" },
      ],
    },

    contact: {
      heading: "Mari berhubung",
      lead: "Saya menyasarkan peranan pandu autonomi dan robot mudah alih mulai 2027. Hubungi saya tentang SLAM, simulasi, persepsi mesin — atau sekadar berbual tentang robot.",
      coinAria: "Balikkan foto untuk tukar antara profesional dan peribadi",
      altPro: "Aiman Hazim — profesional",
      altPersonal: "Aiman Hazim — peribadi",
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
      tagline: "Dibina sendiri dengan HTML, CSS & sedikit JavaScript.",
      backToTop: "Ke atas ↑",
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
      eyebrow: "Nota peribadi",
      title: "Penulisan",
      lead: "Esei peribadi, sekali-sekala.",
      empty: "Belum ada apa-apa.",
      home: "← Laman utama",
    },

    progressPage: {
      eyebrow: "Nota lapangan",
      title: "Log Pembinaan",
      lead: "Kemajuan harian dan mingguan tesis serta perjalanan sim→nyata saya. Terbaharu dahulu.",
      filterAll: "Semua",
      empty: "Belum ada catatan — kembali tidak lama lagi.",
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
