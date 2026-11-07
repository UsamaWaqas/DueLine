import { apiRequest } from './client';

export type ReceiptScanResult = { merchant: string | null; price: number | null; rawText: string };

export async function scanReceipt(imageUri: string): Promise<ReceiptScanResult> {
  const form = new FormData();
  form.append('image', {
    uri: imageUri,
    name: 'receipt.jpg',
    type: 'image/jpeg',
  } as unknown as Blob);

  return apiRequest<ReceiptScanResult>('/api/receipts/scan', {
    method: 'POST',
    auth: true,
    isFormData: true,
    body: form,
  });
}
