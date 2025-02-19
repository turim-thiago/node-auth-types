import { Connection } from '../../../src/database/connection';
import { UserCredentials } from '../../../src/models/user-credentials';
import { AuthApiTokenCredentials } from '../../../src/services/api-token/auth-api-token-credentials';
import { mock, MockProxy } from 'jest-mock-extended';

describe('AuthApiTokenCredentials', () => {
  let id: number;
  let username: string;
  let password: string;
  let secretKey: string;
  let expirationInSeconds: number;
  let connection: MockProxy<Connection>;
  let sut: AuthApiTokenCredentials;

  beforeAll(() => {
	id = 112233;
    username = 'any_username';
    password = 'any_p455w0rd';
	secretKey = 'any_secretkey';
	expirationInSeconds = 1;
    connection = mock<Connection>();
    connection.findUsernameAndPassword.mockResolvedValue(
      new UserCredentials({
        password,
        username,
        id,
      })
    );
  });

  beforeEach(() => {
    sut = new AuthApiTokenCredentials(
      secretKey,
      expirationInSeconds,
      connection
    );
  });

  it('should call connection with correct values', async () => {
    await sut.auth({ password, username });
    expect(connection.findUsernameAndPassword).toHaveBeenCalledWith({username, password});
  });
});
