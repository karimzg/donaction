import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { sveltePreprocess } from 'svelte-preprocess';

export default defineConfig({
  plugins: [
    svelte({
      preprocess: sveltePreprocess({
        typescript: true
      }),
      compilerOptions: {
        customElement: true
      }
    })
  ],
  build: {
    lib: {
      entry: 'src/main.ts',
      name: 'KlubrWebComponents',
      formats: ['es'],
      fileName: 'index'
    },
    rollupOptions: {
      input: {
        KlubrSponsorshipForm: '/src/components/sponsorshipForm/index.svelte'
      },
      output: {
        dir: 'public',
        format: 'esm',
        entryFileNames: '[name].[format].js',
        inlineDynamicImports: false
      }
    }
  }
});
