import {  randomUUID } from 'crypto';
import { Connection } from '../../database/connection';
import { AuthCredential } from '../../models/auth-credential';
import { AuthCredentialType } from '../../models/auth-credential-type';

export class RegisterSymmetricCredentials {
  constructor(private readonly connection: Connection) {}

  async register({
    client,
  }: RegisterSymmetricCredentialsInput): Promise<{ clientId: string, secretKey: string }> {
    const secretKey = randomUUID();
    const clientId = randomUUID();
    this.connection.insert(
      new AuthCredential({
        name: client,
        key: secretKey,
        clientId,
        type: AuthCredentialType.SYMMETRIC,
      })
    );
    return { clientId, secretKey };
  }
}

export type RegisterSymmetricCredentialsInput = {
  client: string;
};
