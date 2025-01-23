import { Connection } from '../../database/connection';
import { UserCredentials } from '../../models/user-credentials';

export class RegisterUserCredentials {
  constructor(private readonly connection: Connection) {}

  async register({
    username,
    password
  }: RegisterApiCredentialsInput): Promise<void> {
    this.connection.insertUser(
      new UserCredentials({
        username: username,
        password: password,
      })
    );
  }
}

export type RegisterApiCredentialsInput = {
  username: string;
  password: string;
};
