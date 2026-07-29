#!/usr/bin/env node
// Bundle jobs/*.mjs into .output/jobs/ so the runtime image can run them with
// bare node. The image only copies .output (see the root Dockerfile), and
// n-easyapp cap6 runs a job by overriding the container start command — so the
// job entrypoint has to exist inside .output, dependencies included.

import { readdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { build } from 'esbuild'

const HERE = dirname(fileURLToPath(import.meta.url))
const APP = join(HERE, '..')
const SRC = join(APP, 'jobs')
const OUT = join(APP, '.output', 'jobs')

const entries = (await readdir(SRC)).filter((f) => f.endsWith('.mjs'))
if (!entries.length) {
  console.log('build-jobs: no jobs to build')
  process.exit(0)
}

await build({
  entryPoints: entries.map((f) => join(SRC, f)),
  outdir: OUT,
  bundle: true,
  platform: 'node',
  target: 'node24',
  format: 'esm',
  outExtension: { '.js': '.mjs' },
  loader: { '.json': 'json' },
  banner: {
    // `postgres` reaches for these CJS globals through its ESM build.
    js: [
      "import { createRequire as __cr } from 'node:module'",
      'const require = __cr(import.meta.url)',
    ].join('\n'),
  },
})

console.log(`build-jobs: bundled ${entries.join(', ')} -> .output/jobs/`)
