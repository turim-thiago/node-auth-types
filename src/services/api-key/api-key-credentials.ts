import { Connection } from '../../database/connection';
import { AuthCredentialRepository } from '../../database/repositories/auth-credential-repository';

export class ApiKeyCredentials {
  constructor(
    private readonly authCredentialRepository: AuthCredentialRepository
  ) {}

  async validate({
    apiKey,
  }: RegisterAssymmetricCredentialsInput): Promise<boolean> {
    const credenditals = await this.authCredentialRepository.findByApiKey({ apiKey });
    if (!credenditals) throw new Error(`Apikey ${apiKey} not found.`);
    return apiKey === credenditals.apiKey;
  }
}

export type RegisterAssymmetricCredentialsInput = {
  apiKey: string;
};
