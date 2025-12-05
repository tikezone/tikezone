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
};

const formatXof = (value?: number | null) => {
  if (value === undefined || value === null) return '';
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' })
    .format(value)
    .replace('XOF', 'F CFA');
};

export async function generateTicketPdf(data: TicketPdfPayload): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 36 });
      const buffers: Buffer[] = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

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
      } = data;

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

      // Header
      doc.rect(36, 36, doc.page.width - 72, doc.page.height - 72).stroke('#111');
      doc
        .fontSize(20)
        .font('Helvetica-Bold')
        .text('TIKEZONE - BILLET', { align: 'center', underline: true, margin: 12 });

      doc.moveDown();
      doc.fontSize(14).font('Helvetica-Bold').text(eventTitle, { align: 'center' });
      doc.moveDown(0.4);
      doc.fontSize(12).font('Helvetica').text(dateStr, { align: 'center' });
      if (eventLocation) {
        doc.text(eventLocation, { align: 'center' });
      }

      doc.moveDown(1);
      doc
        .fontSize(28)
        .font('Helvetica-Bold')
        .fillColor('#111')
        .text(code, { align: 'center' });
      doc.fontSize(10).font('Helvetica').fillColor('#333').text('Code ticket / Check-in', {
        align: 'center',
      });

      doc.moveDown(1.2);
      const startY = doc.y;
      const label = (title: string, value?: string | number | null) => {
        if (!value && value !== 0) return;
        doc
          .fontSize(9)
          .font('Helvetica-Bold')
          .fillColor('#555')
          .text(title.toUpperCase());
        doc
          .fontSize(12)
          .font('Helvetica-Bold')
          .fillColor('#111')
          .text(String(value));
        doc.moveDown(0.4);
      };

      label('Nom du participant', holderName || 'Invité');
      label('Type de billet', ticketType || 'Ticket');
      if (quantity !== undefined && quantity !== null) label('Quantité', quantity);
      if (amount !== undefined && amount !== null) label('Montant', formatXof(amount));
      if (note) label('Note', note);

      // Footer
      doc.moveTo(36, startY + 240).lineTo(doc.page.width - 36, startY + 240).dash(4, { space: 4 }).stroke('#ccc').undash();
      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#444')
        .text(
          'Présentez ce ticket à l’entrée. Un seul usage par code. Conservez précieusement ce PDF.',
          36,
          startY + 250,
          { width: doc.page.width - 72, align: 'center' }
        );
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
