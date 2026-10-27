/* Writing. Newest first.
   To add a piece, copy a { ... } block to the top of the list and edit it.
   date is "YYYY-MM-DD" and becomes the link anchor (writing.html#2026-06-10).
   body is a list of paragraphs: ["paragraph", "paragraph"]. A picture can go
   anywhere in that list: put the file in /assets/img/writing/ and add
   { img: "/assets/img/writing/example.jpg", w: 1600, h: 1067, alt: "What is in it", caption: "Optional" } */
window.AH_WRITING = [
  {
    date: "2026-10-27",
    title: "A test post with a picture",
    body: [
      "Testing how a post looks with a picture in the middle of it.",
      { img: "/assets/img/gallery/library-run.webp", w: 1280, h: 1440, alt: "Six moments from one simulated walk through a library. Each row shows the same view four ways: the camera image, two colour-coded label maps, and depth.", caption: "One run through a simulated library: the camera view, two kinds of labels, and depth." },
      "The words carry on below it, like this."
    ]
  },
  {
    date: "2026-06-10",
    title: "A place to write",
    body: ["Notes on coming to Japan, learning in a third language, and other things I want to write down."]
  }
];
