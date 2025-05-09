const CACHE_NAME = "dynamic-cache-v2";

// Define a regex pattern to match different environments
const folderPattern = /^\/(src|dist)?\/?(bookmarks\/)?/;

self.addEventListener("fetch", (event) => {
  const requestURL = new URL(event.request.url);

  // Check if the request path matches the pattern
  if (folderPattern.test(requestURL.pathname)) {
    event.respondWith(
      caches
        .match(event.request)
        .then((response) => {
          return (
            response ||
            fetch(event.request).then((fetchResponse) => {
              return caches.open(CACHE_NAME).then((cache) => {
                console.log("CACHED:", event.request.url);
                cache.put(event.request, fetchResponse.clone());
                return fetchResponse;
              });
            })
          );
        })
        .catch((error) => {
          console.error("Fetch failed:", event.request.url, error);
        })
    );
  }
});
