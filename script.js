import CONFIG from "./bookmarks.config.js";
const bookmarkContainer = document.getElementById("bookmark-container");

console.log("CONFIG", CONFIG);
if (CONFIG) {
  const bookmarks = CONFIG.bookmarks;
  const hasBookmarks = Array.isArray(bookmarks) ? bookmarks.length > 0 : false;
  if (hasBookmarks) {
    for (let bookmark of bookmarks) {
      bookmarkContainer.appendChild(asBookmarkTemplate(bookmark));
    }
  }
}

function asBookmarkTemplate(bookmark) {
  if (bookmark) {
    const link = bookmark.link || "javascript:void(0)";
    let icon = bookmark.icon || "./bookmark-icon-placeholder.png";
    const name = bookmark.name || bookmark.link;
    const a = document.createElement("a");
    a.classList.add("bookmark");
    a.setAttribute("href", link);
    const img = document.createElement("img");
    img.classList.add("bookmark-icon");
    const SIZE = "24";
    icon = `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${link}&size=${SIZE}`;
    img.setAttribute("src", icon);
    img.setAttribute("alt", "bookmark-icon");
    const div = document.createElement("div");
    div.classList.add("bookmark-name");
    div.innerHTML = name;
    a.appendChild(img);
    a.appendChild(div);
    return a;
  }
}
