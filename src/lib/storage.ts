import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

const endpoint = (process.env.R2_ENDPOINT || '').replace(/\/+$/, '');
const bucket = process.env.R2_BUCKET || '';
const accessKeyId = process.env.R2_ACCESS_KEY_ID || '';
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || '';
const publicBase = (process.env.R2_PUBLIC_BASE_URL || '').replace(/\/+$/, '');

const isConfigured = endpoint && bucket && accessKeyId && secretAccessKey;

const s3 = isConfigured
  ? new S3Client({
      region: 'auto',
      endpoint,
      credentials: { accessKeyId, secretAccessKey },
    })
  : null;

export function buildKey(prefix: string, filename?: string) {
  const ext =
    filename && filename.includes('.') ? filename.slice(filename.lastIndexOf('.')) : '';
  const cleanPrefix = prefix.replace(/^\/+|\/+$/g, '');
  return `${cleanPrefix}/${randomUUID()}${ext}`;
}

function resolvePublicBase() {
  if (publicBase) return publicBase;
  if (endpoint && bucket) return `${endpoint}/${bucket}`.replace(/\/+$/, '');
  return '';
}

function extractKeyFromUrl(url: string | null | undefined) {
  if (!url) return null;
  const base = resolvePublicBase();
  if (!base) return null;
  if (!url.startsWith(base)) return null;
  const key = url.slice(base.length).replace(/^\/+/, '');
  return key || null;
}

export async function uploadBuffer(options: {
  buffer: Buffer;
  key: string;
  contentType?: string;
  cacheControl?: string;
}) {
  if (!s3 || !isConfigured) {
    throw new Error('STORAGE_NOT_CONFIGURED');
  }

  const { buffer, key, contentType, cacheControl } = options;
  const cleanKey = key.replace(/^\/+/, '');
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: cleanKey,
      Body: buffer,
      ContentType: contentType,
      CacheControl: cacheControl || 'public, max-age=31536000, immutable',
    })
  );

  const base =
    publicBase ||
    (endpoint && bucket ? `${endpoint}/${bucket}`.replace(/\/+$/, '') : '');

  if (!base) {
    throw new Error('STORAGE_URL_MISCONFIGURED');
  }

  return `${base}/${cleanKey}`;
}

export async function signUrl(key: string, expiresIn: number = 3600) {
  if (!s3 || !isConfigured) throw new Error('STORAGE_NOT_CONFIGURED');
  const cleanKey = key.replace(/^\/+/, '');
  const cmd = new GetObjectCommand({ Bucket: bucket, Key: cleanKey });
  return getSignedUrl(s3, cmd, { expiresIn });
}

export async function signUrlIfR2(url?: string | null, expiresIn: number = 3600) {
  if (!url) return url || null;
  const key = extractKeyFromUrl(url);
  if (!key) return url; // external url, leave as-is
  return signUrl(key, expiresIn);
}

export async function deleteObjectByUrl(url?: string | null) {
  if (!url) return;
  const key = extractKeyFromUrl(url);
  if (!key) return;
  if (!s3 || !isConfigured) throw new Error('STORAGE_NOT_CONFIGURED');
  await s3.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  );
}

export async function deleteObjectsByUrl(urls: Array<string | null | undefined>) {
  if (!urls || urls.length === 0) return;
  const keys = urls
    .map(extractKeyFromUrl)
    .filter((k): k is string => !!k)
    .filter((value, index, self) => self.indexOf(value) === index);
  if (keys.length === 0) return;
  if (!s3 || !isConfigured) throw new Error('STORAGE_NOT_CONFIGURED');

  if (keys.length === 1) {
    await deleteObjectByUrl(`${resolvePublicBase()}/${keys[0]}`);
    return;
  }

  await s3.send(
    new DeleteObjectsCommand({
      Bucket: bucket,
      Delete: { Objects: keys.map((Key) => ({ Key })) },
    })
  );
}
