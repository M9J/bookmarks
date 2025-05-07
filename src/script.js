const bookmarkContainer = document.getElementById("bookmark-container");
const CONFIG = {};
CONFIG.faviconSize = 24;
CONFIG.faviconFetchService = (link) =>
  `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${link}&size=${CONFIG.faviconSize}`;

(async () => {
  await getBookmarks();
  getFavicons();
})();

async function getBookmarks() {
  const bookmarksFolder = "./bookmarks";
  try {
    const bookmarksFolderIndexModule = await fetch(bookmarksFolder + "/index.json");
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
    console.error("bookmarks folder or bookmarks/index.json not found");
  }
}

function asBookmarkTemplate(bookmark) {
  if (bookmark) {
    const link = bookmark.LINK || "javascript:void(0)";
    let name = bookmark.NAME || bookmark.LINK;
    if (bookmark.ICON_ONLY) name = null;
    const a = document.createElement("a");
    a.classList.add("bookmark");
    a.setAttribute("href", link);
    a.setAttribute("target", "_blank");
    a.setAttribute("rel", "noopener noreferrer");
    const img = document.createElement("img");
    img.classList.add("bookmark-icon");
    img.setAttribute("src", IMG_PLACEHOLDER);
    img.setAttribute("alt", "bookmark-icon");
    const div = document.createElement("div");
    div.classList.add("bookmark-name");
    div.innerHTML = name;
    a.appendChild(img);
    if (name) a.appendChild(div);
    return a;
  }
}

function getFavicons() {
  const alinks = document.getElementsByTagName("a");
  const hasAlinks = alinks ? alinks.length > 0 : false;
  if (hasAlinks) {
    for (let i = 0; i < alinks.length; i++) {
      const item = alinks.item(i);
      const href = item.getAttribute("href");
      if (href) {
        const itemIconImage = item.getElementsByTagName("img").item(0);
        if (itemIconImage) itemIconImage.setAttribute("src", CONFIG.faviconFetchService(href));
      }
    }
  }
}

const IMG_PLACEHOLDER =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAAAAACPAi4CAAACUUlEQVRYw63Xv4ryQBQF8En1EauUi1XAUrsp7ddi2jzBYmltF6t9BWGb+ACBNIKgbJt23iLgMwSE8xXrav6cO5klTqfi4ZeZyZ07CiOHkn6oijTR0zAIwqlO0qL6W4BNdWR2ub3WQH21+c5EOrXeAdky3pbdL8ttvMy8AvYzc+Tao5ntBwNO2pTyjJVGn5wBt02cuyc9jzc3OcDqdT20bPVaWymgmHz5rPzXpOABWfTtt3e+o4wFZG9soc//zmSbvGX9gCKiG2X1sWIbLSq6AXZC/ec55mf2FBPbDrhpPn+rAw4rOpP61grYrCEAwAlYb5oBp7iWABAIdXxqBOhcBkiEXD8D9gYyQCLA7B8Bs9IFAOYX+mbNfgMyN0AmZPeA5dENkAjH5U+AjQcAIiG2gALSLQcsGh84YZsCCtDlEEAilBpQqKJhgESIKigUfA3eD62PnGAKKKQ7D4BA2KVQSHIPAJAxQp5AQVsfACdYDYXp1QfACdcpFMLaC0AJdQiFwA/ACQEPoABKCPgjUAAj1CGdRAEALC5sEvvLKAAIwWq2kURAn5AnbCuLgD5hl5KXyQHoEUxBXmcHoEeIqn5BuSycR3uL8FNQOiXNCejUhXtJaxXVAUCbcC+qrbI+AGgRfst682AZBDQJj4OlcbQNAoDDe+9oex6uHoAnoXG4Po73T+UzPnvHu9hguBrOVoMhtTiO0W5xxCZLblc7TZbU5onNarfNExtNPkijKbW6/P+s1R3fbI9v98dfOMZfecZful5w7XvBxfMFV98XXL7/MP4DVIq68W2NOQAAAAAASUVORK5CYII=";
