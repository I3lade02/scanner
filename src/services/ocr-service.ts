import { type CameraCapturedPicture } from 'expo-camera';
import { requireOptionalNativeModule } from 'expo';

type TextExtractorModule = {
  extractTextFromImage: (uri: string) => Promise<string[]>;
  isSupported: boolean;
};

type ImageManipulatorModule = typeof import('expo-image-manipulator');

async function loadTextExtractor(): Promise<TextExtractorModule | null> {
  try {
    return requireOptionalNativeModule<TextExtractorModule>('ExpoTextExtractor');
  } catch {
    return null;
  }
}

async function loadImageManipulator(): Promise<ImageManipulatorModule | null> {
  try {
    return (await import('expo-image-manipulator')) as ImageManipulatorModule;
  } catch {
    return null;
  }
}

export async function cropCardRegion(picture: CameraCapturedPicture) {
  const imageManipulator = await loadImageManipulator();

  if (!imageManipulator) {
    return {
      uri: picture.uri,
      width: picture.width,
      height: picture.height,
    };
  }

  const cropWidth = Math.round(picture.width * 0.72);
  const cropHeight = Math.round(Math.min(picture.height * 0.66, cropWidth * 1.397));
  const originX = Math.max(0, Math.round((picture.width - cropWidth) / 2));
  const originY = Math.max(0, Math.round((picture.height - cropHeight) / 2));

  return imageManipulator.manipulateAsync(
    picture.uri,
    [
      {
        crop: {
          originX,
          originY,
          width: cropWidth,
          height: cropHeight,
        },
      },
    ],
    {
      compress: 0.92,
      format: imageManipulator.SaveFormat.JPEG,
    }
  );
}

export async function readCardTextFromPicture(picture: CameraCapturedPicture) {
  const textExtractor = await loadTextExtractor();

  if (!textExtractor?.isSupported) {
    return {
      croppedUri: picture.uri,
      textLines: [],
    };
  }

  const cropped = await cropCardRegion(picture);
  const textLines = await textExtractor.extractTextFromImage(cropped.uri);

  return {
    croppedUri: cropped.uri,
    textLines: textLines.map((line) => line.trim()).filter(Boolean),
  };
}

export async function getOcrSupport() {
  const textExtractor = await loadTextExtractor();
  return Boolean(textExtractor?.isSupported);
}
