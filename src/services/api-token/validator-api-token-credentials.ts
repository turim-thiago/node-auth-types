import jwt from 'jsonwebtoken';
import { AuthToken } from '../../models/auth-token';

export class ValidatorApiTokenCredentials {
  constructor(
    private readonly secretKey: string,
  ) {}

  async validate({ token }: ApiTokenCredentialsInput): Promise<AuthToken | undefined> {
    try {
      const decoded = jwt.verify(token, this.secretKey) as {
        username: string;
        exp: number;
      };
      return new AuthToken({
        username: decoded.username,
        expiresInSeconds: decoded.exp,
      });
    } catch (err) {
      return undefined;
    }
  }
}

export type ApiTokenCredentialsInput = {
  token: string;
};
