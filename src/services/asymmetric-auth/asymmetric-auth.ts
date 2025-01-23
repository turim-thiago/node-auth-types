import { privateDecrypt, publicEncrypt, publicDecrypt } from "crypto";

export class AsymmetricAuth{

	constructor(private readonly privateKey: Buffer){

	}

	crypt(text: string, publicKey: string) : string{
		const buffer = Buffer.from(text, 'utf8');
		const encrypted = publicEncrypt(publicKey, buffer);
		return encrypted.toString('base64'); 
	}

	decrypt(encryptedText: string) : string{
		const buffer = Buffer.from(encryptedText, 'base64');
		const decrypted = privateDecrypt(this.privateKey, buffer);
		return decrypted.toString('utf8');
	}

	decrypt2(encryptedText: string, key: string) : string{
		const buffer = Buffer.from(encryptedText, 'base64');
		const decrypted = publicDecrypt(key, buffer);
		return decrypted.toString('utf8');
	}
}