import { v2 as cloudinary } from "cloudinary";

// Cloudinary image uploads. Configure with three env vars (cloudinary.com →
// Dashboard → "Product Environment Credentials"):
//   CLOUDINARY_CLOUD_NAME
//   CLOUDINARY_API_KEY
//   CLOUDINARY_API_SECRET
// Uploads happen server-side (in a Server Action), so the API secret never
// reaches the browser.

const MAX_BYTES = 8 * 1024 * 1024; // 8MB
const ALLOWED = ["image/png", "image/jpeg", "image/webp", "image/gif"];

let configured = false;
function ensureConfigured(): boolean {
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;
  if (!cloud_name || !api_key || !api_secret) return false;
  if (!configured) {
    cloudinary.config({ cloud_name, api_key, api_secret, secure: true });
    configured = true;
  }
  return true;
}

/**
 * Upload an image File (from FormData) to Cloudinary and return its
 * secure URL. Returns null if there is no file, the file is invalid, or
 * Cloudinary is not configured / errors — callers decide whether that's fatal.
 */
export async function uploadTicketImage(file: File | null): Promise<string | null> {
  if (!file || file.size === 0) return null;

  if (!ALLOWED.includes(file.type)) {
    throw new Error("Format d'image non supporté (PNG, JPEG, WEBP ou GIF).");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Image trop volumineuse (8 Mo maximum).");
  }
  if (!ensureConfigured()) {
    console.warn(
      "[cloudinary] credentials not set — skipping image upload."
    );
    return null;
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const dataUri = `data:${file.type};base64,${buffer.toString("base64")}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: "tickets",
    resource_type: "image",
  });
  return result.secure_url;
}
