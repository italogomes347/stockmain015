# StockMain

Sistema web de gestão de estoque desenvolvido com React, JavaScript e Vite.

## Funcionalidades

- Cadastro de produtos com código, categoria, quantidade, estoque mínimo e preço.
- Consulta e pesquisa de produtos.
- Cálculo do valor total do estoque.
- Identificação de produtos com estoque baixo ou zerado.
- Registro de entradas e saídas, com bloqueio de saídas acima do saldo disponível.
- Histórico de atividades por conta.
- Relatórios com indicadores calculados a partir dos dados armazenados.
- Cadastro e login próprios do StockMain por e-mail e senha.

## Tecnologias

- React 19
- JavaScript ES6+
- Vite 6
- CSS
- Vercel Functions
- Google Drive API para armazenamento de arquivos JSON

## Armazenamento e autenticação

O projeto não utiliza banco de dados. Os dados de cada conta são armazenados em arquivos JSON no Google Drive da aplicação.

O usuário final não precisa conectar uma conta Google, fazer login com Google ou autorizar acesso ao próprio Drive. A aplicação acessa uma pasta do Drive por meio de uma conta técnica configurada exclusivamente no servidor.

As senhas não são armazenadas em texto aberto. O backend gera hash com scrypt e utiliza uma sessão assinada em cookie HttpOnly.

### Configuração do Google Drive

1. Crie ou selecione um projeto no Google Cloud.
2. Ative a Google Drive API.
3. Crie uma conta de serviço e gere uma chave privada.
4. Crie uma pasta raiz no Google Drive para os arquivos do StockMain.
5. Compartilhe essa pasta raiz com o e-mail da conta de serviço, concedendo permissão de Editor.
6. Copie o ID da pasta raiz pela URL do Drive.
7. Configure as variáveis de ambiente no projeto da Vercel.

Variáveis obrigatórias:

| Variável | Conteúdo |
| --- | --- |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | E-mail da conta de serviço |
| `GOOGLE_PRIVATE_KEY` | Chave privada da conta de serviço |
| `GOOGLE_DRIVE_ROOT_FOLDER_ID` | ID da pasta raiz compartilhada |
| `SESSION_SECRET` | Segredo aleatório forte para assinar as sessões |

Configure essas variáveis nos ambientes necessários da Vercel: Production, Preview e Development. A chave privada e o segredo de sessão nunca devem ser enviados ao frontend, versionados no Git ou publicados.

O backend cria dentro da pasta raiz as pastas `Logins` e `Usuarios`. O arquivo `usuarios.json` mantém o índice das contas e cada conta possui seu próprio arquivo JSON de estoque.

## Desenvolvimento

Instale as dependências:

```bash
npm install
```

Para iniciar apenas a interface Vite:

```bash
npm run dev
```

A interface utiliza rotas `/api` para autenticação e armazenamento. Para testar as funções serverless localmente, utilize o ambiente de desenvolvimento da Vercel com as variáveis de ambiente configuradas:

```bash
npx vercel dev
```

## Verificações

Gerar a versão de produção:

```bash
npm run build
```

Executar o ESLint:

```bash
npm run lint
```

## Publicação

A publicação final será realizada pela Vercel, conectando o repositório GitHub e configurando as quatro variáveis de ambiente obrigatórias. Não publique o sistema como GitHub Pages, pois a autenticação e o armazenamento dependem da função serverless em `api/index.js`.

## Estado da implementação

A integração de autenticação, armazenamento, cadastro de produtos, entradas e saídas está em desenvolvimento. Antes de considerar a aplicação pronta para produção, é necessário executar build, lint e testes reais de cadastro, login, persistência após recarga, isolamento entre contas e permissões do Drive.

Ainda precisam ser tratados e testados aspectos como limitação de tentativas de login e concorrência na atualização dos arquivos JSON. O módulo de fornecedores permanece apenas como área informativa nesta etapa.
