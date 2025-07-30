# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project in the current directory
npx sv create

# create a new project in my-app
npx sv create my-app
```


## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

### Local HTTPS for Camera Testing

To use the camera on mobile devices, you must serve your app over HTTPS. You can enable HTTPS for local development with Vite:

1. Generate a self-signed certificate (only needed once):

   ```sh
   # Windows PowerShell
   mkdir cert && cd cert
   openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes -subj "/CN=localhost"
   cd ..
   ```

2. Update your `vite.config.ts` to use HTTPS:

   ```ts
   // vite.config.ts
   import tailwindcss from '@tailwindcss/vite';
   import { sveltekit } from '@sveltejs/kit/vite';
   import { defineConfig } from 'vite';
   import fs from 'fs';

   export default defineConfig({
     plugins: [tailwindcss(), sveltekit()],
     server: {
       https: {
         key: fs.readFileSync('cert/key.pem'),
         cert: fs.readFileSync('cert/cert.pem')
       }
     }
   });
   ```

3. Restart your dev server:

   ```sh
   npm run dev
   ```

4. Open the HTTPS URL (e.g., https://localhost:5173) on your mobile device (accept the certificate warning if prompted).

Now your app can access the camera on mobile browsers.

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
