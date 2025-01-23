# node-auth-types

## Projeto visa demonstrar 4 abrodagens para autenticação em APIs.

<details>
	<summary><a href="#asymmetric-details">Assimétrica</a></summary>
	A autenticação <b>assimétrica</b> em APIs utiliza criptografia de chave pública (também conhecida como criptografia assimétrica) para garantir a segurança das comunicações entre clientes e servidores. Nesse modelo, são usadas duas chaves distintas:

    - Chave privada: Mantida em segredo e usada para assinar dados.
    - Chave pública: Compartilhada publicamente e usada para verificar as assinaturas.

</details>
<details>
	<summary><a href="#symmetric-details">Simétrica</a></summary>
	A autenticação <b>simétrica</b> em APIs utiliza um único segredo compartilhado entre o cliente e o servidor para autenticar solicitações e proteger a comunicação. Nesse modelo, a mesma chave é usada tanto para gerar quanto para validar assinaturas ou criptografar/descriptografar dados.

    Esse método é comum em APIs por sua simplicidade e eficiência, mas exige cuidados adicionais com o armazenamento e compartilhamento das chaves.

</details>
<details>
	<summary><a href="#api-key-details">API Key</a></summary>
	A autenticação com <b>API Key</b> é uma forma simples e amplamente usada para autenticar solicitações a APIs. Nesse modelo, o cliente (usuário ou aplicação) recebe uma chave única (API Key) que é enviada junto com cada solicitação para identificar e autenticar o emissor.
</details>
<details>
	<summary><a href="#api-token-details">API Token</a></summary>
	A autenticação com <b>API Token</b> é uma abordagem robusta e segura para autenticar e autorizar solicitações em APIs. O token é uma string única gerada pelo servidor após a validação inicial das credenciais do cliente. Ele é usado como prova de identidade em solicitações subsequentes.

    Essa técnica é amplamente utilizada em APIs modernas devido à sua flexibilidade e maior segurança em comparação com API Keys.

</details>

### 📂 Estrutura e diretórios

- **/keys** possui as chaves geradas para a autenticação Assimétrica;
- **/fixtures** possui os scripts para geração das chaves que devem ir para o **header** do request
- **/uploads diretório** onde ficam as chaves fornecidas no endpoint /asymmetric/register
- **/db** diretório com o banco de dados (SQLite)

<h3 id="asymmetric-details"> 🔐 Assimétrica</h3>

➡️ POST /asymmetric/register form-data

Registra chave pública e vincula a um `client-id`.

```
curl --location 'http://localhost:8888/asymmetric/register' \
--form 'file=@"/node-auth-types/keys/server_public_key.pem"' \
--form 'client="client-id-identification"'
```

Response 200 OK

```json
{
  "apiKey": "173eb289-242c-4527-8631-d02e5cb428ef"
}
```

🔑 <b>Gerar chave privada</b>

```
openssl genpkey -algorithm RSA -out chave_privada.pem -pkeyopt rsa_keygen_bits:2048
```

- algorithm RSA: Define o algoritmo;
- out chave_privada.pem: Nome do arquivo da chave privada;
- pkeyopt rsa_keygen_bits:2048: Tamanho da chave (2048 bits);

🔑 <b>Gerar chave pública</b>

```
openssl rsa -in chave_privada.pem -pubout -out chave_publica.pem
```

O **Api Key** deverá ser enviado no **header** para consumir o serviço que realiza a validação **assimétrica**.

➡️ POST /asymmetric

Envia dados para o serviço que irá executar a validação assimétrica.

```bash
curl --location 'http://localhost:8888/asymmetric' \
--header 'x-api-key: 173eb289-242c-4527-8631-d02e5cb428ef' \
--header 'x-safe-hash: nlFSiwBQgAYBYgj09WGpRTlcavONJR0QoKoFgm3mPpHHJBEbLs6g0YV44ul0mdJIDVFm6JdIelBcK+EcHOju0hg4R8rXg==' \
--header 'Content-Type: application/json' \
--data '{
    "value": "teste1"
}'
```

Response 200 OK

Para validação deve-se enviar alguns dados no header:

- **x-api-key** Api Key retornada no serviço de registro da chave pública `POST /asymmetric`;
- **x-safe-hash** Hash gerado pela chave privada, que o serviço `POST /asymmetric` irá utilizar para validar o request;

Para gerar o **HASH** necessário deve executar o script `generate-as-hash`, que possui a seguinte sintaxe `npm run generate-as-hash <METODO> <URL> <BODY>`

```bash
npm run generate-as-hash POST /asymetric {\"property\":\"value\"}
```

Após a execução o **HASH** será gerado e **copiado para a área de transferência do seu computador**, e deverá ser incluido no HEADER da requisição como `x-safe-hash`:

