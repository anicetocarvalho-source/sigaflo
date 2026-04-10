import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, FileText, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'application/pdf',
];
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'pdf'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

interface DocumentUploadProps {
  label: string;
  value?: string | null;
  onChange: (url: string | null) => void;
  disabled?: boolean;
  accept?: string;
}

export const DocumentUpload = ({ 
  label, 
  value, 
  onChange, 
  disabled,
  accept = "image/*,application/pdf"
}: DocumentUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_SIZE_BYTES) {
      return `Ficheiro muito grande (${(file.size / 1024 / 1024).toFixed(1)} MB). Máximo permitido: 5 MB.`;
    }
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
      return `Formato "${ext || 'desconhecido'}" não suportado. Use: JPG, PNG, WEBP, GIF ou PDF.`;
    }
    if (!ALLOWED_TYPES.includes(file.type) && file.type !== '') {
      return `Tipo de ficheiro "${file.type}" não permitido.`;
    }
    return null;
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `documents/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('farmer-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('farmer-documents')
        .getPublicUrl(filePath);

      onChange(data.publicUrl);
      toast.success('Documento carregado com sucesso');
    } catch (error: any) {
      toast.error('Erro ao carregar documento: ' + error.message);
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

  const removeDocument = () => {
    onChange(null);
  };

  const isPDF = value?.toLowerCase().endsWith('.pdf');

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      
      {value ? (
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border">
          <FileText className="h-8 w-8 text-primary" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Documento carregado</p>
            <p className="text-xs text-muted-foreground">
              {isPDF ? 'PDF' : 'Imagem'}
            </p>
          </div>
          <div className="flex gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => window.open(value, '_blank')}
            >
              <Eye className="h-4 w-4" />
            </Button>
            {!disabled && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={removeDocument}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div 
          className={`
            flex flex-col items-center justify-center p-6 border-2 border-dashed 
            rounded-lg cursor-pointer hover:border-primary/50 transition-colors
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground text-center">
            {isUploading ? 'A carregar...' : 'Clique para carregar'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            JPG, PNG ou PDF (máx. 5MB)
          </p>
        </div>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
};
