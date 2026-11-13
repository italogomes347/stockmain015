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

O projeto não utiliza banco de dados. Os dados das contas são armazenados em arquivos JSON no Google Drive, acessados exclusivamente pelo backend.

O usuário final cria uma conta no StockMain com e-mail e senha. Ele não precisa conectar uma conta Google nem autorizar acesso ao próprio Drive.

As senhas são armazenadas com hash derivado por scrypt e salt. A sessão é assinada no servidor e mantida em cookie HttpOnly. Credenciais e tokens do Google ficam somente nas variáveis de ambiente do backend; nunca devem ser enviados ao frontend ou versionados no Git.

## Configuração do Google Drive com OAuth 2.0

A integração usa OAuth 2.0 de uma conta Google comum (não usa Service Account).

1. Crie ou selecione um projeto no Google Cloud e ative a Google Drive API.
2. Configure a tela de consentimento OAuth e crie um cliente OAuth do tipo **Aplicativo da Web**.
3. Adicione como URI de redirecionamento autorizada exatamente a URL usada pelo ambiente:
   - Produção: `https://stockmain015.vercel.app/api/oauth`
   - Para outro domínio ou ambiente local, configure também a URI correspondente e defina a variável `GOOGLE_OAUTH_REDIRECT_URI` com essa mesma URL.
4. Crie uma pasta raiz no Google Drive da conta que será usada pelo StockMain e copie o ID da pasta pela URL.
5. Configure as variáveis abaixo no projeto da Vercel.
6. Abra `https://stockmain015.vercel.app/api/oauth` no navegador, entre com a conta Google que será proprietária dos arquivos e conclua a autorização.
7. A página de retorno exibirá o token de atualização. Copie-o diretamente para a variável sensível `GOOGLE_REFRESH_TOKEN` na Vercel. Não envie esse token por chat, e-mail ou commit.
8. Faça um novo deploy após configurar as variáveis.

### Variáveis de ambiente

| Variável | Conteúdo |
| --- | --- |
| `GOOGLE_CLIENT_ID` | ID do cliente OAuth 2.0 |
| `GOOGLE_CLIENT_SECRET` | Segredo do cliente OAuth 2.0 |
| `GOOGLE_REFRESH_TOKEN` | Token de atualização obtido no fluxo `/api/oauth` |
| `GOOGLE_OAUTH_REDIRECT_URI` | URI completa de callback, terminando em `/api/oauth` |
| `GOOGLE_DRIVE_ROOT_FOLDER_ID` | ID da pasta raiz do StockMain no Google Drive |
| `SESSION_SECRET` | Segredo aleatório forte, com pelo menos 32 caracteres, para assinar as sessões |

Configure as variáveis nos ambientes Vercel necessários (Production, Preview e Development). Marque credenciais e segredos como sensíveis. A `GOOGLE_OAUTH_REDIRECT_URI` deve corresponder exatamente à URI cadastrada no Google Cloud. O endpoint OAuth usa o domínio de produção padrão quando a variável não está definida, portanto configure-a explicitamente em previews e ambientes locais.

O backend cria dentro da pasta raiz as pastas `Logins` e `Usuarios`. O arquivo `usuarios.json` mantém o índice das contas e cada conta possui seu próprio arquivo JSON de estoque.

**Importante:** não publique tokens ou segredos no repositório. Se um segredo já foi exposto, revogue ou rotacione-o no provedor e atualize a variável na Vercel.

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

A publicação será realizada pela Vercel, conectando o repositório GitHub e configurando as variáveis de ambiente descritas acima. A branch de produção é `main`. Não publique o sistema como GitHub Pages, pois a autenticação e o armazenamento dependem das funções serverless em `api/`.

## Estado da implementação

A integração de autenticação, armazenamento, cadastro de produtos, entradas e saídas está em desenvolvimento e precisa de validação no ambiente real. Antes de considerar a aplicação pronta para produção, execute build, lint e testes reais de cadastro, login, persistência após recarga, isolamento entre contas e permissões do Drive.

Também precisam ser tratados e testados aspectos como limitação de tentativas de login e concorrência na atualização dos arquivos JSON. O módulo de fornecedores permanece apenas como área informativa nesta etapa.