```bash
Hash gerado (METHOD:ENDPOINT:PAYLOAD em BASE64) e copiado para a área de transferência, deve-se incluíno no header com o nome de x-hash-guard:
 s2MhFLxUaH5151PzT97QlJ2obcPYyWH+kDm3kZrM/wZz3lLUumS9h8GS2wdvX/Oyy25zRzgE27W218/9tldR9
```

<h3 id="symmetric-details">🔒 Simétrica</h3>

➡️ POST /symmetric/register

Registra um client para validação simétrica.

```bash
curl --location 'http://localhost:8888/symmetric/register' \
--header 'Content-Type: application/json' \
--data '{
    "client": "client-id-identification"
}'
```

Response

```json
{
  "clientId": "ae301f54-1d5f-4d49-ab9c-39949d2518ab",
  "secretKey": "dd5f67a1-8c4c-4fb3-8e62-95daaedd92d6"
}
```

O **clienteId** será necessário enviar no **HEADER** para consumir o serviço e a **secretKey** será utilizada para gerar o HASH que também será enviado no **HEADER**.

➡️ POST /symmetric

Recebe dados e realizar a validação simétrica.

```bash
curl --location 'http://localhost:8888/symmetric' \
--header 'x-safe-hash: b4f223d463704e3068ff495a3373fdc1c1fac3af1ba378d4534fd888153df1dc' \
--header 'x-client-id: ae301f54-1d5f-4d49-ab9c-39949d2518ab' \
--header 'Content-Type: application/json' \
--data '{
    "value": "teste"
}'
```

Para validação deve-se enviar no HEADER:

- **x-cliente-id** Cliente id gerado no endpoint `POST /symmetric/register`;
- **x-safe-hash** Hash gerado pela secret retornada no endpoint `POST /symmetric/register`;

Para gerar o **HASH** necessário deve executar o script `generate-s-hash`, que possui a seguinte sintaxe `npm run generate-s-hash <METODO> <URL> <BODY> <SECRET>`

```bash
npm run generate-as-hash POST /asymetric {\"property\":\"value\"}
```

Após a execução o **HASH** será gerado e **copiado para a área de transferência do seu computador**, e deverá ser incluido no HEADER da requisição como `x-safe-hash`:

```bash
Hash gerado (METHOD:ENDPOINT:PAYLOAD em HEX) e copiado para a área de transferência, deve-se incluíno no header com o nome de x-hash-guard:
 ac8e0ecc4975f0c7ea101e21818b5e79a190a930f5ca79d0647589366e05922f
```

<h3 id="api-key-details">🔒 Api Key</h3>

➡️ POST /apikey/register

Registra um client para validação com **Api Key**.

```bash
curl --location 'http://localhost:8888/apiKey/register' \
--header 'Content-Type: application/json' \
--data '{
    "client": "client-id-identification"
}'
```

Response 200 OK

```json
{
  "apiKey": "ae301f54-1d5f-4d49-ab9c-39949d2518ab"
}
```

O **apiKey** será usado no HEADER do serviço que realiza a validação.

➡️ POST /apiKey

Envia dados para o serviço que irá executar a validação por Api Key.

```bash
curl --location 'http://localhost:8888/apiKey' \
--header 'x-api-key: 876bc61d-f17e-4976-953c-5ae0956ce345' \
--header 'Content-Type: application/json' \
--data '{
    "name": "ianfraser"
}'
```

Para validação deve-se enviar no HEADER:

- **x-api-key** Api key gerado no endpoint `POST apiKey/register`;

<h3 id="api-key-details">🔒 Api Token</h3>

➡️ POST /apiToken/register

Registra um usuário para validação com **Api Token**.

```bash
curl --location 'http://localhost:8888/apiToken/auth' \
--header 'Content-Type: application/json' \
--data '{
    "username": "ianfraser",
    "password": "p455w0r1d"
}'
```

Response 200 OK

➡️ POST /apiToken/auth

Retorna **Token JWT** para autenticação nos serviços.

```bash
curl --location 'http://localhost:8888/apiToken/auth' \
--header 'Content-Type: application/json' \
--data '{
    "username": "ianfraser",
    "password": "p455w0r1d"
}'
```

Response 200 OK

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiIjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT"
}
```

➡️ GET /apiToken

Serviço que recebe dados e executa a validação do **JWT Token**. Esse serviço irá realizar o decode do token e retornar o valor definido no atributo **username**.

```bash
curl --location 'http://localhost:8888/apiToken' \
--header 'Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiIjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT' \
--data ''
```

Para validação deve-se enviar no HEADER:

- **Authorization** JWT Token gerado no endpoint `POST /apiToken/auth`;

Response 200 OK

```json
{
  "username": "ianfraser"
}
```
