import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/logger.ts', 'src/format-time.ts'],
  format: ['esm'],
  dts: {
    resolve: true,
  },
  clean: true,
  sourcemap: true,
  treeshake: true,
  external: [/^@automaker\//],
});
