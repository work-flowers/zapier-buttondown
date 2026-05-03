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

  // Use node-fetch directly to get a proper binary buffer
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

const perform = async (z, bundle) => {
  let emailBody = bundle.inputData.body;

  emailBody = await rehostMarkdownImages(z, emailBody);

  if (bundle.inputData.image_url) {
    const permanentUrl = await uploadImage(z, bundle.inputData.image_url);
    emailBody = `![](${permanentUrl})\n\n${emailBody}`;
  }

  const body = {
    subject: bundle.inputData.subject,
    body: emailBody,
    status: bundle.inputData.publish_date ? 'scheduled' : 'draft',
  };

  if (bundle.inputData.publish_date) {
    body.publish_date = bundle.inputData.publish_date;
  }
  if (bundle.inputData.description) {
    body.description = bundle.inputData.description;
  }
  if (bundle.inputData.slug) {
    body.slug = bundle.inputData.slug;
  }

  const response = await z.request({
    url: 'https://api.buttondown.com/v1/emails',
    method: 'POST',
    body,
  });
  return response.data;
};

module.exports = {
  key: 'create_draft',
  noun: 'Draft',
  display: {
    label: 'Create Draft',
    description: 'Creates a new email draft in Buttondown.',
  },
  operation: {
    perform,
    inputFields: [
      {
        key: 'subject',
        label: 'Subject',
        type: 'string',
        required: true,
        helpText: 'The subject line of the email.',
      },
      {
        key: 'body',
        label: 'Body',
        type: 'text',
        required: true,
        helpText:
          'The email body content. Supports both Markdown and HTML (auto-detected by Buttondown). Markdown images (`![](url)`) pointing at external URLs are automatically re-hosted on Buttondown so they don\'t break when the source URL expires.',
      },
      {
        key: 'description',
        label: 'Description',
        type: 'string',
        required: false,
        helpText: 'A short description for the archive/SEO.',
      },
      {
        key: 'publish_date',
        label: 'Send Date',
        type: 'datetime',
        required: false,
        helpText:
          'If provided, the email will be scheduled to send at this date/time instead of saved as a draft.',
      },
      {
        key: 'image_url',
        label: 'Image',
        type: 'file',
        required: false,
        helpText:
          'An image file to include at the top of the email body. The image will be re-hosted on Buttondown.',
      },
      {
        key: 'slug',
        label: 'Slug',
        type: 'string',
        required: false,
        helpText: 'URL slug for the email archive page (max 100 characters).',
      },
    ],
    sample: {
      id: 'email_00000000-0000-0000-0000-000000000000',
      subject: 'My Draft Email',
      body: '# Hello\n\nThis is a draft.',
      status: 'draft',
      creation_date: '2026-04-06T12:00:00Z',
      description: '',
      slug: 'my-draft-email',
    },
    outputFields: [
      { key: 'id', label: 'Email ID', type: 'string' },
      { key: 'subject', label: 'Subject', type: 'string' },
      { key: 'body', label: 'Body', type: 'string' },
      { key: 'status', label: 'Status', type: 'string' },
      { key: 'creation_date', label: 'Creation Date', type: 'datetime' },
      { key: 'description', label: 'Description', type: 'string' },
      { key: 'slug', label: 'Slug', type: 'string' },
    ],
  },
};
