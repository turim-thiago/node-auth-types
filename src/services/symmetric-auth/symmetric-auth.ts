import { createHmac, timingSafeEqual } from 'crypto';

export class SymmetricAuth {
  constructor() {}

  generate(message: string, secret: string): string {
    const hmac = createHmac('sha256', secret);
    hmac.update(message);
    return hmac.digest('hex');
  }

  validate(message: string, hmac: string, secret: string) : boolean{
    const generatedHmac = this.generate(message, secret);
    return timingSafeEqual(Buffer.from(hmac), Buffer.from(generatedHmac));
  }
}
