export function createDownloadUrl(base64: string, contentType: string): string {
  const blob: Blob = base64ToBlob(base64, contentType);
  const url: string = createObjectURL(blob);
  return url;
}

function base64ToBlob(base64: string, contentType: string): Blob {
  const byteCharacters: string = atob(base64);
  const byteArrays: Uint8Array[] = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice: string = byteCharacters.slice(offset, offset + 512);

    const byteNumbers: number[] = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray: Uint8Array = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  const blob: Blob = new Blob(byteArrays, { type: contentType });
  return blob;
}

function createObjectURL(blob: Blob): string {
  const url: string = URL.createObjectURL(blob);
  return url;
}
