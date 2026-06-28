import { fieldLimits } from "./field-limits";

export const AVATAR_OUTPUT_SIZE = 256;
export const AVATAR_MAX_FILE_BYTES = 2 * 1024 * 1024;
export const AVATAR_MAX_DATA_URL_LENGTH = fieldLimits.avatarDataUrl;

const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export class AvatarImageError extends Error {
  constructor(
    message: string,
    readonly code: "type" | "size" | "process",
  ) {
    super(message);
    this.name = "AvatarImageError";
  }
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new AvatarImageError("Failed to load image", "process"));
    };
    img.src = url;
  });
}

export async function processAvatarFile(file: File): Promise<string> {
  if (!ACCEPTED_TYPES.has(file.type)) {
    throw new AvatarImageError("Invalid image type", "type");
  }
  if (file.size > AVATAR_MAX_FILE_BYTES) {
    throw new AvatarImageError("File too large", "size");
  }

  const img = await loadImageFromFile(file);
  const size = AVATAR_OUTPUT_SIZE;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new AvatarImageError("Canvas unavailable", "process");

  const scale = Math.max(size / img.width, size / img.height);
  const w = img.width * scale;
  const h = img.height * scale;
  ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);

  let quality = 0.88;
  let dataUrl = canvas.toDataURL("image/jpeg", quality);
  while (dataUrl.length > AVATAR_MAX_DATA_URL_LENGTH && quality > 0.5) {
    quality -= 0.08;
    dataUrl = canvas.toDataURL("image/jpeg", quality);
  }

  if (dataUrl.length > AVATAR_MAX_DATA_URL_LENGTH) {
    throw new AvatarImageError("Processed image too large", "size");
  }

  return dataUrl;
}

export function isValidAvatarDataUrl(value: string | null | undefined): boolean {
  if (value == null || value === "") return true;
  return (
    value.startsWith("data:image/") && value.length <= AVATAR_MAX_DATA_URL_LENGTH
  );
}
