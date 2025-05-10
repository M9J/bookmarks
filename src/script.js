const bookmarkContainer = document.getElementById("bookmark-container");
const settingsContainer = document.getElementById("settings-container");

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
        const bookmarkFileFetchPromises = sortedBookmarkIndex.map((bookmarkFileName) =>
          fetch(bookmarksFolder + "/" + bookmarkFileName + ".json").then((res) => res.json())
        );
        const bookmarksConfigs = await Promise.all(bookmarkFileFetchPromises);
        bookmarksConfigs.forEach((bookmarkConfig) => {
          bookmarkContainer.appendChild(asBookmarkTemplate(bookmarkConfig));
        });
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
    if (bookmark.ICON_ONLY) a.classList.add("icon-only");
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

function showSettings() {
  bookmarkContainer.classList.remove("show");
  bookmarkContainer.classList.add("hide");
  settingsContainer.classList.add("show");
}

function closeSettings() {
  settingsContainer.classList.remove("show");
  settingsContainer.classList.add("hide");
  bookmarkContainer.classList.add("show");
}

function unregisterServiceWorkers() {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => registration.unregister());
    console.log("All service workers have been unregistered.");
  });
}

function clearServiceWorkerCache() {
  caches
    .keys()
    .then((keys) => {
      return Promise.all(keys.map((key) => caches.delete(key)));
    })
    .then(() => {
      console.log("All caches have been cleared.");
    });
}

document.getElementById("show-settings-button").addEventListener("click", () => showSettings());
document.getElementById("close-settings-button").addEventListener("click", () => closeSettings());
document
  .getElementById("unregister-service-worker-button")
  .addEventListener("click", () => unregisterServiceWorkers());
document
  .getElementById("clear-service-worker-cache-button")
  .addEventListener("click", () => clearServiceWorkerCache());

const IMG_PLACEHOLDER =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAAAAACPAi4CAAABH0lEQVRYw2NgGAVUArGNZIBYJAPa/pMB2kYNGDVg1IBRA0YNGDVg1IARacCO6KQdFBjwcpI1C6v11JfkGvC4QoWFgYFFvfoxmQYkCTGBJJmE48ky4KoNM0ya2eoqyQbc7VNnRMgzak68S5oBZzNlGJHbgYwy6WdJMWCvpyB6U1LA8xDxBszUYsNsjLLpzCHWgFoJRmzNWUbxSqIMOBLPj6tFzBd7hLABi5zYcbep2Z3nEzDgZaUmE75WOaN62WN8BhyPEiPUsBeLPoXbgEOunIS7BhxO+3EY8HKDAXG9C811L7EZcLxYnNj+iVjBEUwD1vnzE9/D4fNeiW7AfFNOUvpIHEazUA3ok2QmrZfFLN6JbIAdC+kdNRa70c4qtQAA7m/LhSePmzgAAAAASUVORK5CYII=";
