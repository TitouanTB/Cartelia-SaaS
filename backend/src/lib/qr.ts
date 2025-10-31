import QRCode from 'qrcode';

export async function generateQRCode(data: string): Promise<Buffer> {
  return QRCode.toBuffer(data, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 512,
  });
}

export async function generateQRDataURL(data: string): Promise<string> {
  return QRCode.toDataURL(data, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 512,
  });
}
