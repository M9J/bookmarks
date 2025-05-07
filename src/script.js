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
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAAAAACPAi4CAAABH0lEQVRYw2NgGAVUArGNZIBYJAPa/pMB2kYNGDVg1IBRA0YNGDVg1IARacCO6KQdFBjwcpI1C6v11JfkGvC4QoWFgYFFvfoxmQYkCTGBJJmE48ky4KoNM0ya2eoqyQbc7VNnRMgzak68S5oBZzNlGJHbgYwy6WdJMWCvpyB6U1LA8xDxBszUYsNsjLLpzCHWgFoJRmzNWUbxSqIMOBLPj6tFzBd7hLABi5zYcbep2Z3nEzDgZaUmE75WOaN62WN8BhyPEiPUsBeLPoXbgEOunIS7BhxO+3EY8HKDAXG9C811L7EZcLxYnNj+iVjBEUwD1vnzE9/D4fNeiW7AfFNOUvpIHEazUA3ok2QmrZfFLN6JbIAdC+kdNRa70c4qtQAA7m/LhSePmzgAAAAASUVORK5CYII=";
