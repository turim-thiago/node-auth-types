import sqlite3, { Database, Statement } from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { AuthCredential } from '../models/auth-credential';
import { UserCredentials } from '../models/user-credentials';

interface DbAuthCredential {
  id_auth: number;
  nm_client: string;
  client_id: string;
  tp_credential: string;
  tx_key: string;
  tx_api_key: string;
}

interface DbUserCredential {
  id_usercredential: number;
  ds_username: string;
  ds_password: string;
}

export class Connection {
  private connection!: Database;

  async connect(): Promise<void> {
    this.connection = new sqlite3.Database(path.resolve('db', 'database.db'));
    this.connection.exec(`CREATE TABLE IF NOT EXISTS auth_credentials (
    							id_auth INTEGER PRIMARY KEY AUTOINCREMENT,
									nm_client TEXT NOT NULL,
                  client_id TEXT NOT NULL,
                  tp_credential TEXT NOT NULL,
									tx_key TEXT NOT NULL,
									tx_api_key TEXT NULL
								);`);

    this.connection.exec(`CREATE TABLE IF NOT EXISTS user_credentials (
                    id_usercredential INTEGER PRIMARY KEY AUTOINCREMENT,
                    ds_username TEXT NOT NULL,
                    ds_password TEXT NOT NULL
                );`);
  }

  async query({query, args}: {query: string, args: any[]}) : Promise<DbAuthCredential>{
    return new Promise<DbAuthCredential>((resolve, reject) => {
			 this.connection.get(
			  query,
			  args,
			  (err, rows : DbAuthCredential) => {
				if (err) return reject(err);
				return resolve(rows);
			  }
			);
		  })
  }

  async insert(credential: AuthCredential): Promise<void> {
    this.connection.run(
      `INSERT INTO auth_credentials (nm_client, tx_key, tx_api_key, tp_credential, client_id)
								VALUES (?, ?, ?, ?, ?);
						`,
      [
        credential.name,
        credential.key,
        credential.apiKey,
        credential.type,
        credential.clientId,
      ]
    );
  }

  async find({
    client,
  }: {
    client: string;
  }): Promise<AuthCredential | undefined> {
    const rows = await new Promise<any>((resolve, reject) => {
      this.connection.get(
        `SELECT * FROM auth_credentials WHERE nm_client = ?`,
        [client],
        (err, rows) => {
          if (err) return reject(err);

          return resolve(rows);
        }
      );
    }).finally(() => {});
    if (!rows) return undefined;
    return new AuthCredential({
      id: rows.id_auth,
      name: rows.nm_client,
      key: rows.tx_key,
      apiKey: rows.tx_api_key,
      clientId: rows.client_id,
      type: rows.tp_credential,
    });
  }

  async findByApiKey({
    apiKey,
  }: {
    apiKey: string;
  }): Promise<AuthCredential | undefined> {
    const rows = await new Promise<any>((resolve, reject) => {
      this.connection.get(
        `SELECT * FROM auth_credentials WHERE tx_api_key = ?`,
        [apiKey],
        (err, rows) => {
          if (err) return reject(err);

          return resolve(rows);
        }
      );
    }).finally(() => {});
    if (!rows) return undefined;
    return new AuthCredential({
      id: rows.id_auth,
      name: rows.nm_client,
      key: rows.tx_key,
      apiKey: rows.tx_api_key,
      clientId: rows.client_id,
      type: rows.tp_credential,
    });
  }

  async findByClientId({
    clientId,
  }: {
    clientId: string;
  }): Promise<AuthCredential | undefined> {
    const rows = await new Promise<any>((resolve, reject) => {
      this.connection.get(
        `SELECT * FROM auth_credentials WHERE client_id = ?`,
        [clientId],
        (err, rows) => {
          if (err) return reject(err);

          return resolve(rows);
        }
      );
    }).finally(() => {});
    if (!rows) return undefined;
    return new AuthCredential({
      id: rows.id_auth,
      name: rows.nm_client,
      key: rows.tx_key,
      apiKey: rows.tx_api_key,
      clientId: rows.client_id,
      type: rows.tp_credential,
    });
  }

  async findUsernameAndPassword({
    username,
    password,
  }: {
    username: string;
    password: string;
  }): Promise<UserCredentials | undefined> {
    console.log(username, password)
    const rows = await new Promise<DbUserCredential>((resolve, reject) => {
      this.connection.get<DbUserCredential>(
        `SELECT * FROM user_credentials WHERE ds_username = ? and ds_password = ?`,
        [username, password],
        (err, rows) => {
          if (err) return reject(err);
          return resolve(rows);
        }
      );
    }).finally(() => {});
    if (!rows) return undefined;
    return new UserCredentials({
      id: rows.id_usercredential,
      username: rows.ds_username,
      password: rows.ds_password,
    });
  }

  async insertUser(credendital: UserCredentials): Promise<void> {
    this.connection.run(
      `INSERT INTO user_credentials (ds_username, ds_password)
								VALUES (?, ?);
						`,
      [credendital.username, credendital.password]
    );
  }

  async close(): Promise<void> {
    this.connection.close();
  }
}

const connection = new Connection();
export default connection;
