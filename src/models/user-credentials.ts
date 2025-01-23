export class UserCredentials {
  id?: number;
  readonly username: string;
  readonly password: string;

  constructor({
    id,
    username,
    password,
  }: {
    id?: number;
    username: string;
    password: string;
  }) {
    this.id = id;
    this.username = username;
    this.password = password;
  }
}
