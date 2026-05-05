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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const onCropComplete = useCallback(
    async (_: Area, areaPixels: Area) => {
      setCroppedAreaPixels(areaPixels);
      if (!imageSrc) return;
      try {
        const blob = await getCroppedBlob(imageSrc, areaPixels, rotation, aspect, 320);
        setPreviewUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return URL.createObjectURL(blob);
        });
      } catch {
        // ignora erro de prévia
      }
    },
    [imageSrc, rotation, aspect],
  );

  const resetState = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
  };

  const handleConfirm = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setSaving(true);
    try {
      const blob = await getCroppedBlob(imageSrc, croppedAreaPixels, rotation, aspect, outputSize);
      await onConfirm(blob);
    } finally {
      setSaving(false);
      resetState();
    }
  };

  const handleCancel = () => {
    if (saving) return;
    resetState();
    onCancel();
  };

  const previewW = aspect >= 1 ? 140 : Math.round(140 * aspect);
  const previewH = aspect >= 1 ? Math.round(140 / aspect) : 140;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleCancel()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Ajustar fotografia</DialogTitle>
          <DialogDescription>
            Arraste, amplie ou rode para enquadrar o rosto. A prévia à direita mostra exactamente como ficará no cartão PVC.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4">
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

          <div className="flex flex-col items-center gap-2">
            <Label className="text-xs text-muted-foreground">Pré-visualização</Label>
            <div
              className="rounded-md border-2 border-primary/40 bg-muted overflow-hidden shadow-sm"
              style={{ width: previewW, height: previewH }}
            >
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Pré-visualização do recorte"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground px-2 text-center">
                  A gerar...
                </div>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground text-center max-w-[140px]">
              Formato cartão {aspect === 3 / 4 ? '(3:4)' : ''}
            </p>
          </div>
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
