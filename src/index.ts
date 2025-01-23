import 'dotenv/config';
import { readFileSync } from 'fs';
import express, { Request, Response, Router } from 'express';
import connection from './database/connection';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

import { AsymmetricAuth } from './services/asymmetric-auth/asymmetric-auth';
import { SymmetricAuth } from './services/symmetric-auth/symmetric-auth';
import { ApiKeyCredentials } from './services/api-key/api-key-credentials';
import { RegisterApiKeyCredentials } from './services/api-token/register-api-key-credentials';
import { AuthApiTokenCredentials } from './services/api-token/auth-api-token-credentials';
import { ValidatorApiTokenCredentials } from './services/api-token/validator-api-token-credentials';
import { RegisterAssymmetricCredentials } from './services/asymmetric-auth/register-assymmetric-credentials';
import { RegisterSymmetricCredentials } from './services/symmetric-auth/register-symmetric-credentials';
import { RegisterUserCredentials } from './services/api-token/register-user-credentials';
import { AuthCredentialRepository } from './database/repositories/auth-credential-repository';

connection.connect();

const authCredentialRepository = new AuthCredentialRepository(connection);
const privateKey = readFileSync('./keys/server_private_key.pem');
const asymmetricAuth = new AsymmetricAuth(privateKey);
const registerAssymmetricCredentials = new RegisterAssymmetricCredentials(
  connection
);

const symmetricAuth = new SymmetricAuth();
const registerSymmetricCredentials = new RegisterSymmetricCredentials(
  connection
);

const router = Router();
router.get('/health', (req: Request, res: Response) => {
  res.json({ health: 'OK' });
});
const upload = multer({
  dest: path.join(__dirname, '..', 'uploads'),
});

router.post(
  '/asymmetric/register',
  upload.single('file'),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        res.status(400).json({ message: 'Public key file is required.' });
        return;
      }
      const { client } = req.body;
      const isExists = await connection.find({ client });
      console.log(isExists);
      if (isExists) {
        res.status(400).json({ message: `Client ${client} already exists.` });
        return;
      }
      const filePath = req.file.path;
      const data = fs.readFileSync(filePath);
      const base64Data = data.toString('base64');
      const { apiKey } = await registerAssymmetricCredentials.register({
        client,
        publicKey: base64Data,
      });
      fs.unlinkSync(filePath);
      res.status(200).json({
        apiKey,
      });
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }
);

router.post('/asymmetric', async (req: Request, res: Response) => {
  try {
    const apiKey = req.headers['x-api-key'] as string;
    if (!apiKey) {
      res.status(400).json({ message: 'Apikey is required.' });
      return;
    }
    const safeHash = req.headers['x-safe-hash'] as string;
    if (!safeHash) {
      res.status(400).json({ message: 'Safe hash header is required.' });
      return;
    }
    const credenditals = await connection.findByApiKey({ apiKey });
    if (!credenditals) {
      res.status(400).json({ message: 'Apikey not exists.' });
      return;
    }
    const protocol = `${req.method}:${req.originalUrl}:${JSON.stringify(req.body)}`;
    const publicKey = Buffer.from(credenditals.key, 'base64').toString('utf-8');
    const decryptedHash = asymmetricAuth.decrypt2(safeHash, publicKey);
    const result = protocol === decryptedHash;
    if (!result) {
      res.status(401).json();
      return;
    }
    res.status(204).json();
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error });
  }
});

router.post('/symmetric/register', async (req: Request, res: Response) => {
  try {
    const { client } = req.body;
    if (!client) {
      res.status(400).json({ message: 'Client is required.' });
      return;
    }
    const { clientId, secretKey } = await registerSymmetricCredentials.register(
      {
        client,
      }
    );
    res.status(200).json({ clientId, secretKey });
  } catch (error) {
    res.status(500).json({ message: error });
  }
});

