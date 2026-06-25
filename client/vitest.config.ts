import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
        silent: true,
        environment: 'jsdom',
        setupFiles: ['src/test/setup.tsx'],
        include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
        passWithNoTests: true,
        coverage: {
            provider: 'v8',
            include: ['src/domain/**'],
        },
    },
});
