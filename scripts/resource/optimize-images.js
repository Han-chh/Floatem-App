#!/usr/bin/env node

/**
 * Build responsive WebP (and optionally AVIF) derivatives without modifying
 * the source file. Uses ImageMagick, which keeps the resource pipeline free
 * from a runtime dependency in the production website.
 *
 * Examples:
 *   node scripts/resource/optimize-images.js
 *   node scripts/resource/optimize-images.js --input website/public --strip-prefix website/public
 *   node scripts/resource/optimize-images.js --formats webp,avif
 */
import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { basename, dirname, extname, join, relative, resolve, sep } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = resolve(scriptDirectory, '../..')
const websiteRoot = repositoryRoot
const defaults = {
  input: join(websiteRoot, 'resources/raw'),
  output: join(websiteRoot, 'resources/optimized'),
  manifest: join(websiteRoot, 'resources/image-manifest.json'),
  stripPrefix: null,
  formats: ['webp'],
  thumbnailWidth: 320,
  thumbnailQuality: 70,
  previewWidth: 1200,
  previewQuality: 80,
  thumbnailsOnly: false,
}
const supportedExtensions = new Set(['.jpg', '.jpeg', '.png'])

function option(name, fallback) {
  const index = process.argv.indexOf(`--${name}`)
  return index === -1 ? fallback : process.argv[index + 1]
}

function readOptions() {
  const formats = option('formats', defaults.formats.join(','))
    .split(',')
    .map((format) => format.trim().toLowerCase())
    .filter((format) => format === 'webp' || format === 'avif')

  if (formats.length === 0) throw new Error('Use at least one output format: webp and/or avif.')

  return {
    ...defaults,
    input: resolve(option('input', defaults.input)),
    output: resolve(option('output', defaults.output)),
    manifest: resolve(option('manifest', defaults.manifest)),
    stripPrefix: option('strip-prefix', '') ? resolve(option('strip-prefix', '')) : null,
    formats,
    thumbnailsOnly: process.argv.includes('--thumbnails-only'),
  }
}

function filesIn(directory) {
  if (!existsSync(directory)) throw new Error(`Input directory does not exist: ${directory}`)
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = join(directory, entry.name)
    if (entry.isDirectory()) return filesIn(fullPath)
    return supportedExtensions.has(extname(entry.name).toLowerCase()) ? [fullPath] : []
  })
}

function runImageMagick(args) {
  const command = process.platform === 'win32' ? 'magick.exe' : 'magick'
  const result = spawnSync(command, args, { stdio: 'pipe', encoding: 'utf8' })
  if (result.error?.code === 'ENOENT') {
    throw new Error('ImageMagick is required. Install it with `brew install imagemagick` (macOS) or your platform equivalent.')
  }
  if (result.status !== 0) throw new Error(result.stderr || `ImageMagick failed: ${args.join(' ')}`)
}

function formatArguments(format, quality) {
  return format === 'avif'
    ? ['-quality', String(Math.max(20, Math.round(quality * 0.8)))]
    : ['-quality', String(quality), '-define', 'webp:method=6']
}

function destinationFor(source, options) {
  const relativeSource = relative(options.stripPrefix || options.input, source)
  if (relativeSource.startsWith('..') || relativeSource.includes(`${sep}..${sep}`)) {
    throw new Error(`Source is outside --strip-prefix: ${source}`)
  }
  return relativeSource
}

function outputUrl(file, options) {
  return `/${relative(websiteRoot, file).split(sep).join('/')}`
}

function manifestKey(relativeSource) {
  return relativeSource.slice(0, -extname(relativeSource).length).split(sep).join('/')
}

function optimize(source, relativeSource, options) {
  const extension = extname(relativeSource)
  const stem = join(options.output, relativeSource.slice(0, -extension.length))
  mkdirSync(dirname(stem), { recursive: true })
  const result = {}

  for (const format of options.formats) {
    const thumbnail = `${stem}-thumb.${format}`
    runImageMagick([
      source,
      '-auto-orient',
      '-resize', `${options.thumbnailWidth}x${options.thumbnailWidth}>`,
      ...formatArguments(format, options.thumbnailQuality),
      thumbnail,
    ])
    result[format] = { thumbnail: outputUrl(thumbnail, options) }

    if (!options.thumbnailsOnly) {
      const preview = `${stem}.${format}`
      runImageMagick([
        source,
        '-auto-orient',
        '-resize', `${options.previewWidth}x${options.previewWidth}>`,
        ...formatArguments(format, options.previewQuality),
        preview,
      ])
      result[format].preview = outputUrl(preview, options)
    }
  }
  return result
}

function main() {
  if (process.argv.includes('--help')) {
    console.log('Usage: node scripts/resource/optimize-images.js [--input dir] [--output dir] [--manifest file] [--strip-prefix dir] [--formats webp,avif] [--thumbnails-only]')
    return
  }
  const options = readOptions()
  const sources = filesIn(options.input)
  const images = {}

  for (const source of sources) {
    const sourceRelativePath = destinationFor(source, options)
    const formats = optimize(source, sourceRelativePath, options)
    const webp = formats.webp || formats[options.formats[0]]
    images[manifestKey(sourceRelativePath)] = {
      source: sourceRelativePath.split(sep).join('/'),
      thumbnail: webp.thumbnail,
      preview: webp.preview || null,
      formats,
    }
    console.log(`Optimized ${sourceRelativePath}`)
  }

  mkdirSync(dirname(options.manifest), { recursive: true })
  writeFileSync(options.manifest, `${JSON.stringify({ generatedAt: new Date().toISOString(), images }, null, 2)}\n`)
  console.log(`Created ${sources.length} image entries in ${relative(repositoryRoot, options.manifest)}`)
}

main()
