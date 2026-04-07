import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    // Vitest는 기본적으로 .env.test를 자동 로드
    setupFiles: ['./src/tests/setup.ts'],
    passWithNoTests: true,
    projects: [
      {
        // 서버 로직 — node 환경 (단위 + 통합)
        test: {
          name: 'server',
          include: [
            'src/*.test.ts',
            'src/actions/**/*.test.ts',
            'src/lib/**/*.test.ts',
            'src/actions/**/*.integration.test.ts',
            'src/lib/**/*.integration.test.ts',
          ],
          environment: 'node',
          fileParallelism: false,
          setupFiles: ['./src/tests/setup.ts'],
          env: {
            BLOB_READ_WRITE_TOKEN: 'test',
          },
        },
        resolve: {
          alias: { '@': path.resolve(__dirname, './src') },
        },
      },
      {
        // 컴포넌트 — jsdom 환경
        plugins: [react()],
        test: {
          name: 'components',
          include: ['src/components/**/*.test.tsx'],
          environment: 'jsdom',
          setupFiles: ['./src/tests/setup.ts', './src/tests/setup.components.ts'],
        },
        resolve: {
          alias: { '@': path.resolve(__dirname, './src') },
        },
      },
    ],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
})
