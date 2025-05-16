const bookmarkContainer = document.getElementById("bookmark-container");
const settingsContainer = document.getElementById("settings-container");

const CONFIG = {};
CONFIG.faviconSize = 24;
CONFIG.faviconFetchServiceURL = (link) =>
  `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${link}&size=${CONFIG.faviconSize}`;

(async () => {
  await getBookmarks();
  getFavicons();
  checkVersion();
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
        insertBookmarkTemplateSlots(sortedBookmarkIndex);
        const bookmarkFileFetchPromises = sortedBookmarkIndex.map((bookmarkFileName) =>
          fetch(bookmarksFolder + "/" + bookmarkFileName + ".json")
            .then((res) => res.json())
            .then((res) => {
              res.bookmarkIndexName = bookmarkFileName;
              return res;
            })
        );
        const bookmarksConfigs = await Promise.all(bookmarkFileFetchPromises);
        const categorizedBookmarksConfigs = [
          ...bookmarksConfigs.filter((c) => c.ICON_ONLY),
          ...bookmarksConfigs.filter((c) => !c.ICON_ONLY),
        ];
        const bookmarkElements = document.querySelectorAll("a.bookmark");
        categorizedBookmarksConfigs.forEach((bookmarkConfig, index) => {
          updateBookmarkTemplate(bookmarkConfig, bookmarkElements.item(index));
        });
      }
    }
  } catch (err) {
    console.error("bookmarks folder or bookmarks/index.json not found. Error:", err);
  }
}

function insertBookmarkTemplateSlots(bookmarkIndex) {
  for (let i = 0; i < bookmarkIndex.length; i++) {
    const a = document.createElement("a");
    a.classList.add("bookmark");
    const img = document.createElement("img");
    img.classList.add("bookmark-icon");
    img.setAttribute("src", IMG_PLACEHOLDER);
    a.appendChild(img);
    bookmarkContainer.appendChild(a);
  }
}

function updateBookmarkTemplate(bookmark, bookmarkElem) {
  if (bookmark && bookmarkElem) {
    const link = bookmark.LINK || "javascript:void(0)";
    let name = bookmark.NAME || bookmark.LINK;
    const a = bookmarkElem;
    if (bookmark.ICON_ONLY) a.classList.add("icon-only");
    a.setAttribute("href", link);
    a.setAttribute("target", "_blank");
    a.setAttribute("rel", "noopener noreferrer");
    a.setAttribute("title", name);
    if (bookmark.ICON) a.setAttribute("data-bookmark-icon", bookmark.ICON);
    const img = a.querySelector("img.bookmark-icon");
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
  }
}

async function getFavicons() {
  const alinks = document.querySelectorAll("a.bookmark");
  const hasAlinks = alinks ? alinks.length > 0 : false;
  if (hasAlinks) {
    for (let i = 0; i < alinks.length; i++) {
      const item = alinks.item(i);
      const href = item.getAttribute("href");
      const bkIcon = item.getAttribute("data-bookmark-icon");
      const itemIconImage = item.getElementsByTagName("img").item(0);
      if (bkIcon) {
        if (itemIconImage) {
          itemIconImage.setAttribute("src", bkIcon);
          itemIconImage.onerror = function () {
            this.src = IMG_PLACEHOLDER;
          };
          continue;
        }
      }
      if (href) {
        const hrefURL = new URL(href);
        const baseHref = hrefURL.protocol + "//" + hrefURL.hostname;
        if (itemIconImage) {
          itemIconImage.setAttribute("src", CONFIG.faviconFetchServiceURL(baseHref));
          itemIconImage.onerror = function () {
            this.src = IMG_PLACEHOLDER;
          };
        }
      }
    }
  }
}

async function checkVersion() {
  if (typeof localStorage !== "undefined") {
    const currentVersionURL = "./version.json";
    const latestVersionURL = "https://m9j.github.io/bookmarks/version.json";
    let currentVersion = null;
    let latestVersion = null;
    try {
      const currentVersionResp = await fetch(currentVersionURL);
      if (!currentVersionResp.ok) {
        console.log(new Error("Failed to fetch current version"));
      } else {
        const currentVersionJSON = await currentVersionResp.json();
        currentVersion = currentVersionJSON.version;
      }

      const latestVersionResp = await fetch(latestVersionURL, { cache: "no-store" });
      if (!latestVersionResp.ok) {
        console.log(new Error("Failed to fetch latest version"));
      } else {
        const latestVersionJSON = await latestVersionResp.json();
        latestVersion = latestVersionJSON.version;
      }

      if (currentVersion || latestVersion) {
        const vdiv = document.createElement("div");
        vdiv.innerHTML = `Current version: ${unixEpochToVersion(
          currentVersion
        )} <br>Latest version: ${unixEpochToVersion(latestVersion)}`;
        settingsContainer.prepend(vdiv);
      }

      if (Number(latestVersion) && Number(currentVersion) !== Number(latestVersion)) {
        if (Number(latestVersion) > Number(currentVersion)) {
          console.warn(
            `Latest version (${unixEpochToVersion(
              latestVersion
            )}) is available. Hard reload to fetch latest copy.`
          );
          const ldiv = document.createElement("div");
          ldiv.classList.add("banner-info");
          ldiv.innerHTML = `Latest version (${unixEpochToVersion(
            latestVersion
          )}) is available. <br>Hard reload to fetch latest copy.`;
          settingsContainer.prepend(ldiv);
        } else {
          console.log(
            `Current version: ${unixEpochToVersion(
              currentVersion
            )}, Latest version: ${unixEpochToVersion(latestVersion)}`
          );
        }
      }
    } catch (err) {
      console.error("Version check failed: ", err);
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

function unixEpochToVersion(timestamp) {
  if (timestamp) {
    const dt = new Date(Number(timestamp));
    const yearNum = dt.getFullYear();
    const monthNum = String(dt.getMonth() + 1).padStart(2, "0");
    const dayNum = String(dt.getDate()).padStart(2, "0");
    const secs = dt.getHours() * 3600 + dt.getMinutes() * 60 + dt.getSeconds();
    const version = `${yearNum}.${monthNum}${dayNum}.${secs}`;
    return version;
  }
}
