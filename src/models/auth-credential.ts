import { AuthCredentialType } from "./auth-credential-type";

export class AuthCredential {
  id?: number;
  name: string;
  key: string;
  apiKey?: string;
  clientId: string;
  type: AuthCredentialType;

  constructor({
    id,
    name,
    key,
    apiKey,
    clientId,
    type
  }: {
    id?: number;
    name: string;
    key: string;
    apiKey?: string;
    clientId: string
    type : AuthCredentialType
  }) {
    this.id = id;
    this.name = name;
    this.key = key;
    this.apiKey = apiKey;
    this.type = type;
    this.clientId = clientId;
  }
}
