import { useCallback, useState } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Loader2, RotateCw, ZoomIn } from 'lucide-react';

interface PhotoCropDialogProps {
  open: boolean;
  imageSrc: string | null;
  onCancel: () => void;
  onConfirm: (blob: Blob) => Promise<void> | void;
  /** Aspect ratio width/height. Default 3/4 (CR-80 ID portrait). */
  aspect?: number;
  /** Output longest side in px. Default 800. */
  outputSize?: number;
}

/**
 * Loads an image as an HTMLImageElement.
 */
const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });

/**
 * Renders the cropped/rotated region into a JPEG blob.
 */
async function getCroppedBlob(
  imageSrc: string,
  cropPixels: Area,
  rotation: number,
  aspect: number,
  outputSize: number,
): Promise<Blob> {
  const image = await loadImage(imageSrc);

  // Output canvas (target dimensions). Keep aspect — width is longest side when aspect <= 1.
  const targetW = aspect >= 1 ? outputSize : Math.round(outputSize * aspect);
  const targetH = aspect >= 1 ? Math.round(outputSize / aspect) : outputSize;

  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas indisponível');

  if (rotation % 360 === 0) {
    ctx.drawImage(
      image,
      cropPixels.x, cropPixels.y, cropPixels.width, cropPixels.height,
      0, 0, targetW, targetH,
    );
  } else {
    // Rotate around image center, then crop the rotated full-size canvas.
    const rad = (rotation * Math.PI) / 180;
    const sin = Math.abs(Math.sin(rad));
    const cos = Math.abs(Math.cos(rad));
    const bBoxW = image.width * cos + image.height * sin;
    const bBoxH = image.width * sin + image.height * cos;

    const tmp = document.createElement('canvas');
    tmp.width = bBoxW;
    tmp.height = bBoxH;
    const tctx = tmp.getContext('2d')!;
    tctx.translate(bBoxW / 2, bBoxH / 2);
    tctx.rotate(rad);
    tctx.drawImage(image, -image.width / 2, -image.height / 2);

    ctx.drawImage(
      tmp,
      cropPixels.x, cropPixels.y, cropPixels.width, cropPixels.height,
      0, 0, targetW, targetH,
    );
  }

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Falha ao gerar imagem'))),
      'image/jpeg',
      0.9,
    );
  });
}

export const PhotoCropDialog = ({
  open,
  imageSrc,
  onCancel,
  onConfirm,
  aspect = 3 / 4,
  outputSize = 800,
}: PhotoCropDialogProps) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);

  const onCropComplete = useCallback((_: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const handleConfirm = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setSaving(true);
    try {
      const blob = await getCroppedBlob(imageSrc, croppedAreaPixels, rotation, aspect, outputSize);
      await onConfirm(blob);
    } finally {
      setSaving(false);
      // reset for next session
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
    }
  };

  const handleCancel = () => {
    if (saving) return;
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    onCancel();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleCancel()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Ajustar fotografia</DialogTitle>
          <DialogDescription>
            Arraste, amplie ou rode para enquadrar o rosto. O recorte é optimizado para o cartão PVC (formato retrato 3:4).
          </DialogDescription>
        </DialogHeader>

        <div className="relative w-full h-[320px] bg-muted rounded-md overflow-hidden">
          {imageSrc && (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={aspect}
              cropShape="rect"
              showGrid
              objectFit="contain"
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onRotationChange={setRotation}
              onCropComplete={onCropComplete}
            />
          )}
        </div>

        <div className="space-y-3 pt-2">
          <div>
            <Label className="text-xs flex items-center gap-2 mb-1">
              <ZoomIn className="h-3.5 w-3.5" /> Zoom
            </Label>
            <Slider
              min={1}
              max={4}
              step={0.05}
              value={[zoom]}
              onValueChange={(v) => setZoom(v[0])}
              disabled={saving}
            />
          </div>
          <div>
            <Label className="text-xs flex items-center gap-2 mb-1">
              <RotateCw className="h-3.5 w-3.5" /> Rotação
            </Label>
            <Slider
              min={0}
              max={360}
              step={1}
              value={[rotation]}
              onValueChange={(v) => setRotation(v[0])}
              disabled={saving}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={saving || !croppedAreaPixels}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                A carregar...
              </>
            ) : (
              'Confirmar e carregar'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
