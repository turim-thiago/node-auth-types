(async () => {
  const [crypto, clipboardy] = await Promise.all([
    import('crypto'),
    import('clipboardy'),
  ]);
  const [method, endpoint, payload, secret] = process.argv.slice(2);
  const ptotocol = `${method}:${endpoint}:${payload}`; // Converte o texto para um buffer
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(ptotocol);
  const encryptedHex = hmac.digest('hex');
  await clipboardy.default.write(encryptedHex);
  console.log(
    `Hash gerado (METHOD:ENDPOINT:PAYLOAD em HEX) e copiado para a área de transferência, deve-se incluíno no header com o nome de x-hash-guard:\n \x1b[4m\x1b[34m${encryptedHex}\x1b[0m`
  );
})();
