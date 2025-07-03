import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    base: '/static/app/',
    build: {
      outDir: 'dist/static/app',
    },
    plugins: [
      vue({
        template: {
          compilerOptions: {
            // vue doesnt like the <nobr> tag but its known and supported by all browsers https://caniuse.com/?search=nobr
            isCustomElement: (tag) => 'nobr' === tag,
          },
        },
      }),
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    server: {
      proxy: {
        '/api/v1': {
          target: env.VITE_DEV_API_URL,
          changeOrigin: true,
          configure: (proxy, _options) => {
            proxy.on('proxyReq', (proxyReq, _req, _res) => {
              // Setzen Sie hier Ihr statisches Session-Cookie
              proxyReq.setHeader('Cookie', env.VITE_DEV_JWT_COOKIE as string);
            });
          },
        },
      },
    },
  };
});
