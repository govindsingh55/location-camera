import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

import fs from 'fs';

export default defineConfig({
  server: {
	host: true,
	https: fs.existsSync('cert/key.pem') && fs.existsSync('cert/cert.pem')
	  ? {
		  key: fs.readFileSync('cert/key.pem'),
		  cert: fs.readFileSync('cert/cert.pem')
		}
	  : undefined
  },
  plugins: [tailwindcss(), sveltekit()]
});
