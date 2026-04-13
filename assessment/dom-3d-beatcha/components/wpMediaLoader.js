export function wpMediaLoader() {
  const API =
    "https://beatcha0926.live-website.com/wp-json/wp/v2/posts?_embed&per_page=100";

  const grid = document.getElementById("grid");

  fetch(API)
    .then((r) => {
      return r.json();
    })
    .then((posts) => {
      const cols = Array.from({ length: 6 }, () => {
        const col = document.createElement("div");
        col.className = "Projects";
        return col;
      });

      posts.forEach((post, i) => {
        const media = post._embedded?.["wp:featuredmedia"]?.[0];
        if (!media) return;

        const src = media.source_url;
        const mime = media.mime_type || "";
        let el;

        if (mime.startsWith("video/")) {
          el = document.createElement("video");
          el.src = src;
          el.autoplay = true;
          el.loop = true;
          el.muted = true;
          el.playsInline = true;
          const poster = media.media_details?.sizes?.medium?.source_url;
          if (poster) el.poster = poster;
        } else {
          el = document.createElement("img");
          el.src = src;
          el.alt = media.alt_text || "";
        }

        el.className = "projectImg";
        cols[i % 6].appendChild(el);
      });

      cols.forEach((col) => grid.appendChild(col));
    });
}
