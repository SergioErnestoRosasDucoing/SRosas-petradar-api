import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { envs } from 'src/config/envs';

export interface EmailOptions {
    to: string;
    subject: string;
    htmlBody: string;
}

@Injectable()
export class EmailService {
    private transporter = nodemailer.createTransport({
        service: envs.MAILER_SERVICE,
        auth: {
            user: envs.MAILER_EMAIL,
            pass: envs.MAILER_PASSWORD
        }
    });

    async sendEmail(options: EmailOptions): Promise<boolean> {
        try {
            await this.transporter.sendMail({
                to: options.to,
                subject: options.subject,
                html: options.htmlBody,
            });
            console.log(`[EmailService] Correo enviado exitosamente a: ${options.to}`);
            return true;
        } catch (error) {
            console.error('[EmailService] Error al enviar el correo:', error);
            return false;
        }
    }
}