export class AuthToken {
  readonly username: string;
  readonly expiresInSeconds: number;

  constructor({
    username,
    expiresInSeconds,
  }: {
    username: string;
    expiresInSeconds: number;
  }) {
    this.expiresInSeconds = expiresInSeconds;
    this.username = username;
  }
}
