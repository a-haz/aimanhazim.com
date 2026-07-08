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
      // One short line under the name. (One entry = static; several rotate.)
      roles: [
        "SLAM & autonomous navigation",
      ],
      intro:
        "I'm a fourth-year robotics student in Fukui University's Intelligent Robot Research Laboratory. My thesis is autonomous navigation that fuses a thermal camera with 3D LiDAR. It all runs in simulation for now; the plan is to move it onto a real robot.",
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
        { label: "Active SLAM",      detail: "TIR + LiDAR, frontier exploration" },
        { label: "Human-behavior AI", detail: "crowd agents that walk like people" },
      ],
    },

    about: {
      heading: "About",
      lead: "I want to build robots that can find their own way around.",
      paragraphs: [
        "The part of robotics I care about most is autonomous navigation: how a robot senses its surroundings and decides where to go without a person steering it. Most of my study and project time goes into that one problem.",
        "I'm in my fourth year at Fukui University, in the Intelligent Robot Research Laboratory. My thesis fuses a thermal camera with 3D LiDAR for SLAM. The work is all in simulation at the moment, and the theory underneath it (control, probability, linear algebra) takes up as much of my week as the code does.",
        "I moved to Japan for university and started from zero: new language, no contacts. Getting settled took patience, and that patience carries over into research. I'd rather spend a week on fundamentals than build something I can't explain.",
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
        "The thesis has two parts. First, a large indoor simulation environment with human agents that walk around like real people. Second, an active SLAM system tested inside it, fusing a thermal (TIR) camera with 3D LiDAR so navigation keeps working in the dark, in crowds, and behind occlusions.",
      baseLabel: "Building on",
      base:
        "HO3-SLAM / Walk2Map++. I'm extending it from passive RGB vision to active perception, where the robot chooses where to look.",
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
          desc: "A 20×20 m indoor environment in Isaac Sim, with human agents that each have their own appearance, walking style, and a perceive–plan–act loop. The robot drives around it while logging TIR and LiDAR sequences." },
        { tag: "Phase 2", title: "Active multimodal SLAM",
          desc: "TIR + LiDAR SLAM with active control (collision avoidance, human following, frontier exploration), evaluated across 100+ environment conditions for accuracy, map usefulness, and compute time." },
        { tag: "Phase 3", title: "Beat the baseline",
          desc: "Implement the proposed method and show it outperforms existing approaches in wide, crowded, dark, and occluded conditions." },
        { tag: "Phase 4", title: "Hand it over",
          desc: "Document the environment, agent code, and analysis scripts so next year's students can continue without me." },
      ],
      sim2realLabel: "Sim → Real",
      sim2real:
        "Everything above runs in simulation first. Whatever survives the Isaac Sim experiments gets transferred to a real Mega Rover afterwards.",
    },

    now: {
      heading: "What I'm doing right now",
      lead: "Hardware is expensive and lab time is limited, so I'm getting everything I can out of simulation before touching a real robot. Roughly in order:",
      roadmap: [
        { date: "2026 · now",  title: "Learn Isaac Sim properly",
          desc: "Environments, sensors, human agents. C++ practice runs alongside, since Python alone won't cut it for real-time perception.", state: "active" },
        { date: "2026 · H2",   title: "Thesis experiments",
          desc: "Run the active-SLAM evaluation across 100+ simulated conditions and write it up.", state: "next" },
        { date: "2027",        title: "Onto real hardware",
          desc: "Transfer the sim work onto a Mega Rover, and start a hardware build of my own.", state: "future" },
        { date: "Mar 2027",    title: "Graduate",
          desc: "Finish at Fukui University and start work in autonomous driving or mobile robotics.", state: "future" },
      ],
    },

    skills: {
      heading: "Toolbox",
      lead: "What I actually use, and for how long.",
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
          desc: "A 2D robotics simulator written from scratch. A mobile robot with no map fuses 2D LiDAR for mapping with a thermal sensor to locate a victim, then explores, plans with A*, and drives itself there. 8/8 runs solved, zero wall collisions. The write-up is a narrated notebook you can run yourself.",
          tags: ["Python", "LiDAR", "Thermal", "A*", "Sensor fusion"],
          links: [{ href: "/projects/pyroscout/", label: "Read the write-up" },
                  { href: "https://github.com/a-haz/pyroscout", label: "GitHub" }] },
        { title: "Thermal × 3D LiDAR human following",
          desc: "Human-following logic that fuses 3D LiDAR point clouds with thermal data, so tracking keeps working where plain cameras fail. This project is what led to my thesis topic.",
          tags: ["Python", "LiDAR", "Thermal", "SLAM"],
          link: "https://github.com/a-haz", linkLabel: "GitHub" },
        { title: "Transformer trackers (ViT / SPT)",
          desc: "Reading and reimplementing Vision Transformer and SPT-style trackers for place recognition and object tracking. Building them from scratch is slow, but it's how I make sure I actually understand them.",
          tags: ["Python", "Deep learning", "ViT"],
          link: "https://github.com/a-haz", linkLabel: "GitHub" },
        { title: "Embedded C & hardware logic",
          desc: "Register-level C: driving 7-segment displays and writing control logic that feeds into a larger robot state machine.",
          tags: ["C", "Embedded"],
          link: "https://github.com/a-haz", linkLabel: "GitHub" },
        { title: "Robot Engineering Creative Experiment",
          desc: "Our team's creative-experiment project won the Eiwa System Management Prize.",
          tags: ["Award · 2023", "Teamwork"],
          link: "", linkLabel: "" },
      ],
    },

    contact: {
      heading: "Get in touch",
      lead: "I'm looking for autonomous-driving and mobile-robotics roles starting 2027. Questions about SLAM, simulation, or anything on this site are welcome too.",
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
        send: "Send",
      },
    },

    footer: {
      tagline: "Plain HTML, CSS and a bit of JavaScript. No framework, no build step.",
      backToTop: "Back to top ↑",
    },

    /* ---------------- the Personal side ---------------- */
    personal: {
      intro:
        "This side of the site is for everything that isn't work. Moving to Japan and starting from zero shaped me more than any course did; some of the writing here is about that.",
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
      lead: "Notes on the thesis as it happens. Newest first.",
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
        "SLAM・自律ナビゲーション",
      ],
      intro:
        "福井大学 知能ロボット研究室の学部4年です。卒業研究では、熱画像カメラと3D LiDARを組み合わせた自律走行に取り組んでいます。いまはすべてシミュレーション上で開発していて、ゆくゆくは実機に載せる予定です。",
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
        { label: "アクティブSLAM",    detail: "TIR + LiDAR・フロンティア探索" },
        { label: "人間行動AI",        detail: "人らしく歩く群衆エージェント" },
      ],
    },

    about: {
      heading: "自己紹介",
      lead: "自分で道を見つけて動くロボットをつくりたい。",
      paragraphs: [
        "ロボティクスの中でいちばん興味があるのは自律ナビゲーションです。ロボットが周囲をどう認識し、人が操縦しなくても進む先をどう決めるか。勉強も制作も、ほとんどの時間をこの問題に使っています。",
        "福井大学の学部4年で、知能ロボット研究室に所属しています。卒論のテーマは熱画像カメラと3D LiDARを組み合わせたSLAM。開発はいまのところすべてシミュレーション上で、コードと同じくらい、土台になる理論（制御・確率・線形代数）にも時間を割いています。",
        "大学進学のために来日して、言葉も生活もゼロから始めました。落ち着くまでには忍耐が要りましたが、その忍耐は研究にもそのまま生きています。説明できないものを作るより、基礎に1週間かけるほうを選びます。",
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
        "卒論は二本立てです。ひとつは、人間らしく歩き回るエージェントを配置した大規模な屋内シミュレーション環境。もうひとつは、その中で検証するアクティブSLAMで、熱画像（TIR）カメラと3D LiDARを融合し、暗所・混雑・遮蔽の中でもナビゲーションが破綻しないことを目指します。",
      baseLabel: "ベース研究",
      base:
        "HO3-SLAM / Walk2Map++。受動的なRGB視覚から、ロボット自身が観測先を選ぶ能動的知覚へ発展させます。",
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
          desc: "Isaac Sim上に20×20mの屋内環境を作ります。外見や歩き方、知覚→計画→行動のループをそれぞれ持つ人間エージェントを配置し、ロボットが走行しながらTIR/LiDARの系列データを記録します。" },
        { tag: "フェーズ2", title: "アクティブ・マルチモーダルSLAM",
          desc: "衝突回避・人追従・フロンティア探索などの能動制御を組み込んだTIR + LiDAR SLAMを実装し、100以上の環境条件で精度・地図の有用性・計算時間を評価します。" },
        { tag: "フェーズ3", title: "既存手法を上回る",
          desc: "提案手法を実装し、広い・混んでいる・暗い・遮蔽が多いという厳しい条件で、既存手法より高い性能を示します。" },
        { tag: "フェーズ4", title: "引き継ぎ",
          desc: "環境・エージェント・解析コードを文書化して、来年度の学生がそのまま続けられる状態で渡します。" },
      ],
      sim2realLabel: "Sim → Real",
      sim2real:
        "まずはすべてシミュレーションで動かします。Isaac Simの実験で確かめられた手法を、その後に実機のメガローバーへ移します。",
    },

    now: {
      heading: "いま取り組んでいること",
      lead: "ハードウェアは高価で、研究室で使える時間も限られています。だから実機に触る前に、シミュレーションから学べることを学びきります。順番はだいたい次のとおりです。",
      roadmap: [
        { date: "2026 · 現在", title: "Isaac Simを身につける",
          desc: "環境・センサ・人間エージェント。リアルタイム認識はPythonだけでは足りないので、並行してC++の練習も続けます。", state: "active" },
        { date: "2026 · 後半", title: "卒論の実験",
          desc: "100以上のシミュレーション条件でアクティブSLAMを評価し、論文にまとめます。", state: "next" },
        { date: "2027",       title: "実機へ",
          desc: "シミュレーションの成果をメガローバーに移し、自作ハードウェアにも手を付けます。", state: "future" },
        { date: "2027年3月",  title: "卒業",
          desc: "福井大学を卒業し、自動運転か移動ロボットの仕事に就きます。", state: "future" },
      ],
    },

    skills: {
      heading: "ツールボックス",
      lead: "実際に使っているものと、その期間。",
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
          desc: "ゼロから作った2Dロボットシミュレータ。地図を持たない移動ロボットが2D LiDAR（地図生成）と熱センサ（要救助者の発見）を組み合わせ、フロンティア探査・A*経路計画・自律走行を行います。8回中8回成功、壁との衝突ゼロ。解説付きで実行できるノートブックを同梱しています。",
          tags: ["Python", "LiDAR", "熱画像", "A*", "センサ融合"],
          links: [{ href: "/projects/pyroscout/", label: "解説を読む" },
                  { href: "https://github.com/a-haz/pyroscout", label: "GitHub" }] },
        { title: "熱画像 × 3D LiDAR 人追従",
          desc: "3D LiDARの点群と熱画像を融合し、普通のカメラでは追えなくなる場面でも追跡を続ける人追従ロジック。このプロジェクトが卒論テーマにつながりました。",
          tags: ["Python", "LiDAR", "熱画像", "SLAM"],
          link: "https://github.com/a-haz", linkLabel: "GitHub" },
        { title: "Transformerトラッカー（ViT / SPT）",
          desc: "場所認識・物体追跡に使われるVision Transformer系・SPT系のトラッカーを勉強しています。時間はかかりますが、自分で実装するのがいちばん理解が深まります。",
          tags: ["Python", "深層学習", "ViT"],
          link: "https://github.com/a-haz", linkLabel: "GitHub" },
        { title: "組込みCとハードウェア制御",
          desc: "レジスタを直接触るCの練習。7セグLEDの制御など、より大きなロボットの状態機械につながる下位レイヤのロジックです。",
          tags: ["C", "組込み"],
          link: "https://github.com/a-haz", linkLabel: "GitHub" },
        { title: "ロボット工学創造実験",
          desc: "チームの創造実験プロジェクトで永和システムマネジメント賞を受賞しました。",
          tags: ["受賞 · 2023", "チーム"],
          link: "", linkLabel: "" },
      ],
    },

    contact: {
      heading: "連絡先",
      lead: "2027年から、自動運転や移動ロボットの分野で働くことを目指しています。SLAMやシミュレーションの話でも、このサイトについてでも、気軽にどうぞ。",
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
      tagline: "HTMLとCSSと少しのJavaScriptだけで作っています。フレームワークなし、ビルドなし。",
      backToTop: "上へ戻る ↑",
    },

    personal: {
      intro:
        "ここは仕事以外のことを置く場所です。来日してゼロから生活を立ち上げた経験は、どんな授業よりも自分を形づくりました。書きものの一部はその話です。",
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
      lead: "卒論の進み具合を、そのまま記録しています。新しい順です。",
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
        "SLAM & navigasi autonomi",
      ],
      intro:
        "Saya pelajar robotik tahun empat di Makmal Penyelidikan Robot Pintar, Universiti Fukui. Tesis saya ialah navigasi autonomi yang menggabungkan kamera terma dengan LiDAR 3D. Buat masa ini semuanya berjalan dalam simulasi; rancangannya nanti dipindahkan ke robot sebenar.",
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
        { label: "SLAM Aktif",       detail: "TIR + LiDAR, penerokaan frontier" },
        { label: "AI tingkah laku manusia", detail: "ejen orang ramai yang berjalan realistik" },
      ],
    },

    about: {
      heading: "Tentang",
      lead: "Saya mahu membina robot yang boleh mencari jalannya sendiri.",
      paragraphs: [
        "Bahagian robotik yang paling saya minati ialah navigasi autonomi: bagaimana robot mengesan sekelilingnya dan memutuskan arah tanpa dikawal manusia. Kebanyakan masa belajar dan masa projek saya habis pada masalah yang satu ini.",
        "Saya kini di tahun empat di Universiti Fukui, dalam Makmal Penyelidikan Robot Pintar. Tesis saya menggabungkan kamera terma dengan LiDAR 3D untuk SLAM. Setakat ini semuanya dalam simulasi, dan teori di belakangnya (kawalan, kebarangkalian, algebra linear) mengambil masa mingguan saya sama banyak dengan kod.",
        "Saya berpindah ke Jepun untuk belajar dan bermula dari kosong: bahasa baru, tiada kenalan. Untuk menetap perlukan kesabaran, dan kesabaran itu terbawa ke penyelidikan. Saya lebih rela habiskan seminggu pada asas daripada membina sesuatu yang saya sendiri tak dapat terangkan.",
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
        "Tesis ini ada dua bahagian. Pertama, persekitaran simulasi dalaman yang besar dengan ejen manusia yang berjalan seperti orang sebenar. Kedua, sistem SLAM aktif yang diuji di dalamnya, menggabungkan kamera terma (TIR) dengan LiDAR 3D supaya navigasi terus berfungsi dalam gelap, dalam kesesakan, dan di sebalik halangan.",
      baseLabel: "Berasaskan",
      base:
        "HO3-SLAM / Walk2Map++. Saya memanjangkannya daripada penglihatan RGB pasif kepada persepsi aktif, di mana robot memilih ke mana hendak melihat.",
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
          desc: "Persekitaran dalaman 20×20 m dalam Isaac Sim, dengan ejen manusia yang masing-masing ada rupa, gaya berjalan, dan gelung tanggap–rancang–tindak sendiri. Robot bergerak di dalamnya sambil merekod jujukan TIR dan LiDAR." },
        { tag: "Fasa 2", title: "SLAM multimodal aktif",
          desc: "SLAM TIR + LiDAR dengan kawalan aktif (mengelak perlanggaran, mengikut manusia, penerokaan frontier), dinilai merentas 100+ keadaan persekitaran dari segi ketepatan, kegunaan peta, dan masa pengiraan." },
        { tag: "Fasa 3", title: "Atasi garis dasar",
          desc: "Laksanakan kaedah yang dicadangkan dan tunjukkan ia mengatasi pendekatan sedia ada dalam keadaan luas, sesak, gelap, dan terhalang." },
        { tag: "Fasa 4", title: "Serah tugas",
          desc: "Dokumenkan persekitaran, kod ejen, dan skrip analisis supaya pelajar tahun depan boleh menyambung tanpa saya." },
      ],
      sim2realLabel: "Sim → Nyata",
      sim2real:
        "Semuanya berjalan dalam simulasi dahulu. Apa yang terbukti dalam eksperimen Isaac Sim akan dipindahkan ke Mega Rover sebenar selepas itu.",
    },

    now: {
      heading: "Apa yang saya buat sekarang",
      lead: "Perkakasan mahal dan masa makmal terhad, jadi saya ambil dahulu segala yang boleh daripada simulasi sebelum menyentuh robot sebenar. Lebih kurang ikut urutan:",
      roadmap: [
        { date: "2026 · kini", title: "Belajar Isaac Sim betul-betul",
          desc: "Persekitaran, sensor, ejen manusia. Latihan C++ berjalan serentak, sebab Python sahaja tak cukup untuk persepsi masa nyata.", state: "active" },
        { date: "2026 · S2",   title: "Eksperimen tesis",
          desc: "Jalankan penilaian SLAM aktif merentas 100+ keadaan simulasi dan tuliskannya.", state: "next" },
        { date: "2027",        title: "Ke perkakasan sebenar",
          desc: "Pindahkan hasil simulasi ke Mega Rover, dan mulakan binaan perkakasan sendiri.", state: "future" },
        { date: "Mac 2027",    title: "Bergraduat",
          desc: "Tamat di Universiti Fukui dan mula bekerja dalam pandu autonomi atau robot mudah alih.", state: "future" },
      ],
    },

    skills: {
      heading: "Kotak alat",
      lead: "Apa yang saya betul-betul guna, dan berapa lama.",
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
          desc: "Simulator robotik 2D yang ditulis dari awal. Robot mudah alih tanpa peta menggabungkan LiDAR 2D untuk pemetaan dengan sensor terma untuk mencari mangsa, kemudian meneroka, merancang dengan A*, dan bergerak sendiri ke sana. 8/8 larian berjaya, sifar perlanggaran dinding. Tulisannya berupa buku nota bernarasi yang boleh anda jalankan sendiri.",
          tags: ["Python", "LiDAR", "Terma", "A*", "Gabungan sensor"],
          links: [{ href: "/projects/pyroscout/", label: "Baca tulisan" },
                  { href: "https://github.com/a-haz/pyroscout", label: "GitHub" }] },
        { title: "Pengikutan manusia Terma × LiDAR 3D",
          desc: "Logik mengikut manusia yang menggabungkan awan titik LiDAR 3D dengan data terma, supaya penjejakan terus berfungsi di tempat kamera biasa gagal. Projek inilah yang membawa kepada tema tesis saya.",
          tags: ["Python", "LiDAR", "Terma", "SLAM"],
          link: "https://github.com/a-haz", linkLabel: "GitHub" },
        { title: "Penjejak Transformer (ViT / SPT)",
          desc: "Membaca dan melaksanakan semula penjejak gaya Vision Transformer dan SPT untuk pengecaman tempat dan penjejakan objek. Membinanya dari awal memang lambat, tapi itulah cara saya pastikan saya benar-benar faham.",
          tags: ["Python", "Pembelajaran dalam", "ViT"],
          link: "https://github.com/a-haz", linkLabel: "GitHub" },
        { title: "C terbenam & logik perkakasan",
          desc: "C peringkat daftar: memacu paparan 7-segmen dan menulis logik kawalan yang menyambung ke mesin keadaan robot yang lebih besar.",
          tags: ["C", "Terbenam"],
          link: "https://github.com/a-haz", linkLabel: "GitHub" },
        { title: "Eksperimen Kreatif Kejuruteraan Robot",
          desc: "Projek eksperimen kreatif pasukan kami memenangi Hadiah Eiwa System Management.",
          tags: ["Anugerah · 2023", "Berpasukan"],
          link: "", linkLabel: "" },
      ],
    },

    contact: {
      heading: "Hubungi saya",
      lead: "Saya mencari peluang dalam pandu autonomi dan robot mudah alih mulai 2027. Soalan tentang SLAM, simulasi, atau apa-apa di laman ini pun dialu-alukan.",
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
      tagline: "HTML, CSS dan sedikit JavaScript sahaja. Tiada rangka kerja, tiada langkah binaan.",
      backToTop: "Ke atas ↑",
    },

    personal: {
      intro:
        "Sisi ini untuk semua yang bukan kerja. Berpindah ke Jepun dan bermula dari kosong membentuk saya lebih daripada mana-mana kelas; sebahagian tulisan di sini adalah tentang itu.",
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
      lead: "Catatan tesis sepanjang ia berjalan. Terbaharu dahulu.",
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
