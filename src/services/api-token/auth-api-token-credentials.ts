import { Connection } from '../../database/connection';
import jwt from 'jsonwebtoken';

export class AuthApiTokenCredentials {
  constructor(
    private readonly secretKey: string,
    private readonly expirationInSeconds: number,
    private readonly connection: Connection
  ) {}

  async auth({
    username,
    password,
  }: ApiTokenCredentialsInput): Promise<string> {
    const credenditals = await this.connection.findUsernameAndPassword({
      username,
      password,
    });
    if (!credenditals)
      throw new Error(`User ${username} creadentials not found.`);
    const payload = {
      username,
    };
    return jwt.sign(payload, this.secretKey, {
      expiresIn: this.expirationInSeconds,
    });
  }
}

export type ApiTokenCredentialsInput = {
  username: string;
  password: string;
};
