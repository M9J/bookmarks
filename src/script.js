const bookmarkContainer = document.getElementById("bookmark-container");
const CONFIG = {};
CONFIG.faviconSize = 24;
CONFIG.faviconFetchService = (link) =>
  `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${link}&size=${CONFIG.faviconSize}`;

getBookmarks();

async function getBookmarks() {
  const bookmarksFolder = "./bookmarks";
  try {
    const bookmarksFolderIndexModule = await fetch(bookmarksFolder + "/_.json");
    if (bookmarksFolderIndexModule) {
      const bookmarkIndex = await bookmarksFolderIndexModule.json();
      const hasBookmarkIndex = Array.isArray(bookmarkIndex) ? bookmarkIndex.length > 0 : false;
      if (hasBookmarkIndex) {
        const sortedBookmarkIndex = bookmarkIndex.sort();
        for (const bookmarkFile of sortedBookmarkIndex) {
          const bookmarkConfig = await fetch(bookmarksFolder + "/" + bookmarkFile + ".json");
          if (bookmarkConfig) {
            const config = await bookmarkConfig.json();
            bookmarkContainer.appendChild(asBookmarkTemplate(config));
          }
        }
      }
    }
  } catch (err) {
    console.error("bookmarks folder or bookmarks/_.json not found");
  }
}

function asBookmarkTemplate(bookmark) {
  if (bookmark) {
    const link = bookmark.LINK || "javascript:void(0)";
    let icon = bookmark.ICON;
    if (!icon && link !== "javascript:void(0)") icon = CONFIG.faviconFetchService(link);
    if (!icon) icon = "./bookmark-icon-placeholder.png";
    const name = bookmark.NAME || bookmark.LINK;
    const a = document.createElement("a");
    a.classList.add("bookmark");
    a.setAttribute("href", link);
    a.setAttribute("target", "_blank");
    a.setAttribute("rel", "noopener noreferrer");
    const img = document.createElement("img");
    img.classList.add("bookmark-icon");
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
