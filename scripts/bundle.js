const fs = require("fs");
const CleanCSS = require("clean-css");
const Terser = require("terser");
const htmlMinifier = require("html-minifier-terser");
const path = require("path");

const indexFile = "src/index.html";
const cssFile = "src/styles.css";
const jsFile = "src/script.js";

const distFolder = "dist";
const bundleFile = distFolder + "/index.html";
const versionFile = distFolder + "/version.json";
const dependencies = ["src/bookmarks", "src/manifest.json", "src/sw.js", "src/favicon.ico"];

(async () => {
  // Check if the directory exists and remove it
  if (fs.existsSync(distFolder)) {
    fs.rmSync(distFolder, { recursive: true, force: true });
  }

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

  for (const item of dependencies) {
    const srcPath = path.resolve(item); // Get absolute path
    const destPath = path.join(distFolder, path.basename(item));

    if (fs.existsSync(srcPath)) {
      if (fs.statSync(srcPath).isDirectory()) {
        copyDirectory(srcPath, destPath);
        console.log(`Copied directory: ${srcPath} -> ${destPath}`);
      } else {
        fs.copyFileSync(srcPath, destPath);
        console.log(`Copied file: ${srcPath} -> ${destPath}`);
      }
    } else {
      console.warn(`Warning: ${srcPath} does not exist.`);
    }
  }

  updateVersionInfoFile();

  console.log("Bundling completed.");
})();

function copyDirectory(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  fs.readdirSync(src).forEach((file) => {
    const srcFile = path.join(src, file);
    const destFile = path.join(dest, file);

    if (fs.statSync(srcFile).isDirectory()) {
      copyDirectory(srcFile, destFile);
    } else {
      fs.copyFileSync(srcFile, destFile);
    }
  });
}

function updateVersionInfoFile() {
  const latestVersion = {
    version: Date.now().toString(),
  };
  fs.writeFileSync(versionFile, JSON.stringify(latestVersion, null, 2));
}
