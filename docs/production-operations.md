# Operacao de Producao - Fila Delivery

Este documento descreve os cuidados minimos para operar o MVP SaaS do Fila Delivery em piloto comercial.

## Observabilidade

A API emite logs JSON em `stdout`. Cada log contem:

- `timestamp`
- `level`
- `message`
- `environment`
- `requestId`, quando originado por requisicao HTTP
- `userId` e `restaurantId`, quando autenticado
- `route`, `method`, `ipAddress` e `userAgent`

Campos sensiveis como senha, tokens, cookies e hashes sao removidos pelo logger.

Eventos atualmente registrados:

- inicializacao e encerramento da aplicacao;
- inicio e fim de requisicoes;
- erros esperados e inesperados;
- login e logout;
- recuperacao e troca de senha;
- criacao e atualizacao de restaurante;
- criacao, mudanca de status e exclusao logica de pedidos;
- criacao e exclusao logica de plataformas;
- backup concluido ou falho.

## Request ID

Cada requisicao recebe um `X-Request-Id`.

Se o cliente enviar `X-Request-Id`, a API reaproveita o valor. Caso contrario, gera um UUID. O mesmo identificador aparece no header da resposta e nos logs.

## Health Check

Endpoints publicos:

- `GET /health`: valida API online e conexao com banco.
- `GET /ready`: indica se a API esta pronta para receber trafego.
- `GET /version`: retorna nome, versao, build, ambiente e data.

## Backup

Comando:

```bash
npm run backup:api
```

Variaveis:

- `DATABASE_PATH`: banco SQLite de origem.
- `BACKUP_DIR`: pasta de destino dos backups.

O backup local:

1. cria a pasta de destino;
2. copia o arquivo SQLite;
3. calcula checksum SHA-256;
4. registra status, tamanho, checksum e caminho na tabela `backups`;
5. escreve evento no log estruturado.

## Restore

Procedimento recomendado:

1. parar a API;
2. copiar o banco atual para uma pasta segura;
3. substituir o arquivo configurado em `DATABASE_PATH` pelo backup escolhido;
4. iniciar a API;
5. validar `GET /health`;
6. acessar como ADMIN;
7. validar pedidos, restaurantes e dashboard.

Nunca execute restore enquanto a API estiver escrevendo no banco.

## Deploy com Docker

Arquivos:

- `apps/api/Dockerfile`
- `apps/web/Dockerfile`
- `apps/web/nginx.conf`
- `docker-compose.yml`

Passos:

```bash
cp .env.example .env
docker compose up --build
```

Volumes persistentes:

- `api-data`: banco SQLite.
- `api-backups`: backups locais.

Para producao real, configure HTTPS em um proxy externo ou no provedor.

## Variaveis obrigatorias em producao

- `NODE_ENV=production`
- `FILA_DELIVERY_TOKEN_SECRET`
- `SEED_ADMIN_PASSWORD`
- `CORS_ORIGIN`
- `DATABASE_PATH`
- `BACKUP_DIR`

Sem `FILA_DELIVERY_TOKEN_SECRET`, a API nao inicializa em producao.

## Testes de Aceite

Execute:

```bash
npm run test:api
npm run build:web
```

A suite da API valida:

- login ADMIN;
- login CLIENT;
- cadastro de restaurante;
- cadastro de plataforma;
- cadastro de pedido;
- pedido duplicado;
- mudanca para PRONTO;
- mudanca para ENTREGUE;
- soft delete;
- recuperacao de senha;
- sessao revogada;
- isolamento multi-tenant;
- dashboard admin;
- bloqueio de CLIENT no admin.

## Checklist de Piloto

- dominio configurado;
- HTTPS ativo;
- `.env` revisado;
- senha inicial do ADMIN trocada;
- backup testado;
- restore documentado e ensaiado;
- logs coletados pelo servidor/provedor;
- banco em volume persistente;
- teste automatizado verde;
- build frontend verde;
- politica de suporte definida;
- rotina manual de verificacao diaria definida.
