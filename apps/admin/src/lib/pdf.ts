/**
 * KDPFactory — sellable book PDF builder (server-side, Node/Vercel).
 *
 * Generates a 6x9" book PDF with pdfkit, embedding the same EB Garamond +
 * Libre Baskerville fonts as the DOCX template. This is the digital product sold
 * on the site (the DOCX is the KDP interior). Title page, copyright + AI
 * disclosure, contents, chapters (EB Garamond headings, justified Libre
 * Baskerville body), and an About-the-Author page.
 *
 * NOTE: pdfkit loads its built-in font metrics (.afm) at construction, so those
 * files are bundled into the Vercel function via astro.config `includeFiles`.
 */
import PDFDocument from 'pdfkit';

export interface BookFonts {
  body: Buffer; bodyB: Buffer; bodyI: Buffer;
  disp: Buffer; dispB: Buffer; dispI: Buffer;
}
export interface BookMeta {
  title: string; subtitle: string; pen: string; publisher: string;
  bio: string; legal: string; year: string;
}
export interface PdfChapter { index: number; title: string | null; draft_md: string | null; }

const SEP = '·';
const clean = (s: string) => s.replace(/\*\*/g, '').replace(/\*/g, '');

/** Build the book PDF; resolves to base64. */
export function buildBookPdf(fonts: BookFonts, meta: BookMeta, chapters: PdfChapter[]): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: [432, 648], // 6x9" (points)
        margins: { top: 54, bottom: 54, left: 54, right: 54 }, // 0.75"
        autoFirstPage: false,
        info: { Title: meta.title, Author: meta.pen },
      });
      doc.registerFont('body', fonts.body);
      doc.registerFont('bodyB', fonts.bodyB);
      doc.registerFont('bodyI', fonts.bodyI);
      doc.registerFont('disp', fonts.disp);
      doc.registerFont('dispB', fonts.dispB);
      doc.registerFont('dispI', fonts.dispI);

      const chunks: Buffer[] = [];
      doc.on('data', (c: Buffer) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks).toString('base64')));
      doc.on('error', reject);

      // Title page
      doc.addPage();
      doc.y = 180;
      doc.font('disp').fontSize(30).text(meta.title, { align: 'center' });
      doc.moveDown(0.6);
      if (meta.subtitle) doc.font('dispI').fontSize(15).text(meta.subtitle, { align: 'center' });
      doc.y = 520;
      doc.font('body').fontSize(13).text(meta.pen, { align: 'center' });

      // Copyright page
      doc.addPage();
      doc.y = 90;
      const cp = [
        `Copyright © ${meta.year} ${meta.publisher}. All rights reserved.`,
        'No part of this publication may be reproduced, distributed, or transmitted in any form or by any means without the prior written permission of the publisher, except in the case of brief quotations embodied in reviews.',
        `This book was created with the assistance of artificial intelligence, with human direction, curation, and editorial oversight by ${meta.publisher}, and is published in accordance with Amazon KDP content guidelines.`,
        meta.legal,
        `Published by ${meta.publisher}, an imprint of Grandfield Media.`,
        `First Edition ${SEP} ${meta.year}`,
      ];
      for (const t of cp) {
        if (t) doc.font('body').fontSize(9).text(t, { align: 'center' });
        doc.moveDown(0.6);
      }

      // Contents
      doc.addPage();
      doc.font('disp').fontSize(20).text('Contents', { align: 'center' });
      doc.moveDown(1.2);
      for (const c of chapters) {
        doc.font('body').fontSize(11).text(`Chapter ${c.index} ${SEP} ${c.title ?? ''}`, { align: 'center' });
        doc.moveDown(0.4);
      }

      // Chapters
      for (const c of chapters) {
        doc.addPage();
        doc.y = 120;
        doc.font('disp').fontSize(22).text(`Chapter ${c.index} ${SEP} ${c.title ?? ''}`, { align: 'center' });
        doc.moveDown(1.5);
        let first = true;
        for (const raw of (c.draft_md ?? '').split('\n')) {
          const l = raw.trim();
          if (!l) continue;
          if (l.indexOf('### ') === 0) {
            doc.moveDown(0.6);
            doc.font('dispB').fontSize(13).text(clean(l.slice(4)), { align: 'center' });
            doc.moveDown(0.4);
            first = true;
          } else if (l.indexOf('## ') === 0 || l.indexOf('# ') === 0) {
            continue;
          } else {
            doc.font('body').fontSize(10.5).text(clean(l), { align: 'justify', indent: first ? 0 : 14, lineGap: 2 });
            first = false;
          }
        }
      }

      // About the Author
      if (meta.bio) {
        doc.addPage();
        doc.y = 120;
        doc.font('disp').fontSize(20).text('About the Author', { align: 'center' });
        doc.moveDown(1.2);
        doc.font('body').fontSize(11).text(meta.bio, { align: 'justify' });
      }

      doc.end();
    } catch (e) {
      reject(e);
    }
  });
}
