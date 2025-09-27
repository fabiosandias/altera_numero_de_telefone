# API de consultas PostgreSQL

Esta aplicação expõe três endpoints HTTP em Node.js/Express que consultam um banco de dados PostgreSQL e retornam os registros das tabelas `history`, `conversation` e `rental`.

## Pré-requisitos

- Node.js 18 ou superior
- Banco de dados PostgreSQL acessível com as tabelas necessárias

## Configuração

1. Copie o arquivo `.env.example` para `.env` e ajuste as variáveis de conexão com o banco:

   ```bash
   cp .env.example .env
   ```

2. Instale as dependências do projeto:

   ```bash
   npm install
   ```

## Execução

Inicie o servidor com:

```bash
npm start
```

O serviço ficará disponível em `http://localhost:3000` (ou na porta definida pela variável `PORT`).

### Endpoints

- `GET /history` – retorna todos os registros da tabela `history`.
- `GET /conversation` – retorna todos os registros da tabela `conversation`.
- `GET /rental` – retorna todos os registros da tabela `rental`.

As respostas são fornecidas em formato JSON. Em caso de erro na consulta ao banco de dados, o serviço retorna o status HTTP `500` com uma mensagem de erro.
