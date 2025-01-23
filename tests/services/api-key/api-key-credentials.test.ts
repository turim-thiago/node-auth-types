import { ApiKeyCredentials } from '../../../src/services/api-key/api-key-credentials';
import { Connection } from '../../../src/database/connection';
import { mock, MockProxy } from 'jest-mock-extended';
import { AuthCredential } from '../../../src/models/auth-credential';
import { AuthCredentialType } from '../../../src/models/auth-credential-type';
import { AuthCredentialRepository } from '../../../src/database/repositories/auth-credential-repository';

describe('ApiKeyCredentials', () => {
  let id: number;
  let name: string;
  let key: string;
  let clientId: string;
  let type: AuthCredentialType;
  let apiKey: string;
  let authCredentialRepository: MockProxy<AuthCredentialRepository>;
  let sut: ApiKeyCredentials;

  beforeAll(() => {
	id =  1;
	name = 'any_credential_name';
	key = 'any_key';
	clientId = 'any_client_id';
	type = AuthCredentialType.API_KEY;
    apiKey = 'any_api_key';
    authCredentialRepository = mock<AuthCredentialRepository>();
    authCredentialRepository.findByApiKey.mockResolvedValue(
      new AuthCredential({ id, name, key, apiKey, clientId, type })
    );
    sut = new ApiKeyCredentials(authCredentialRepository);
  });

  it('should call connection with correct values', async () => {
    await sut.validate({ apiKey });
    expect(authCredentialRepository.findByApiKey).toHaveBeenCalledWith({ apiKey });
  });

  it('should throw error id connection returns undefined', async () => {
    authCredentialRepository.findByApiKey.mockResolvedValue(undefined);
    const promise = sut.validate({ apiKey });
    await expect(promise).rejects.toThrow();
  });
});
