import { UUID, randomUUID } from 'crypto';
import { Connection } from '../../database/connection';
import { AuthCredential } from '../../models/auth-credential';
import { AuthCredentialType } from '../../models/auth-credential-type';

export class RegisterAssymmetricCredentials {
  constructor(private readonly connection: Connection) {}

  async register({
    client,
    publicKey,
  }: RegisterAssymmetricCredentialsInput): Promise<{ apiKey: string }> {
    const apiKey = randomUUID();
    const clientId = randomUUID();
    this.connection.insert(
      new AuthCredential({
        name: client,
        key: publicKey,
        apiKey,
        clientId,
        type: AuthCredentialType.ASYMMETRIC,
      })
    );
    return { apiKey };
  }
}

export type RegisterAssymmetricCredentialsInput = {
  client: string;
  publicKey: string;
};
