#!/usr/bin/env node
import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const entry = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist', 'index.js')
const child = spawn(process.execPath, [entry], { stdio: 'inherit' })
child.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal)
  else process.exit(code ?? 1)
})
