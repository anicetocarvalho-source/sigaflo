// =============================================================================
// SIGAFLO - Integridade de ficheiros (SHA-256 client-side)
// =============================================================================

/** Calcula SHA-256 de um ficheiro/blob no browser. */
export async function sha256OfFile(file: Blob): Promise<string> {
  const buf = await file.arrayBuffer();
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export interface FileIntegrityMetadata {
  sha256: string;
  size_bytes: number;
  mime: string;
  name: string;
}

export async function computeFileIntegrity(file: File): Promise<FileIntegrityMetadata> {
  const sha256 = await sha256OfFile(file);
  return {
    sha256,
    size_bytes: file.size,
    mime: file.type || 'application/octet-stream',
    name: file.name,
  };
}
