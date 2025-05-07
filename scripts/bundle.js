const fs = require("fs");
const CleanCSS = require("clean-css");
const Terser = require("terser");
const htmlMinifier = require("html-minifier-terser");
const path = require("path");

(async () => {
  const indexFile = "src/index.html";
  const cssFile = "src/styles.css";
  const jsFile = "src/script.js";

  const distFolder = "dist";
  const bundleFile = distFolder + "/index.html";
  const dependencyFiles = ["src/bookmark-icon-placeholder.png", "src/bookmarks.config.js"];

  // Ensure the destination folder exists
  if (!fs.existsSync(distFolder)) {
    fs.mkdirSync(distFolder, { recursive: true });
  }

  let html = fs.readFileSync(indexFile, "utf8");
  let css = fs.readFileSync(cssFile, "utf8");
  let js = fs.readFileSync(jsFile, "utf8");

  // Minify CSS
  let minifiedCSS = new CleanCSS().minify(css).styles;

  const minifiedJSResult = await Terser.minify(js, {
    module: true,
    mangle: { toplevel: true },
  });

  if (minifiedJSResult.error) {
    console.error("Terser minification error:", minifiedJSResult.error);
  }

  let minifiedJS = minifiedJSResult.code || "";

  // Inject CSS & JS properly in one step
  html = html.replace(
    "</head>",
    `\t<style>${minifiedCSS}</style>\n\t<script type="module">${minifiedJS}</script>\n\t</head>`
  );

  // Remove only specific imports
  const cssRegex = new RegExp(`<link[^>]+href=["']${path.basename(cssFile)}["'][^>]*>`, "g");
  const jsRegex = new RegExp(
    `<script[^>]+src=["']${path.basename(jsFile)}["'][^>]*><\/script>`,
    "g"
  );

  html = html.replace(cssRegex, "").replace(jsRegex, "");

  // Minify final HTML
  html = await htmlMinifier.minify(html, {
    collapseWhitespace: true,
    removeComments: true,
    removeAttributeQuotes: true,
    minifyJS: true,
    minifyCSS: true,
  });

  // Save final bundled HTML
  fs.writeFileSync(bundleFile, html);

  console.log(`Bundle HTML generated: ${path.basename(bundleFile)}`);

  // Copy dependency files
  dependencyFiles.forEach((file) => {
    const destination = path.join(distFolder, path.basename(file));
    fs.copyFileSync(file, destination);
    console.log(`Copied: ${file} -> ${destination}`);
  });

  console.log("Bundling completed.");
})();
