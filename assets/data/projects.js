/* Projects. Newest or most important first.
   To add one, copy a { ... } block, paste it where it should appear, and edit.
   links: [{ label: "...", href: "..." }]. year and tag are optional;
   tag: "research" marks research work with a small label.
   The page numbers them in this order: 01, 02, ... */
window.AH_PROJECTS = [
  {
    title: "Thermal navigation",
    tag: "research",
    line: "My graduation research: robot navigation with a thermal camera. Built and tested in Isaac Sim first, then moved to a real robot. The code and notes will be handed over to next year's students.",
    links: []
  },
  {
    title: "PyroScout",
    tag: "research",
    line: "A 2D robotics simulator I wrote from scratch. A robot with no map finds a victim by heat and drives there. 8/8 runs solved.",
    links: [
      { label: "Write-up", href: "/projects/pyroscout/" },
      { label: "Code", href: "https://github.com/a-haz/pyroscout" }
    ]
  },
  {
    title: "Thermal human following",
    line: "Following a person with 3D point clouds and thermal data, so tracking still works where cameras fail.",
    links: [
      { label: "GitHub", href: "https://github.com/a-haz" }
    ]
  },
  {
    title: "Transformer trackers",
    line: "Reading and reimplementing Vision Transformer and SPT trackers, from scratch.",
    links: [
      { label: "GitHub", href: "https://github.com/a-haz" }
    ]
  },
  {
    title: "Embedded C",
    line: "Register-level C: 7-segment displays, and control logic for a larger robot state machine.",
    links: [
      { label: "GitHub", href: "https://github.com/a-haz" }
    ]
  },
  {
    title: "Creative Experiment",
    line: "A team project. It won the Eiwa System Management Prize.",
    year: "2025",
    links: []
  }
];
