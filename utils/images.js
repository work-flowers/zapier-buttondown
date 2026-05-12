const CONTENT_TYPE_TO_EXT = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
};

const extFromUrl = (fileUrl) => {
  try {
    const pathname = new URL(fileUrl).pathname;
    const match = pathname.match(/\.([a-z0-9]+)$/i);
    return match ? match[1].toLowerCase() : null;
  } catch (e) {
    return null;
  }
};

const uploadImage = async (z, fileUrl) => {
  const FormData = require('form-data');
  const fetch = require('node-fetch');

  const fileResponse = await fetch(fileUrl);
  if (!fileResponse.ok) {
    throw new Error(
      `Failed to fetch image (${fileResponse.status}): ${fileUrl}`
    );
  }
  const buffer = await fileResponse.buffer();
  const headerType = (fileResponse.headers.get('content-type') || '')
    .split(';')[0]
    .trim()
    .toLowerCase();
  const ext =
    CONTENT_TYPE_TO_EXT[headerType] || extFromUrl(fileUrl) || 'jpg';
  const contentType = headerType || `image/${ext === 'jpg' ? 'jpeg' : ext}`;
  const filename = `image.${ext}`;

  const form = new FormData();
  form.append('image', buffer, {
    filename,
    contentType,
  });

  const uploadResponse = await z.request({
    url: 'https://api.buttondown.com/v1/images',
    method: 'POST',
    headers: form.getHeaders(),
    body: form.getBuffer(),
    skipThrowForStatus: true,
  });
  if (uploadResponse.status >= 400) {
    throw new Error(
      `Buttondown image upload failed (${uploadResponse.status}) for ${fileUrl}: ${uploadResponse.content}`
    );
  }
  return uploadResponse.data.image;
};

const shouldRehost = (url) => {
  try {
    const { protocol, hostname } = new URL(url);
    if (protocol !== 'http:' && protocol !== 'https:') return false;
    if (hostname.endsWith('buttondown.com')) return false;
    if (hostname.endsWith('buttondown.email')) return false;
    return true;
  } catch (e) {
    return false;
  }
};

const dedupeKey = (url) => {
  try {
    const u = new URL(url);
    return `${u.protocol}//${u.host}${u.pathname}`;
  } catch (e) {
    return url;
  }
};

const rehostMarkdownImages = async (z, markdown) => {
  const imageRegex = /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
  const matches = [...markdown.matchAll(imageRegex)];
  const targets = matches
    .map((m) => m[2])
    .filter((url) => shouldRehost(url));
  if (targets.length === 0) return markdown;

  const unique = [...new Set(targets.map(dedupeKey))];
  const keyToOriginal = new Map();
  for (const url of targets) {
    const key = dedupeKey(url);
    if (!keyToOriginal.has(key)) keyToOriginal.set(key, url);
  }

  const uploads = await Promise.all(
    unique.map(async (key) => {
      const original = keyToOriginal.get(key);
      const permanent = await uploadImage(z, original);
      return [key, permanent];
    })
  );
  const keyToPermanent = new Map(uploads);

  return markdown.replace(imageRegex, (full, alt, url) => {
    if (!shouldRehost(url)) return full;
    const permanent = keyToPermanent.get(dedupeKey(url));
    if (!permanent) return full;
    const titleMatch = full.match(/\s+"[^"]*"\)$/);
    const title = titleMatch ? titleMatch[0].slice(0, -1) : '';
    return `![${alt}](${permanent}${title})`;
  });
};

module.exports = { uploadImage, rehostMarkdownImages };
