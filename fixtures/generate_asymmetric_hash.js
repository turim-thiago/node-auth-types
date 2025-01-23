(async () => {
  const [fs, path, crypto, clipboardy, yargs, yargshelpers] = await Promise.all(
    [import('fs'), import('path'), import('crypto'), import('clipboardy')]
  );
  const [method, endpoint, payload] = process.argv.slice(2);
  const publicKeyPath = path.resolve(
    __dirname,
    '..',
    'keys',
    'server_private_key.pem'
  );
  const publicKey = fs.readFileSync(publicKeyPath, 'utf8');
  const buffer = Buffer.from(`${method}:${endpoint}:${payload}`, 'utf8'); // Converte o texto para um buffer
  const encrypted = crypto.privateEncrypt(publicKey, buffer); // Criptografa com a chave pública
  const encryptedBase64 = encrypted.toString('base64');
  await clipboardy.default.write(encryptedBase64);
  console.log(
    `Hash gerado (METHOD:ENDPOINT:PAYLOAD em BASE64) e copiado para a área de transferência, deve-se incluíno no header com o nome de x-hash-guard:\n \x1b[4m\x1b[34m${encryptedBase64}\x1b[0m`
  );
})();
