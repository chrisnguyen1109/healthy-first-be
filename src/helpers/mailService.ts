import ejs from 'ejs';
import { htmlToText } from 'html-to-text';
import createHttpError from 'http-errors';
import { INTERNAL_SERVER_ERROR } from 'http-status';
import nodemailer from 'nodemailer';
import path from 'path';

import {
    EMAIL_FROM,
    ENV,
    MAILTRAP_HOST,
    MAILTRAP_PASS,
    MAILTRAP_PORT,
    MAILTRAP_USER,
    SENDGRID_PASSWORD,
    SENDGRID_USERNAME,
} from '@/config';
import { MailTemplate } from '@/types';

interface MailData {
    subject: string;
    [key: string]: any;
}

export class MailService {
    constructor(private email: string, private data: MailData) {}

    // eslint-disable-next-line class-methods-use-this
    private createTransport() {
        if (ENV === 'development') {
            return nodemailer.createTransport({
                host: MAILTRAP_HOST,
                port: MAILTRAP_PORT,
                auth: {
                    user: MAILTRAP_USER,
                    pass: MAILTRAP_PASS,
                },
            });
        }

        return nodemailer.createTransport({
            service: 'SendGrid',
            auth: {
                user: SENDGRID_USERNAME,
                pass: SENDGRID_PASSWORD,
            },
        });
    }

    private async sendMail(template: MailTemplate) {
        try {
            const mailPath = path.join(
                __dirname,
                `../../views/emails/${template}.ejs`
            );

            const html = await ejs.renderFile(mailPath, {
                ...this.data,
            });

            const mailOptions = {
                from: EMAIL_FROM,
                to: this.email,
                subject: this.data.subject,
                html,
                text: htmlToText(html),
            };

            const transporter = this.createTransport();

            await transporter.sendMail(mailOptions);
        } catch (_) {
            throw createHttpError(
                INTERNAL_SERVER_ERROR,
                'There was an error when sending the email. Try again later!'
            );
        }
    }

    sendWelcomeEmail() {
        return this.sendMail(MailTemplate.WELCOME);
    }
}
