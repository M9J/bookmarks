const bookmarkContainer = document.getElementById("bookmark-container");
const settingsContainer = document.getElementById("settings-container");

const CONFIG = {};
CONFIG.faviconSize = 24;
CONFIG.faviconFetchServiceURL = (link) =>
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
        const categorizedBookmarksConfigs = [
          ...bookmarksConfigs.filter((c) => c.ICON_ONLY),
          ...bookmarksConfigs.filter((c) => !c.ICON_ONLY),
        ];
        categorizedBookmarksConfigs.forEach((bookmarkConfig) => {
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
    const a = document.createElement("a");
    a.classList.add("bookmark");
    if (bookmark.ICON_ONLY) a.classList.add("icon-only");
    a.setAttribute("href", link);
    a.setAttribute("target", "_blank");
    a.setAttribute("rel", "noopener noreferrer");
    a.setAttribute("title", name);
    const img = document.createElement("img");
    img.classList.add("bookmark-icon");
    img.setAttribute("src", IMG_PLACEHOLDER);
    img.setAttribute("alt", "bookmark-icon");
    img.setAttribute("loading", "lazy");
    img.onerror = function () {
      this.src = IMG_PLACEHOLDER;
    };
    const div = document.createElement("div");
    div.classList.add("bookmark-name");
    div.innerHTML = name;
    a.appendChild(img);
    if (!bookmark.ICON_ONLY) a.appendChild(div);
    return a;
  }
}

function getFavicons() {
  const alinks = document.querySelectorAll("a.bookmark");
  const hasAlinks = alinks ? alinks.length > 0 : false;
  if (hasAlinks) {
    for (let i = 0; i < alinks.length; i++) {
      console.log("current img src", alinks.item(i).getAttribute("src"));
      const item = alinks.item(i);
      const href = item.getAttribute("href");
      if (href) {
        const itemIconImage = item.getElementsByTagName("img").item(0);
        const hrefURL = new URL(href);
        const baseHref = hrefURL.protocol + "//" + hrefURL.hostname;
        if (itemIconImage) {
          itemIconImage.setAttribute("src", CONFIG.faviconFetchServiceURL(baseHref));
        }
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
}

function showHome() {
  bookmarkContainer.classList.add("show");
  closeSettings();
}

function hardreloadApplication() {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => registration.unregister());
    console.log("All service workers have been unregistered.");
    caches
      .keys()
      .then((keys) => {
        return Promise.all(keys.map((key) => caches.delete(key)));
      })
      .then(() => {
        console.log("All caches have been cleared.");
        location.reload();
      });
  });
}

document.getElementById("view-list").addEventListener("change", (event) => {
  const { target } = event;
  const selection = target.value;
  if (selection === "settings") showSettings();
  else showHome();
});

document
  .getElementById("hard-reload-application-button")
  .addEventListener("click", () => hardreloadApplication());

const IMG_PLACEHOLDER =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAAAAACPAi4CAAABH0lEQVRYw2NgGAVUArGNZIBYJAPa/pMB2kYNGDVg1IBRA0YNGDVg1IARacCO6KQdFBjwcpI1C6v11JfkGvC4QoWFgYFFvfoxmQYkCTGBJJmE48ky4KoNM0ya2eoqyQbc7VNnRMgzak68S5oBZzNlGJHbgYwy6WdJMWCvpyB6U1LA8xDxBszUYsNsjLLpzCHWgFoJRmzNWUbxSqIMOBLPj6tFzBd7hLABi5zYcbep2Z3nEzDgZaUmE75WOaN62WN8BhyPEiPUsBeLPoXbgEOunIS7BhxO+3EY8HKDAXG9C811L7EZcLxYnNj+iVjBEUwD1vnzE9/D4fNeiW7AfFNOUvpIHEazUA3ok2QmrZfFLN6JbIAdC+kdNRa70c4qtQAA7m/LhSePmzgAAAAASUVORK5CYII=";
