import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  declaration: true,
  entries: [
    './src/index',
  ],
  rollup: {
    esbuild: {
      target: 'es2022',
    },
  },
})
