import PDFDocument from 'pdfkit';

export type TicketPdfPayload = {
  code: string;
  eventTitle: string;
  eventDate: string; // ISO
  eventLocation?: string | null;
  holderName?: string | null;
  ticketType?: string | null;
  quantity?: number | null;
  amount?: number | null; // in XOF
  note?: string | null;
  eventImageUrl?: string | null;
};

const formatXof = (value?: number | null) => {
  if (value === undefined || value === null) return '';
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' })
    .format(value)
    .replace('XOF', 'F CFA');
};

async function fetchImageAsBuffer(url: string): Promise<Buffer | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch {
    return null;
  }
}

export async function generateTicketPdf(data: TicketPdfPayload): Promise<Buffer> {
  const {
    code,
    eventTitle,
    eventDate,
    eventLocation,
    holderName,
    ticketType,
    quantity,
    amount,
    note,
    eventImageUrl,
  } = data;

  let imageBuffer: Buffer | null = null;
  if (eventImageUrl) {
    imageBuffer = await fetchImageAsBuffer(eventImageUrl);
  }

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 0 });
      const buffers: Buffer[] = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;

      doc.rect(0, 0, pageWidth, pageHeight).fill('#0a0a0a');

      doc.rect(0, 0, pageWidth, 300).fill('#141414');

      doc
        .fontSize(28)
        .font('Helvetica-Bold')
        .fillColor('#ffffff')
        .text('TIKE', 40, 35, { continued: true })
        .fillColor('#f97316')
        .text('ZONE', { continued: false });

      const cardX = 40;
      const cardY = 80;
      const cardWidth = pageWidth - 80;
      const cardHeight = 440;

      doc.roundedRect(cardX, cardY, cardWidth, cardHeight, 24).fill('#1a1a1a');
      doc
        .roundedRect(cardX, cardY, cardWidth, cardHeight, 24)
        .lineWidth(1)
        .strokeColor('#333333')
        .stroke();

      let currentY = cardY + 20;

      if (imageBuffer) {
        try {
          const imgWidth = cardWidth - 40;
          const imgHeight = 180;
          doc.save();
          doc
            .roundedRect(cardX + 20, currentY, imgWidth, imgHeight, 16)
            .clip();
          doc.image(imageBuffer, cardX + 20, currentY, {
            width: imgWidth,
            height: imgHeight,
            cover: [imgWidth, imgHeight],
          });
          doc.restore();

          doc.rect(cardX + 20, currentY + imgHeight - 60, imgWidth, 60).fill('#000000');
          doc.opacity(0.7);
          doc.rect(cardX + 20, currentY + imgHeight - 60, imgWidth, 60).fill('#000000');
          doc.opacity(1);

          currentY += imgHeight + 20;
        } catch {
          currentY += 10;
        }
      } else {
        currentY += 10;
      }

      doc
        .fontSize(22)
        .font('Helvetica-Bold')
        .fillColor('#ffffff')
        .text(eventTitle.toUpperCase(), cardX + 20, currentY, {
          width: cardWidth - 40,
          align: 'center',
        });
      currentY += 35;

      const dateStr = eventDate
        ? new Date(eventDate).toLocaleString('fr-FR', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        : '';

      doc
        .fontSize(12)
        .font('Helvetica')
        .fillColor('#9ca3af')
        .text(dateStr, cardX + 20, currentY, {
          width: cardWidth - 40,
          align: 'center',
        });
      currentY += 18;

      if (eventLocation) {
        doc
          .fontSize(11)
          .font('Helvetica')
          .fillColor('#6b7280')
          .text(eventLocation, cardX + 20, currentY, {
            width: cardWidth - 40,
            align: 'center',
          });
        currentY += 16;
      }

      currentY += 20;

      const codeBoxWidth = 200;
      const codeBoxHeight = 70;
      const codeBoxX = cardX + (cardWidth - codeBoxWidth) / 2;
      const codeBoxY = currentY;

      doc.roundedRect(codeBoxX, codeBoxY, codeBoxWidth, codeBoxHeight, 16).fill('#f97316');

      doc
        .fontSize(24)
        .font('Helvetica-Bold')
        .fillColor('#ffffff')
        .text(code, codeBoxX, codeBoxY + 15, {
          width: codeBoxWidth,
          align: 'center',
        });
      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#ffffff')
        .text("CODE D'ENTRÉE", codeBoxX, codeBoxY + 48, {
          width: codeBoxWidth,
          align: 'center',
        });

      currentY = codeBoxY + codeBoxHeight + 25;

      const infoStartY = currentY;
      const colWidth = (cardWidth - 60) / 2;
      const leftCol = cardX + 20;
      const rightCol = cardX + 20 + colWidth + 20;

      const drawInfoItem = (label: string, value: string, x: number, y: number) => {
        doc
          .fontSize(8)
          .font('Helvetica-Bold')
          .fillColor('#6b7280')
          .text(label.toUpperCase(), x, y);
        doc
          .fontSize(12)
          .font('Helvetica-Bold')
          .fillColor('#ffffff')
          .text(value, x, y + 12);
        return y + 35;
      };

      let leftY = infoStartY;
      let rightY = infoStartY;

      leftY = drawInfoItem('Participant', holderName || 'Invité', leftCol, leftY);
      rightY = drawInfoItem('Type de Billet', ticketType || 'Standard', rightCol, rightY);

      if (quantity !== undefined && quantity !== null) {
        leftY = drawInfoItem('Quantité', String(quantity), leftCol, leftY);
      }
      if (amount !== undefined && amount !== null) {
        rightY = drawInfoItem('Montant', formatXof(amount), rightCol, rightY);
      }

      const footerY = pageHeight - 120;
      doc
        .moveTo(40, footerY)
        .lineTo(pageWidth - 40, footerY)
        .dash(3, { space: 5 })
        .strokeColor('#333333')
        .stroke()
        .undash();

      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#6b7280')
        .text(
          "Présentez ce ticket à l'entrée. Un seul usage par code.",
          40,
          footerY + 20,
          { width: pageWidth - 80, align: 'center' }
        );
      doc
        .fontSize(8)
        .fillColor('#4b5563')
        .text(
          'Conservez précieusement ce PDF. Ne partagez pas votre code.',
          40,
          footerY + 38,
          { width: pageWidth - 80, align: 'center' }
        );

      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .fillColor('#f97316')
        .text('tikezone.com', 40, footerY + 65, {
          width: pageWidth - 80,
          align: 'center',
        });

      if (note) {
        doc
          .fontSize(9)
          .font('Helvetica')
          .fillColor('#9ca3af')
          .text(`Note: ${note}`, 40, footerY + 85, {
            width: pageWidth - 80,
            align: 'center',
          });
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
