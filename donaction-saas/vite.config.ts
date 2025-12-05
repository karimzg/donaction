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
      formats: process.env.BUILD_MODE === 'INDIVIDUAL' ? ['es'] : ['iife'],
      fileName: 'index'
    },
    rollupOptions:
      process.env.BUILD_MODE === 'INDIVIDUAL'
        ? {
            input: {
              KlubrSponsorshipForm: '/src/components/sponsorshipForm/index.svelte'
            },
            output: {
              dir: 'build/klubr-web-components/components',
              format: 'esm',
              entryFileNames: '[name].[format].js',
              inlineDynamicImports: false
            }
          }
        : {
            output: {
              dir: 'build/klubr-web-components',
              inlineDynamicImports: true
            }
          }
  }
});
