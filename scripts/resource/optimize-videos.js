#!/usr/bin/env node

/**
 * Generate WebM and H.264 MP4 delivery copies plus a WebP poster for each
 * source video.
 * Original MP4 files are never changed or removed.
 */
import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, extname, join, relative, resolve, sep } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = resolve(scriptDirectory, '../..')
const websiteRoot = repositoryRoot
const supportedExtensions = new Set(['.mp4', '.mov', '.m4v'])

function option(name, fallback) {
  const index = process.argv.indexOf(`--${name}`)
  return index === -1 ? fallback : process.argv[index + 1]
}

function filesIn(directory) {
  if (!existsSync(directory)) throw new Error(`Input directory does not exist: ${directory}`)
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = join(directory, entry.name)
    if (entry.isDirectory()) return filesIn(file)
    return supportedExtensions.has(extname(entry.name).toLowerCase()) ? [file] : []
  })
}

function run(command, args) {
  const result = spawnSync(command, args, { stdio: 'pipe', encoding: 'utf8' })
  if (result.error?.code === 'ENOENT') throw new Error(`${command} is required. Install ffmpeg to use this script.`)
  if (result.status !== 0) throw new Error(result.stderr || `${command} failed`)
}

function main() {
  if (process.argv.includes('--help')) {
    console.log('Usage: node scripts/resource/optimize-videos.js [--input dir] [--output dir] [--manifest file] [--strip-prefix dir]')
    return
  }
  const input = resolve(option('input', join(websiteRoot, 'resources/raw/videos')))
  const output = resolve(option('output', join(websiteRoot, 'resources/optimized/videos')))
  const manifest = resolve(option('manifest', join(websiteRoot, 'resources/video-manifest.json')))
  const stripPrefix = resolve(option('strip-prefix', input))
  const videos = {}

  for (const source of filesIn(input)) {
    const sourceRelativePath = relative(stripPrefix, source)
    if (sourceRelativePath.startsWith('..')) throw new Error(`Source is outside --strip-prefix: ${source}`)
    const relativeWithoutExtension = sourceRelativePath.slice(0, -extname(sourceRelativePath).length)
    const webm = join(output, `${relativeWithoutExtension}.webm`)
    const mp4 = join(output, `${relativeWithoutExtension}.mp4`)
    const poster = join(output, `${relativeWithoutExtension}-poster.webp`)
    const temporaryPoster = join(output, `${relativeWithoutExtension}-poster.png`)
    mkdirSync(dirname(webm), { recursive: true })

    run('ffmpeg', ['-y', '-i', source, '-map', '0:v:0', '-map', '0:a?', '-vf', "scale='min(1200,iw)':-2", '-c:v', 'libvpx-vp9', '-crf', '32', '-b:v', '0', '-row-mt', '1', '-c:a', 'libopus', '-b:a', '96k', webm])
    run('ffmpeg', ['-y', '-i', source, '-map', '0:v:0', '-map', '0:a?', '-vf', "scale='min(1200,iw)':-2", '-c:v', 'libx264', '-crf', '28', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-c:a', 'aac', '-b:a', '96k', mp4])
    // Some FFmpeg distributions omit libwebp. Emit a one-frame PNG first, then
    // use the same ImageMagick encoder as the image pipeline for a portable
    // WebP poster.
    run('ffmpeg', ['-y', '-ss', '00:00:01', '-i', source, '-frames:v', '1', '-vf', "scale='min(1200,iw)':-2", '-c:v', 'png', temporaryPoster])
    run('magick', [temporaryPoster, '-quality', '75', '-define', 'webp:method=6', poster])
    rmSync(temporaryPoster, { force: true })

    const key = relativeWithoutExtension.split(sep).join('/')
    videos[key] = {
      source: sourceRelativePath.split(sep).join('/'),
      webm: `/${relative(websiteRoot, webm).split(sep).join('/')}`,
      mp4: `/${relative(websiteRoot, mp4).split(sep).join('/')}`,
      poster: `/${relative(websiteRoot, poster).split(sep).join('/')}`,
    }
    console.log(`Optimized ${sourceRelativePath}`)
  }

  mkdirSync(dirname(manifest), { recursive: true })
  writeFileSync(manifest, `${JSON.stringify({ generatedAt: new Date().toISOString(), videos }, null, 2)}\n`)
  console.log(`Created ${Object.keys(videos).length} video entries in ${relative(repositoryRoot, manifest)}`)
}

main()
