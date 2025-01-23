import { AuthCredential } from '../../models/auth-credential';
import { AuthCredentialType } from '../../models/auth-credential-type';
import { Connection } from '../connection';

export class AuthCredentialRepository {
  constructor(private readonly connection: Connection) {}

  public async findByApiKey({
    apiKey,
  }: {
    apiKey: string;
  }): Promise<AuthCredential | undefined> {
    const row = await this.connection.query({
      query: 'SELECT * FROM auth_credentials WHERE tx_api_key = ?',
      args: [apiKey],
    });
    return new AuthCredential({
      id: row.id_auth,
      name: row.nm_client,
      key: row.tx_key,
      apiKey: row.tx_api_key,
      clientId: row.client_id,
      type: AuthCredentialType[
        row.tp_credential as keyof typeof AuthCredentialType
      ],
    });
  }
}
