import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@model': resolve(__dirname, './src/model'),
      '@routes': resolve(__dirname, './src/routes'),
      '@types': resolve(__dirname, './src/types'),
      '@tests': resolve(__dirname, './src/tests'),
      '@db': resolve(__dirname, './src/db')
    }
  },
  test: {
    environment: 'node',
    include: ['**/*.test.ts'],
    exclude: ['node_modules', 'dist'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules', 'dist'],
    },
  },
}) 