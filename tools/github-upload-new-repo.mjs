import { promises as fs } from "node:fs";
import path from "node:path";

const [, , workspaceArg, repoNameArg = "Kediamanku-Astro"] = process.argv;
const workspace = path.resolve(workspaceArg || process.cwd());
const token = process.env.GITHUB_TOKEN;
const repoName = repoNameArg.replace(/\s+/g, "-");
const branch = "main";

if (!token) {
  throw new Error("GITHUB_TOKEN is required.");
}

const ignoredDirectories = new Set([
  ".astro",
  ".git",
  ".vercel",
  "dist",
  "node_modules",
]);

const ignoredFiles = new Set([
  "astro-dev.err.log",
  "astro-dev.log",
  "astro-dev.out.log",
  "tools/github-upload-new-repo.mjs",
]);

function shouldIgnore(relativePath, name, isDirectory) {
  const normalized = relativePath.replaceAll("\\", "/");

  if (isDirectory && ignoredDirectories.has(name)) return true;
  if (ignoredFiles.has(normalized) || ignoredFiles.has(name)) return true;
  if (name === ".env" || name.startsWith(".env.")) return true;
  if (name.endsWith(".log")) return true;
  if (name.startsWith("codex-clipboard-")) return true;
  if (name.startsWith(".codex-")) return true;

  return false;
}

async function collectFiles(directory, root = directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);
    const relativePath = path.relative(root, absolutePath).replaceAll("\\", "/");

    if (shouldIgnore(relativePath, entry.name, entry.isDirectory())) {
      continue;
    }

    if (entry.isDirectory()) {
      files.push(...await collectFiles(absolutePath, root));
    } else if (entry.isFile()) {
      files.push({
        absolutePath,
        relativePath,
      });
    }
  }

  return files;
}

async function github(pathname, options = {}) {
  const response = await fetch(`https://api.github.com${pathname}`, {
    ...options,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...options.headers,
    },
  });

  const text = await response.text();
  const body = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = body?.message || response.statusText;
    const error = new Error(`${options.method || "GET"} ${pathname} failed: ${response.status} ${message}`);
    error.status = response.status;
    error.body = body;
    throw error;
  }

  return body;
}

async function createOrGetRepo(owner) {
  try {
    return await github(`/repos/${owner}/${repoName}`);
  } catch (error) {
    if (error.status !== 404) throw error;
  }

  return github("/user/repos", {
    method: "POST",
    body: JSON.stringify({
      name: repoName,
      description: "Kediamanku Astro website",
      private: false,
      auto_init: false,
    }),
  });
}

async function getHead(owner) {
  try {
    const ref = await github(`/repos/${owner}/${repoName}/git/ref/heads/${branch}`);
    const commit = await github(`/repos/${owner}/${repoName}/git/commits/${ref.object.sha}`);
    return {
      commitSha: ref.object.sha,
      treeSha: commit.tree.sha,
      exists: true,
    };
  } catch (error) {
    if (error.status !== 404 && error.status !== 409) throw error;
    return {
      commitSha: null,
      treeSha: null,
      exists: false,
    };
  }
}

async function createBlob(owner, file) {
  const content = await fs.readFile(file.absolutePath);
  const blob = await github(`/repos/${owner}/${repoName}/git/blobs`, {
    method: "POST",
    body: JSON.stringify({
      content: content.toString("base64"),
      encoding: "base64",
    }),
  });

  return {
    path: file.relativePath,
    mode: "100644",
    type: "blob",
    sha: blob.sha,
  };
}

const user = await github("/user");
const owner = user.login;
const repo = await createOrGetRepo(owner);
const files = await collectFiles(workspace);

if (!files.length) {
  throw new Error("No files found to upload.");
}

const treeItems = [];
for (const file of files) {
  treeItems.push(await createBlob(owner, file));
}

const head = await getHead(owner);
const tree = await github(`/repos/${owner}/${repoName}/git/trees`, {
  method: "POST",
  body: JSON.stringify({
    base_tree: head.treeSha || undefined,
    tree: treeItems,
  }),
});

const commit = await github(`/repos/${owner}/${repoName}/git/commits`, {
  method: "POST",
  body: JSON.stringify({
    message: "Initial upload Kediamanku Astro",
    tree: tree.sha,
    parents: head.commitSha ? [head.commitSha] : [],
  }),
});

if (head.exists) {
  await github(`/repos/${owner}/${repoName}/git/refs/heads/${branch}`, {
    method: "PATCH",
    body: JSON.stringify({
      sha: commit.sha,
      force: false,
    }),
  });
} else {
  await github(`/repos/${owner}/${repoName}/git/refs`, {
    method: "POST",
    body: JSON.stringify({
      ref: `refs/heads/${branch}`,
      sha: commit.sha,
    }),
  });
}

console.log(JSON.stringify({
  owner,
  repo: repo.name,
  url: repo.html_url,
  branch,
  commit: commit.sha,
  fileCount: files.length,
}, null, 2));
