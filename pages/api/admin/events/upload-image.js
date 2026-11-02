import crypto from 'crypto';
import { requireAdminSession } from '../../../../lib/api-middleware.js';
import { createAdminClient } from '../../../../lib/supabase.js';

const EVENT_IMAGE_BUCKET = 'event-images';
const MAX_EVENT_IMAGE_BYTES = 5 * 1024 * 1024;

const IMAGE_TYPES = {
  jpeg: {
    contentType: 'image/jpeg',
    extension: 'jpg',
  },
  png: {
    contentType: 'image/png',
    extension: 'png',
  },
  webp: {
    contentType: 'image/webp',
    extension: 'webp',
  },
};

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '7mb',
    },
  },
};

function detectImageType(buffer) {
  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return IMAGE_TYPES.jpeg;
  }

  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return IMAGE_TYPES.png;
  }

  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return IMAGE_TYPES.webp;
  }

  return null;
}

function decodeBase64Image(value) {
  if (typeof value !== 'string' || !value) {
    throw new Error('Missing image data');
  }

  const normalized = value.replace(/^data:[^;]+;base64,/, '').replace(/\s/g, '');
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(normalized) || normalized.length % 4 !== 0) {
    throw new Error('Invalid base64 image data');
  }

  const buffer = Buffer.from(normalized, 'base64');
  if (!buffer.length) {
    throw new Error('Empty image data');
  }

  return buffer;
}

export default async function handler(req, res) {
  if (!(await requireAdminSession(req, res))) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fileName, contentType, data } = req.body || {};

    if (typeof fileName !== 'string' || fileName.length > 200) {
      return res.status(400).json({ error: 'Invalid file name' });
    }

    if (
      typeof contentType !== 'string' ||
      !Object.values(IMAGE_TYPES).some((type) => type.contentType === contentType)
    ) {
      return res.status(400).json({
        error: 'Only JPEG, PNG, and WebP images are supported',
      });
    }

    const buffer = decodeBase64Image(data);

    if (buffer.length > MAX_EVENT_IMAGE_BYTES) {
      return res.status(413).json({
        error: 'Image is too large. Maximum size is 5 MB.',
      });
    }

    const detected = detectImageType(buffer);
    if (!detected || detected.contentType !== contentType) {
      return res.status(400).json({
        error: 'The uploaded file is not a valid JPEG, PNG, or WebP image.',
      });
    }

    const storagePath = `events/${crypto.randomUUID()}.${detected.extension}`;
    const adminClient = createAdminClient();

    const { data: buckets, error: bucketError } = await adminClient.storage.listBuckets();
    const bucket = buckets?.find((item) => item.id === EVENT_IMAGE_BUCKET || item.name === EVENT_IMAGE_BUCKET);

    if (bucketError || !bucket) {
      return res.status(503).json({
        error: 'Event image storage is not configured. Create the "event-images" Supabase Storage bucket first.',
      });
    }

    if (!bucket.public) {
      return res.status(503).json({
        error: 'The "event-images" Storage bucket must allow public reads for event images.',
      });
    }

    const { error: uploadError } = await adminClient.storage
      .from(EVENT_IMAGE_BUCKET)
      .upload(storagePath, buffer, {
        contentType: detected.contentType,
        cacheControl: '31536000',
        upsert: false,
      });

    if (uploadError) {
      console.error('[Event Image Upload] Storage error:', uploadError);
      return res.status(503).json({
        error:
          'Event image storage is not configured or the upload failed. Create/configure the "event-images" Supabase Storage bucket first.',
      });
    }

    const { data: publicUrlData } = adminClient.storage
      .from(EVENT_IMAGE_BUCKET)
      .getPublicUrl(storagePath);

    if (!publicUrlData?.publicUrl) {
      return res.status(503).json({
        error: 'The event image was uploaded, but no public image URL could be generated.',
      });
    }

    return res.status(200).json({
      publicUrl: publicUrlData.publicUrl,
      storagePath,
      fileName,
      contentType: detected.contentType,
      size: buffer.length,
    });
  } catch (err) {
    console.error('[Event Image Upload] Error:', err);
    return res.status(400).json({
      error: err?.message || 'Failed to upload event image',
    });
  }
}
