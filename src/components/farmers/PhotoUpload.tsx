import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Upload, X, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

interface PhotoUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  disabled?: boolean;
}

export const PhotoUpload = ({ value, onChange, disabled }: PhotoUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_SIZE_BYTES) {
      return `Ficheiro muito grande (${(file.size / 1024 / 1024).toFixed(1)} MB). Máximo permitido: 5 MB.`;
    }
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !ALLOWED_IMAGE_EXTENSIONS.includes(ext)) {
      return `Formato "${ext || 'desconhecido'}" não suportado. Use: JPG, PNG, WEBP ou GIF.`;
    }
    if (!ALLOWED_IMAGE_TYPES.includes(file.type) && file.type !== '') {
      return `Tipo de ficheiro "${file.type}" não permitido para fotos.`;
    }
    return null;
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    try {
      const fileExt = (file.name.split('.').pop() || 'jpg').toLowerCase();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from('farmer-photos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type || 'image/jpeg',
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('farmer-photos')
        .getPublicUrl(filePath);

      onChange(data.publicUrl);
      toast.success('Foto carregada com sucesso');
    } catch (error: any) {
      toast.error('Erro ao carregar foto: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      toast.error(validationError);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    uploadFile(file);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 640, height: 480 } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setShowCamera(true);
    } catch (error) {
      toast.error('Não foi possível aceder à câmara');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        canvas.toBlob(async (blob) => {
          if (blob) {
            const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
            await uploadFile(file);
            stopCamera();
          }
        }, 'image/jpeg', 0.8);
      }
    }
  };

  const removePhoto = () => {
    onChange(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <div className="relative w-32 h-32 rounded-lg border-2 border-dashed border-muted-foreground/25 overflow-hidden bg-muted/50 flex items-center justify-center">
          {value ? (
            <>
              <img 
                src={value} 
                alt="Foto do agricultor" 
                className="w-full h-full object-cover"
              />
              {!disabled && (
                <button
                  type="button"
                  onClick={removePhoto}
                  className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </>
          ) : (
            <User className="h-12 w-12 text-muted-foreground/50" />
          )}
        </div>

        {!disabled && !value && (
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={startCamera}
              disabled={isUploading}
            >
              <Camera className="h-4 w-4 mr-2" />
              Tirar Foto
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? 'A carregar...' : 'Carregar'}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        )}
      </div>

      {showCamera && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border rounded-lg shadow-lg p-4 max-w-md w-full">
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full rounded-lg"
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>
            <div className="flex gap-2 mt-4 justify-center">
              <Button type="button" onClick={capturePhoto}>
                <Camera className="h-4 w-4 mr-2" />
                Capturar
              </Button>
              <Button type="button" variant="outline" onClick={stopCamera}>
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
