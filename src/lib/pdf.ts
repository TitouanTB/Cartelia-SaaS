import PDFDocument from 'pdfkit';
import { Menu } from '@prisma/client';

interface MenuItem {
  title: string;
  desc?: string;
  price?: string;
  category?: string;
}

export function generateMenuPDF(menu: Menu): Buffer {
  const doc = new PDFDocument({ margin: 40 });
  const buffers: Buffer[] = [];

  doc.on('data', buffers.push.bind(buffers));
  doc.on('end', () => {});

  doc.fontSize(22).text('Menu', { align: 'center' });
  doc.moveDown();

  const items = (menu.items as unknown as MenuItem[]) || [];
  let currentCategory: string | undefined;

  items.forEach(item => {
    if (item.category && item.category !== currentCategory) {
      currentCategory = item.category;
      doc.moveDown().fontSize(16).text(currentCategory, { underline: true });
      doc.moveDown(0.5);
    }

    doc.fontSize(14).text(item.title, { continued: true });
    if (item.price) {
      doc.font('Helvetica-Bold').text(` - ${item.price}`);
      doc.font('Helvetica');
    } else {
      doc.text('');
    }

    if (item.desc) {
      doc.fontSize(12).fillColor('#555555').text(item.desc);
      doc.fillColor('#000000');
    }

    doc.moveDown();
  });

  doc.end();

  return Buffer.concat(buffers);
}
