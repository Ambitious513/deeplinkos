/**
 * Cloudinary upload utility for DeepLinkOS blog images.
 *
 * Uses an unsigned upload preset so no API secret is needed.
 * Run from Node.js scripts or server actions.
 *
 * Required env vars (add to .env.local):
 *   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=bylks678
 *   CLOUDINARY_UPLOAD_PRESET=DeeplinkOS
 */

const CLOUD_NAME    = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "bylks678";
const UPLOAD_PRESET = process.env.CLOUDINARY_UPLOAD_PRESET          ?? "DeeplinkOS";
const UPLOAD_URL    = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

export type CloudinaryResult = {
  secure_url: string;
  public_id:  string;
  width:      number;
  height:     number;
  format:     string;
};

/**
 * Upload an image file (Buffer or base64 data URI) to Cloudinary.
 *
 * @param file       - Buffer, base64 data URI string, or a remote https:// URL
 * @param publicId   - Cloudinary public_id (slug-style, no extension)
 * @param folder     - Cloudinary folder, default "blog"
 */
export async function uploadToCloudinary(
  file: Buffer | string,
  publicId: string,
  folder = "blog"
): Promise<CloudinaryResult> {
  const body = new URLSearchParams();

  if (Buffer.isBuffer(file)) {
    body.append("file", `data:image/jpeg;base64,${file.toString("base64")}`);
  } else {
    body.append("file", file); // already a data URI or remote URL
  }

  body.append("upload_preset", UPLOAD_PRESET);
  body.append("folder", folder);
  body.append("public_id", publicId);

  const response = await fetch(UPLOAD_URL, { method: "POST", body });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Cloudinary upload failed (${response.status}): ${text}`);
  }

  const data = (await response.json()) as CloudinaryResult & { error?: { message: string } };

  if ("error" in data && data.error) {
    throw new Error(`Cloudinary error: ${data.error.message}`);
  }

  return data;
}

/** Returns a Cloudinary optimised image URL with width + quality transforms */
export function cloudinaryUrl(
  publicIdOrUrl: string,
  { width = 1200, quality = 80 }: { width?: number; quality?: number } = {}
): string {
  if (publicIdOrUrl.includes("res.cloudinary.com")) {
    // Already a full URL — inject transforms after /upload/
    return publicIdOrUrl.replace(
      "/upload/",
      `/upload/w_${width},q_${quality},f_auto/`
    );
  }
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_${width},q_${quality},f_auto/${publicIdOrUrl}`;
}
