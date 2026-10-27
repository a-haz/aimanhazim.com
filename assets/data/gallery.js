/* Gallery. Newest first. While the list is empty the page says "More soon."
   Put files in /assets/img/gallery/ (images) or /assets/video/ (videos),
   then add a block like one of these:

   {
     type: "image",
     src: "/assets/img/gallery/example.jpg",
     w: 1600, h: 1067,                  // the size, so the layout does not jump
     alt: "What is in the photo",
     caption: "Place, month",           // optional
     date: "2026-01"                    // optional
   },
   {
     type: "video",
     src: "/assets/video/example.mp4",  // self-hosted mp4 (H.264) or webm
     webm: "/assets/video/example.webm",// optional second source
     poster: "/assets/img/gallery/example-poster.jpg", // shown until played
     w: 1920, h: 1080,
     alt: "What happens in the clip",
     loop: true,                        // optional
     caption: "Place, month",           // optional
     date: "2026-01"                    // optional
   },
   {
     type: "text",
     text: ["A line or two, on its own.", "A second paragraph if you need one."],
     caption: "Place, month",           // optional
     date: "2026-01"                    // optional
   }, */
window.AH_GALLERY = [];
