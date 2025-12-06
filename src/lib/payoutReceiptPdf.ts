import PDFDocument from 'pdfkit';

export type PayoutReceiptPayload = {
  receiptNumber: string;
  date: string;
  organizerName: string;
  organizerEmail: string;
  organizerPhone?: string;
  cagnotteTitle: string;
  cagnotteReason: string;
  amount: number;
  paymentMethod: string;
  paymentReference?: string;
  adminName?: string;
  notes?: string;
};

const formatXof = (value: number) => {
  return new Intl.NumberFormat('fr-FR').format(value) + ' F CFA';
};

const formatDate = (date: string) => {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
};

export async function generatePayoutReceiptPdf(data: PayoutReceiptPayload): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const buffers: Buffer[] = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      const pageWidth = doc.page.width;
      const margin = 50;
      const contentWidth = pageWidth - margin * 2;

      doc
        .fontSize(28)
        .font('Helvetica-Bold')
        .fillColor('#f97316')
        .text('TIKEZONE', margin, margin);

      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor('#6b7280')
        .text('Plateforme de billetterie et financement participatif', margin, margin + 35);

      doc
        .fontSize(22)
        .font('Helvetica-Bold')
        .fillColor('#1f2937')
        .text('RECU DE VERSEMENT', margin, margin + 80, {
          width: contentWidth,
          align: 'center'
        });

      doc
        .fontSize(12)
        .font('Helvetica')
        .fillColor('#6b7280')
        .text(`N° ${data.receiptNumber}`, margin, margin + 110, {
          width: contentWidth,
          align: 'center'
        });

      let y = margin + 150;

      doc
        .moveTo(margin, y)
        .lineTo(pageWidth - margin, y)
        .strokeColor('#e5e7eb')
        .lineWidth(1)
        .stroke();

      y += 20;

      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .fillColor('#374151')
        .text('Date du versement:', margin, y);
      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor('#1f2937')
        .text(formatDate(data.date), margin + 150, y);

      y += 30;

      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .fillColor('#f97316')
        .text('BENEFICIAIRE', margin, y);

      y += 20;

      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .fillColor('#374151')
        .text('Nom:', margin, y);
      doc
        .font('Helvetica')
        .fillColor('#1f2937')
        .text(data.organizerName, margin + 100, y);

      y += 18;

      doc
        .font('Helvetica-Bold')
        .fillColor('#374151')
        .text('Email:', margin, y);
      doc
        .font('Helvetica')
        .fillColor('#1f2937')
        .text(data.organizerEmail, margin + 100, y);

      if (data.organizerPhone) {
        y += 18;
        doc
          .font('Helvetica-Bold')
          .fillColor('#374151')
          .text('Telephone:', margin, y);
        doc
          .font('Helvetica')
          .fillColor('#1f2937')
          .text(data.organizerPhone, margin + 100, y);
      }

      y += 40;

      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .fillColor('#f97316')
        .text('DETAILS DE LA CAGNOTTE', margin, y);

      y += 20;

      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .fillColor('#374151')
        .text('Titre:', margin, y);
      doc
        .font('Helvetica')
        .fillColor('#1f2937')
        .text(data.cagnotteTitle, margin + 100, y, { width: contentWidth - 100 });

      y += 18;

      const reasonLabels: Record<string, string> = {
        medical: 'Frais medicaux',
        education: 'Education',
        funeral: 'Funerailles',
        emergency: 'Urgence',
        project: 'Projet personnel',
        community: 'Communautaire',
        celebration: 'Celebration',
        other: 'Autre',
      };

      doc
        .font('Helvetica-Bold')
        .fillColor('#374151')
        .text('Motif:', margin, y);
      doc
        .font('Helvetica')
        .fillColor('#1f2937')
        .text(reasonLabels[data.cagnotteReason] || data.cagnotteReason, margin + 100, y);

      y += 40;

      doc.roundedRect(margin, y, contentWidth, 80, 10).fill('#fef3c7');

      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .fillColor('#92400e')
        .text('MONTANT VERSE', margin + 20, y + 15);

      doc
        .fontSize(28)
        .font('Helvetica-Bold')
        .fillColor('#f97316')
        .text(formatXof(data.amount), margin + 20, y + 40);

      y += 100;

      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .fillColor('#f97316')
        .text('PAIEMENT', margin, y);

      y += 20;

      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .fillColor('#374151')
        .text('Methode:', margin, y);
      doc
        .font('Helvetica')
        .fillColor('#1f2937')
        .text(data.paymentMethod, margin + 100, y);

      if (data.paymentReference) {
        y += 18;
        doc
          .font('Helvetica-Bold')
          .fillColor('#374151')
          .text('Reference:', margin, y);
        doc
          .font('Helvetica')
          .fillColor('#1f2937')
          .text(data.paymentReference, margin + 100, y);
      }

      if (data.notes) {
        y += 40;
        doc
          .fontSize(10)
          .font('Helvetica-Bold')
          .fillColor('#374151')
          .text('Notes:', margin, y);
        y += 15;
        doc
          .font('Helvetica')
          .fillColor('#6b7280')
          .text(data.notes, margin, y, { width: contentWidth });
      }

      const footerY = doc.page.height - 100;

      doc
        .moveTo(margin, footerY)
        .lineTo(pageWidth - margin, footerY)
        .strokeColor('#e5e7eb')
        .lineWidth(1)
        .stroke();

      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#9ca3af')
        .text(
          'Ce document constitue un recu officiel de versement. Conservez-le precieusement.',
          margin,
          footerY + 15,
          { width: contentWidth, align: 'center' }
        );

      doc
        .fontSize(8)
        .fillColor('#6b7280')
        .text(
          'TIKEZONE - Plateforme de billetterie et financement participatif',
          margin,
          footerY + 35,
          { width: contentWidth, align: 'center' }
        );

      doc
        .text(
          'Contact: support@tikezone.com | www.tikezone.com',
          margin,
          footerY + 50,
          { width: contentWidth, align: 'center' }
        );

      if (data.adminName) {
        doc
          .fontSize(8)
          .fillColor('#9ca3af')
          .text(
            `Traite par: ${data.adminName}`,
            margin,
            footerY + 70,
            { width: contentWidth, align: 'right' }
          );
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
