const CONFIG = {};
export default CONFIG;

CONFIG.faviconSize = 24;
CONFIG.faviconFetchServiceURL = (link) =>
  `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${link}&size=${CONFIG.faviconSize}`;
