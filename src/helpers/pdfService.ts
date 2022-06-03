import ejs from 'ejs';
import fs from 'fs';
import pdf from 'html-pdf';
import createHttpError from 'http-errors';
import { INTERNAL_SERVER_ERROR } from 'http-status';
import path from 'path';
import { promisify } from 'util';

import { PdfTemplate } from '@/types';

export class PdfService {
    constructor(private outName: string, private data: Record<string, any>) {}

    private async generatePdf(template: PdfTemplate) {
        const pathFileEjs = path.join(
            __dirname,
            `../../views/certificates/${template}.ejs`
        );
        const pathFilePdf = path.join(
            __dirname,
            `../../public/pdf/${this.outName}_${template}.pdf`
        );

        try {
            const readFileAsync = promisify(fs.readFile);
            await readFileAsync(pathFilePdf);

            return `${this.outName}_${template}.pdf`;
        } catch (_) {
            const html = await ejs.renderFile(pathFileEjs, { ...this.data });

            try {
                const createPdf = new Promise<string>((resolve, reject) => {
                    pdf.create(html, {
                        border: '10px',
                    }).toStream((err, stream) => {
                        if (err) reject(err);

                        stream.pipe(fs.createWriteStream(pathFilePdf));

                        setTimeout(
                            () => resolve(`${this.outName}_${template}.pdf`),
                            100
                        );
                    });
                });

                return createPdf;
            } catch (error) {
                throw createHttpError(
                    INTERNAL_SERVER_ERROR,
                    'There was an error when generate pdf. Try again later!'
                );
            }
        }
    }

    generateSuccessCertificate() {
        return this.generatePdf(PdfTemplate.CERTIFIED_SUCCESS);
    }

    generateFailureCertificate() {
        return this.generatePdf(PdfTemplate.CERTIFIED_FAILURE);
    }

    generateRevokedCertificate() {
        return this.generatePdf(PdfTemplate.CERTIFIED_REVOKED);
    }
}
