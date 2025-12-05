import { sveltePreprocess } from 'svelte-preprocess';

export default {
  // Consult https://svelte.dev/docs#compile-time-svelte-preprocess
  // for more information about preprocessors
  preprocess: sveltePreprocess({
    scss: {
      prependData: 'src/styles/main.scss'
    }
  })
};
