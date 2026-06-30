import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const srcPagesDir = path.join(root, "src", "pages");
const srcStylesPath = path.join(root, "src", "styles", "global.css");
const publicDir = path.join(root, "public");
const skipDirs = new Set([
  ".astro",
  ".git",
  ".vercel",
  "dist",
  "node_modules",
  "public",
  "src",
]);
const publicSourceDirs = [
  "about",
  "admin",
  "assets",
  "blog",
  "katalog",
  "projects",
  "services",
  "testimonials",
];
const publicRootFiles = [
  "_redirects",
  "kediamanku-monogram.svg",
  "kediamanku-primary.svg",
  "kediamanku-white.svg",
  "robots.txt",
  "script.js",
  "styles.css",
  "supabase-config.js",
];

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.isDirectory() && skipDirs.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...await walk(fullPath));
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

function toPosix(value) {
  return value.split(path.sep).join("/");
}

function ensureRelativeImport(fromDir, toFile) {
  let value = toPosix(path.relative(fromDir, toFile));
  if (!value.startsWith(".")) value = `./${value}`;
  return value;
}

function splitUrl(value) {
  const match = String(value).match(/^([^?#]*)([?#].*)?$/);
  return {
    pathname: match?.[1] || "",
    suffix: match?.[2] || "",
  };
}

function isExternalOrSpecialUrl(value) {
  return /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(value);
}

function toPublicPath(value, routeDir) {
  if (!value || isExternalOrSpecialUrl(value) || value.startsWith("/")) return value;

  const { pathname, suffix } = splitUrl(value);
  if (!pathname || isExternalOrSpecialUrl(pathname)) return value;

  return `${path.posix.normalize(path.posix.join("/", routeDir, pathname))}${suffix}`;
}

function normalizeSrcset(value, routeDir) {
  return value
    .split(",")
    .map((candidate) => {
      const parts = candidate.trim().split(/\s+/);
      if (!parts[0]) return candidate;
      parts[0] = toPublicPath(parts[0], routeDir);
      return parts.join(" ");
    })
    .join(", ");
}

function normalizeResourceUrls(content, routeDir) {
  let normalized = content.replace(/<script\b(?![^>]*\bis:inline\b)(?=[^>]*\bsrc=)([^>]*)>/gi, "<script is:inline$1>");

  normalized = normalized.replace(/\s(src|imagesrcset|srcset)="([^"]+)"/gi, (match, attribute, value) => {
    const attr = attribute.toLowerCase();
    if (attr === "srcset" || attr === "imagesrcset") {
      return ` ${attribute}="${normalizeSrcset(value, routeDir)}"`;
    }

    return ` ${attribute}="${toPublicPath(value, routeDir)}"`;
  });

  normalized = normalized.replace(/<link\b[^>]*>/gi, (tag) => (
    tag.replace(/\shref="([^"]+)"/i, (match, value) => ` href="${toPublicPath(value, routeDir)}"`)
  ));

  return normalized;
}

async function writeAstroPage(htmlFile) {
  const relativeHtml = path.relative(root, htmlFile);
  const relativeTarget = relativeHtml.replace(/\.html$/i, ".astro");
  const targetPath = path.join(srcPagesDir, relativeTarget);
  const targetDir = path.dirname(targetPath);
  const routeDir = toPosix(path.dirname(relativeHtml)).replace(/^\.$/, "");
  const cssImport = ensureRelativeImport(targetDir, srcStylesPath);
  const html = await fs.readFile(htmlFile, "utf8");
  const astro = [
    "---",
    `import "${cssImport}";`,
    "---",
    normalizeResourceUrls(html, routeDir),
  ].join("\n");

  await fs.mkdir(targetDir, { recursive: true });
  await fs.writeFile(targetPath, astro);
  return toPosix(path.relative(root, targetPath));
}

async function copyFileToPublic(relativeFile) {
  const source = path.join(root, relativeFile);
  const target = path.join(publicDir, relativeFile);
  if (!await exists(source)) return null;

  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.copyFile(source, target);
  return toPosix(path.relative(root, target));
}

async function copyDirToPublic(relativeDir) {
  const sourceDir = path.join(root, relativeDir);
  if (!await exists(sourceDir)) return [];

  const copied = [];
  const files = await walk(sourceDir);
  for (const file of files) {
    if (/\.html$/i.test(file)) continue;
    const relativeFile = path.relative(root, file);
    const copiedPath = await copyFileToPublic(relativeFile);
    if (copiedPath) copied.push(copiedPath);
  }

  return copied;
}

const allFiles = await walk(root);
const htmlFiles = allFiles
  .filter((file) => /\.html$/i.test(file))
  .sort((a, b) => a.localeCompare(b));

const pages = [];
for (const htmlFile of htmlFiles) {
  pages.push(await writeAstroPage(htmlFile));
}

const publicFiles = [];
for (const file of publicRootFiles) {
  const copiedPath = await copyFileToPublic(file);
  if (copiedPath) publicFiles.push(copiedPath);
}

for (const dir of publicSourceDirs) {
  publicFiles.push(...await copyDirToPublic(dir));
}

console.log(`Created ${pages.length} Astro pages.`);
console.log(`Copied ${publicFiles.length} public assets.`);
