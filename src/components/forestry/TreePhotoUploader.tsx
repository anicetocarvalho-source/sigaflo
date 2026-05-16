import { useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Camera, Loader2, Trash2, ImagePlus } from 'lucide-react';
import { toast } from 'sonner';

interface TreePhotoUploaderProps {
  treeCode: string;
  photos: string[];
  onChange: (photos: string[]) => void;
  max?: number;
}

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];

export function TreePhotoUploader({
  treeCode,
  photos,
  onChange,
  max = 6,
}: TreePhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const remaining = max - photos.length;
    if (remaining <= 0) {
      toast.error(`Máximo de ${max} fotos por árvore`);
      return;
    }
    const toUpload = Array.from(files).slice(0, remaining);
    setUploading(true);
    const uploaded: string[] = [];
    try {
      for (const file of toUpload) {
        if (!ALLOWED.includes(file.type)) {
          toast.error(`${file.name}: tipo inválido (use JPG, PNG ou WEBP)`);
          continue;
        }
        if (file.size > MAX_BYTES) {
          toast.error(`${file.name}: excede 5 MB`);
          continue;
        }
        const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const path = `${treeCode}/${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}.${ext}`;
        const { error } = await supabase.storage
          .from('tree-photos')
          .upload(path, file, { contentType: file.type, upsert: false });
        if (error) {
          toast.error(`Falha ao carregar ${file.name}: ${error.message}`);
          continue;
        }
        const { data } = supabase.storage.from('tree-photos').getPublicUrl(path);
        uploaded.push(data.publicUrl);
      }
      if (uploaded.length) {
        onChange([...photos, ...uploaded]);
        toast.success(`${uploaded.length} foto(s) carregada(s)`);
      }
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
      if (cameraRef.current) cameraRef.current.value = '';
    }
  };

  const removePhoto = async (url: string) => {
    // Extrair path relativo ao bucket
    const marker = '/tree-photos/';
    const idx = url.indexOf(marker);
    if (idx >= 0) {
      const path = url.slice(idx + marker.length);
      await supabase.storage.from('tree-photos').remove([path]);
    }
    onChange(photos.filter((p) => p !== url));
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={uploading || photos.length >= max}
        >
          {uploading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <ImagePlus className="mr-2 h-4 w-4" />
          )}
          Anexar fotos
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => cameraRef.current?.click()}
          disabled={uploading || photos.length >= max}
        >
          <Camera className="mr-2 h-4 w-4" />
          Tirar foto
        </Button>
        <span className="text-xs text-muted-foreground">
          {photos.length}/{max} • JPG/PNG/WEBP, máx. 5 MB cada
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {photos.map((url) => (
            <div
              key={url}
              className="group relative aspect-square overflow-hidden rounded-md border bg-muted"
            >
              <img
                src={url}
                alt="Foto da árvore"
                className="h-full w-full object-cover"
                loading="lazy"
              />
              <button
                type="button"
                onClick={() => removePhoto(url)}
                className="absolute right-1 top-1 rounded-full bg-destructive p-1 text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Remover foto"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