router.post('/symmetric', async (req: Request, res: Response) => {
  try {
    const clientId = req.headers['x-client-id'] as string;
    if (!clientId) {
      res.status(400).json({ message: 'Client header is required.' });
      return;
    }
    const safeHash = req.headers['x-safe-hash'] as string;
    if (!safeHash) {
      res.status(400).json({ message: 'Safe hash header is required.' });
      return;
    }
    const credenditals = await connection.findByClientId({ clientId });
    if (!credenditals) {
      res.status(400).json({ message: 'Client not exists.' });
      return;
    }
    const protocol = `${req.method}:${req.originalUrl}:${JSON.stringify(req.body)}`;
    const isValid = symmetricAuth.validate(
      protocol,
      safeHash,
      credenditals.key
    );
    if (!isValid) {
      res.status(401).json();
      return;
    }
    res.status(204).json();
  } catch (error) {
    res.status(500).json({ message: error });
  }
});

const registerApiKeyCredentials = new RegisterApiKeyCredentials(connection);
router.post('/apikey/register', async (req: Request, res: Response) => {
  try {
    const { client } = req.body;
    if (!client) {
      res.status(400).json({ message: 'Client is required.' });
      return;
    }
    const { apiKey } = await registerApiKeyCredentials.register({
      client,
    });
    res.status(200).json({ apiKey });
  } catch (error) {
    res.status(500).json({ message: error });
  }
});

const apiKeyCredentials = new ApiKeyCredentials(authCredentialRepository);
router.post('/apiKey', async (req: Request, res: Response) => {
  try {
    const apiKey = req.headers['x-api-key'] as string;
    if (!apiKey) {
      res.status(400).json({ message: 'ApiKey header is required.' });
      return;
    }
    const credenditals = await connection.findByApiKey({ apiKey });
    if (!credenditals) {
      res.status(400).json({ message: 'Client not exists.' });
      return;
    }
    const isValid = apiKeyCredentials.validate({ apiKey });
    if (!isValid) {
      res.status(400).json();
      return;
    }
    res.status(204).json();
  } catch (error) {
    res.status(500).json({ message: error });
  }
});

const registerUserCredentials = new RegisterUserCredentials(connection);
router.post('/apiToken/register', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username) {
      res.status(400).json({ message: 'Username is required.' });
      return;
    }
    if (!password) {
      res.status(400).json({ message: 'Password is required.' });
      return;
    }
    await registerUserCredentials.register({
      username,
      password,
    });
    res.status(204).json();
  } catch (error) {
    res.status(500).json({ message: error });
  }
});

const secretKey = process.env.API_TOKEN_SECRET_KEY;
const expirationInSeconds = process.env.API_TOKEN_EXPIRATIONS_IN_SECONDS;
if (!secretKey || !expirationInSeconds)
  throw new Error(`SecretKey and Expirations token not defined.`);
const authApiTokenCredentials = new AuthApiTokenCredentials(
  secretKey,
  Number(expirationInSeconds),
  connection
);
router.post('/apiToken/auth', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username) {
      res.status(400).json({ message: 'Username is required.' });
      return;
    }
    if (!password) {
      res.status(400).json({ message: 'Password is required.' });
      return;
    }
    const token = await authApiTokenCredentials.auth({
      username,
      password,
    });
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: error });
  }
});

const validatorApiTokenCredentials = new ValidatorApiTokenCredentials(
  secretKey
);
router.get('/apiToken', async (req: Request, res: Response) => {
  try {
    const token = req.headers['authorization'] as string;
    if (!token) {
      res.status(400).json({ message: 'Token header is required.' });
      return;
    }
    const decodedToken = await validatorApiTokenCredentials.validate({
      token,
    });
    if (!decodedToken) {
      res.status(401).json();
      return;
    }
    res.status(200).json({
      username: decodedToken?.username,
    });
  } catch (error) {
    res.status(500).json({ message: error });
  }
});

const PORT = process.env.API_PORT;
const app = express();
app.use(express.json());
app.use(express.text());
app.use(router);

app.listen(PORT, () => {
  console.log(`Server starting at port ${PORT}`);
});
