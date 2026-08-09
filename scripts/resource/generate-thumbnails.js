#!/usr/bin/env node

/** Generate only 320px WebP placeholders for an existing image set. */
import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const directory = dirname(fileURLToPath(import.meta.url))
const imageOptimizer = join(directory, 'optimize-images.js')
const result = spawnSync(process.execPath, [imageOptimizer, ...process.argv.slice(2), '--thumbnails-only'], {
  stdio: 'inherit',
})

process.exit(result.status ?? 1)
