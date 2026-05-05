import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource, type Photo } from '@capacitor/camera';

export const isNativePlatform = () => Capacitor.isNativePlatform();

/**
 * Solicita permissões de câmara/fotos no dispositivo.
 * Em web é no-op (permissões são pedidas pelo browser ao chamar getUserMedia).
 */
export async function ensureCameraPermissions(): Promise<{
  granted: boolean;
  reason?: string;
}> {
  if (!Capacitor.isNativePlatform()) {
    return { granted: true };
  }
  try {
    const status = await Camera.checkPermissions();
    if (status.camera === 'granted' && status.photos === 'granted') {
      return { granted: true };
    }
    const requested = await Camera.requestPermissions({
      permissions: ['camera', 'photos'],
    });
    if (requested.camera === 'granted') {
      return { granted: true };
    }
    return {
      granted: false,
      reason:
        requested.camera === 'denied'
          ? 'Permissão de câmara negada. Active-a nas Definições do dispositivo.'
          : 'Permissão de câmara não concedida.',
    };
  } catch (e: any) {
    return { granted: false, reason: e?.message || 'Erro ao pedir permissões.' };
  }
}

/**
 * Tira uma foto usando a câmara nativa do dispositivo (Android/iOS via Capacitor).
 * Retorna um data URL JPEG ou null se cancelado.
 */
export async function takeNativePhoto(opts?: {
  source?: 'camera' | 'gallery' | 'prompt';
  quality?: number;
}): Promise<string | null> {
  const sourceMap = {
    camera: CameraSource.Camera,
    gallery: CameraSource.Photos,
    prompt: CameraSource.Prompt,
  };
  try {
    const photo: Photo = await Camera.getPhoto({
      quality: opts?.quality ?? 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: sourceMap[opts?.source ?? 'camera'],
      saveToGallery: false,
      correctOrientation: true,
    });
    return photo.dataUrl ?? null;
  } catch (e: any) {
    // Cancelamento do utilizador não é erro
    if (typeof e?.message === 'string' && /cancel/i.test(e.message)) return null;
    throw e;
  }
}
