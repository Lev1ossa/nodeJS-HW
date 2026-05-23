import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@nodejs-hw/pizza-contracts': resolve(process.cwd(), 'packages/pizza-contracts/src')
    }
  },
  test: {
    environment: 'node',
    fileParallelism: false
  }
});
