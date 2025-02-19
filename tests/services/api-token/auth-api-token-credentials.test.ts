import { Connection } from '../../../src/database/connection';
import { UserCredentials } from '../../../src/models/user-credentials';
import { AuthApiTokenCredentials } from '../../../src/services/api-token/auth-api-token-credentials';

import jwt from 'jsonwebtoken';
import { mock, MockProxy } from 'jest-mock-extended';

jest.mock('jsonwebtoken');

describe('AuthApiTokenCredentials', () => {
  let id: number;
  let username: string;
  let password: string;
  let secretKey: string;
  let expirationInSeconds: number;
  let fakeJwt: jest.Mocked<typeof jwt>;
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
    fakeJwt = jwt as jest.Mocked<typeof jwt>;
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
    expect(connection.findUsernameAndPassword).toHaveBeenCalledWith({
      username,
      password,
    });
  });

  it('should throw error id connection returns undefined', async () => {
    connection.findUsernameAndPassword.mockResolvedValueOnce(undefined);
    const promise = sut.auth({ password, username });
    expect(promise).rejects.toThrow();
  });

  it('should call jwt.sign with correct values', async () => {
    await sut.auth({ password, username });
    expect(jwt.sign).toHaveBeenCalledWith({ username }, secretKey, {
      expiresIn: expirationInSeconds,
    });
  });
});
