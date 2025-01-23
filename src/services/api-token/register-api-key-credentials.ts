import {  randomUUID } from 'crypto';
import { AuthCredential } from '../../models/auth-credential';
import { AuthCredentialType } from '../../models/auth-credential-type';
import { Connection } from '../../database/connection';

export class RegisterApiKeyCredentials {
  constructor(private readonly connection: Connection) {}

  async register({
    client,
  }: RegisterApiCredentialsInput): Promise<{ apiKey: string }> {
    const apiKey = randomUUID();
    const clientId = randomUUID();
    this.connection.insert(
      new AuthCredential({
        name: client,
        key: apiKey,
        apiKey,
        clientId,
        type: AuthCredentialType.API_KEY,
      })
    );
    return { apiKey };
  }
}

export type RegisterApiCredentialsInput = {
  client: string;
};
