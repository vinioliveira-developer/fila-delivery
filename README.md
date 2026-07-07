# Fila Delivery

Fila Delivery e um SaaS web para organizar o fluxo de pedidos de restaurantes com alto volume de delivery, separando cozinha, conferencia, entrega, TVs operacionais e painel administrativo.

## Arquitetura

- `apps/api`: API Node.js ESM com `node:sqlite`, migrations, seeds, autenticao, auditoria, logs estruturados, backup e endpoints de saude.
- `apps/web`: frontend React/Vite com layouts separados para restaurante e administrador.
- `docs`: documentacao tecnica do banco e operacao.

## Requisitos locais

- Node.js 24 ou superior para suporte ao `node:sqlite`.
- npm.

## Configuracao

1. Copie `.env.example` para `.env`.
2. Troque `FILA_DELIVERY_TOKEN_SECRET` por uma chave forte.
3. Defina `SEED_ADMIN_PASSWORD` antes de subir um ambiente novo.
4. Ajuste `CORS_ORIGIN` para o dominio real em producao.

## Primeiro acesso ADMIN

Na inicializacao, a API executa migrations e depois roda os seeds. O seed
`apps/api/src/database/seeds/adminSeed.js` cria o primeiro usuario ADMIN quando
nao existe nenhum usuario com role `ADMIN`.

Configure estas variaveis no `.env` antes de iniciar a API pela primeira vez:

```bash
SEED_ADMIN_NAME=Administrador Fila Delivery
SEED_ADMIN_EMAIL=admin@filadelivery.com.br
SEED_ADMIN_PASSWORD=troque-esta-senha
```

Depois acesse o login com o e-mail e senha definidos acima. Se o banco ja
existir mas ainda nao houver ADMIN, basta definir `SEED_ADMIN_PASSWORD` e
reiniciar a API; o seed sera executado novamente.

## Desenvolvimento

```bash
npm install
npm run dev:api
npm run dev:web
```

A API sobe por padrao em `http://localhost:3333` e o web em `http://localhost:5173`.

## Scripts principais

```bash
npm run start:api
npm run build:web
npm run backup:api
```

## Endpoints operacionais

- `GET /health`: status da API, conexao com banco, versao, ambiente e timestamp.
- `GET /ready`: indica se a aplicacao esta pronta para receber requisicoes.
- `GET /version`: nome, versao, build, ambiente e data.

Todas as respostas da API seguem o envelope padrao:

```json
{
  "success": true,
  "message": "...",
  "data": {}
}
```

## Banco de dados

O SQLite continua sendo o banco principal do MVP. O schema e criado por migrations versionadas em `apps/api/src/database/migrations`.

Fluxo:

1. A API executa migrations na inicializacao.
2. Seeds essenciais sao aplicados sem duplicar dados existentes.
3. Alteracoes futuras devem ser feitas sempre por novas migrations.

Mais detalhes: `docs/database-architecture.md`.

## Backup

Para gerar backup local:

```bash
npm run backup:api
```

O backup copia o arquivo SQLite configurado em `DATABASE_PATH` para `BACKUP_DIR`, calcula checksum SHA-256 e registra o resultado na tabela `backups`.

## Restore

1. Pare a API.
2. Guarde uma copia do banco atual.
3. Copie o arquivo de backup desejado para o caminho definido em `DATABASE_PATH`.
4. Inicie a API.
5. Valide `GET /health` e faca login como ADMIN.

Nunca restaure backup com a API escrevendo no banco.

## Docker

1. Copie `.env.example` para `.env`.
2. Ajuste segredos e senha inicial.
3. Execute:

```bash
docker compose up --build
```

O frontend ficara em `http://localhost:8080`. O banco e os backups usam volumes persistentes (`api-data` e `api-backups`).

## Deploy

Checklist minimo:

- Dominio proprio configurado.
- HTTPS ativo no proxy ou provedor.
- `NODE_ENV=production`.
- `FILA_DELIVERY_TOKEN_SECRET` forte.
- `CORS_ORIGIN` restrito ao dominio do frontend.
- Volumes persistentes para banco e backups.
- Rotina externa para copiar backups para armazenamento fora do servidor.
- Monitoramento dos logs JSON da API.

## Seguranca

- Tokens de sessao e recuperacao sao persistidos apenas como hash.
- Logout revoga sessao no banco.
- Rate limit protege login.
- Rotas ADMIN e CLIENT sao isoladas por middleware.
- Dados multi-tenant usam `restaurant_id`.
- Logs estruturados removem campos sensiveis.

## Testes

A suite automatizada da API cobre os fluxos criticos do MVP. Execute:

```bash
npm run test:api
```

Para validar o frontend:

```bash
npm run build:web
```
