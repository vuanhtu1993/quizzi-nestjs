import { Injectable } from '@nestjs/common';

/**
 * @file email.service.ts
 * @description Interface và hai concrete implementation cho ví dụ useClass.
 *
 * ẨN DỤ: IEmailService là "hợp đồng" (contract).
 * RealEmailService là nhà thầu thật, MockEmailService là nhà thầu giả để test.
 * Module quyết định thuê ai — service dùng nó hoàn toàn không quan tâm.
 */

// ─── Contract / Interface ──────────────────────────────────────────────────
export const EMAIL_SERVICE = 'EMAIL_SERVICE';

export interface IEmailService {
    send(to: string, subject: string): string;
}

// ─── Production Implementation ─────────────────────────────────────────────
@Injectable()
export class RealEmailService implements IEmailService {
    send(to: string, subject: string): string {
        // Trong thực tế: gọi AWS SES, SendGrid, Nodemailer, v.v.
        const msg = `[REAL EMAIL] → ${to} | Subject: "${subject}"`;
        console.log(msg);
        return msg;
    }
}

// ─── Mock Implementation (dùng trong test / dev) ───────────────────────────
@Injectable()
export class MockEmailService implements IEmailService {
    send(to: string, subject: string): string {
        // Không gửi email thật, an toàn để chạy trong CI/CD
        const msg = `[MOCK EMAIL] Giả vờ gửi → ${to} | Subject: "${subject}"`;
        console.log(msg);
        return msg;
    }
}
