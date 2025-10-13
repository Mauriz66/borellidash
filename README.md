# Welcome to your Lovable project
## Deploy (EasyPanel)

Este projeto é um SPA (Vite/React). Em produção, sirva `dist` com Nginx.

### Opção recomendada: Dockerfile

1. Confirme `Dockerfile` e `nginx.conf` na raiz (incluídos neste repo).
2. No EasyPanel, crie um App → tipo "Dockerfile" e aponte para o repositório.
3. Defina as variáveis de build (Build Args):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   Essas variáveis são injetadas no build do Vite e usadas em `src/integrations/supabase/client.ts`.
4. Configure a Porta do contêiner como `80`. Ative domínio/SSL conforme necessário.
5. (Opcional) Habilite deploy automático na branch desejada.

### Build local (opcional)

```bash
docker build -t borreli-dash .
docker run -p 8080:80 borreli-dash
```

Abra `http://localhost:8080`.

### Subpath

Se publicar em subpath (ex.: `/app/`), ajuste `base` no `vite.config.ts`.

### Dicas para EasyPanel

- Se preferir usar compose, o `docker-compose.yml` já inclui `build.args` para `VITE_*` e expõe `80`.
- Evite colocar chaves secretas no front-end. Use apenas a chave pública (publishable/anon) do Supabase.
- Após deploy, valide que a app responde no domínio configurado e que as listas de leads carregam (checa integração Supabase).

## Project info

**URL**: https://lovable.dev/projects/2592b53a-46e3-4cac-a020-7a273802f267

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/2592b53a-46e3-4cac-a020-7a273802f267) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/2592b53a-46e3-4cac-a020-7a273802f267) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
