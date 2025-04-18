import { Image } from "react-native";
import * as FileSystem from "expo-file-system";
import { ImageSource, Size } from "../types";

export async function loadImageFromUri(uri: string): Promise<string> {
  const response = await fetch(uri);
  const blob = await response.blob();
  const base64 = await convertBlobToBase64(blob);
  return base64;
}

export async function loadImageFromBase64(base64: string): Promise<string> {
  return base64;
}

export async function loadImageFromLocalFile(
  localFilePath: string
): Promise<string> {
  const base64 = await FileSystem.readAsStringAsync(localFilePath, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return `data:image/png;base64,${base64}`;
}

async function convertBlobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Normalizes different image source types to a unified URI string
 */
export async function normalizeImageSource(source: ImageSource): Promise<string> {
  if ('uri' in source) {
    return source.uri;
  } else if ('base64' in source) {
    // If it doesn't already have the data:image prefix, add it
    if (source.base64.startsWith('data:image')) {
      return source.base64;
    }
    return `data:image/png;base64,${source.base64}`;
  } else if ('localFilePath' in source) {
    // For local files, we can either:
    // 1. Convert to base64 (returns data URL)
    // return await loadImageFromLocalFile(source.localFilePath);
    // 2. Or just use the file path directly (more efficient)
    return source.localFilePath;
  }

  throw new Error('Invalid image source format');
}

/**
 * Gets the dimensions (width and height) of an image from a URI
 */
export async function getImageDimensions(uri: string): Promise<Size> {
  return new Promise((resolve, reject) => {
    Image.getSize(
      uri,
      (width, height) => {
        resolve({ width, height });
      },
      (error) => {
        reject(new Error(`Failed to get image dimensions: ${error}`));
      }
    );
  });
}
