import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        background: resolve(__dirname, 'src/background.ts'),
        'audio-processor': resolve(__dirname, 'src/audio-processor.ts'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          return ['background', 'audio-processor'].includes(chunkInfo.name) 
            ? '[name].js' 
            : 'assets/[name]-[hash].js';
        },
      },
    },
  },
});
