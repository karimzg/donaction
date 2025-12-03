import path from "path";

export default function isImage(filePath: string): boolean {
  if (!filePath) {
    return false;
  }
  const imageExtensions = /\.(jpg|jpeg|png|gif|bmp|webp|tiff)$/i;
  const ext = path.extname(filePath);
  return imageExtensions.test(ext);
}