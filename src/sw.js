self.addEventListener('fetch', event => {
  // Check if the request is for navigation (page loads)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response('<h1>No Internet Connection</h1><p>Please check your connection and try again.</p>', {
          headers: { 'Content-Type': 'text/html' }
        });
      })
    );
  }
});