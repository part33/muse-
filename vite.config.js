import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Relative asset paths: the built site works from any sub-path
  // (GitHub Pages project page, Aliyun ECS, or plain file hosting).
  base: './',
  plugins: [react()],
});
