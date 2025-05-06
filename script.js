import CONFIG from "./bookmarks.config.js";
const bookmarkContainer = document.getElementById("bookmark-container");
const FAVICON_SIZE = CONFIG.faviconSize;
const FAVICON_FETCH_URL = (link) =>
  `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${link}&size=${FAVICON_SIZE}`;

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
    icon = img.setAttribute("src", FAVICON_FETCH_URL(link));
    img.setAttribute("alt", "bookmark-icon");
    const div = document.createElement("div");
    div.classList.add("bookmark-name");
    div.innerHTML = name;
    a.appendChild(img);
    a.appendChild(div);
    return a;
  }
}
