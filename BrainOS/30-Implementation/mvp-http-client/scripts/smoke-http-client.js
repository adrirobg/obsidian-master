import { OpenCodeHttpClient } from '../src/index.js'

function createJsonResponse(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: {
      get(name) {
        return name.toLowerCase() === 'content-type' ? 'application/json' : null
      }
    },
    async json() {
      return body
    },
    async text() {
      return JSON.stringify(body)
    }
  }
}

function createMockFetch() {
  return async (url, options) => {
    const parsed = new URL(url)
    const path = parsed.pathname

    if (options.method === 'GET' && path === '/global/health') {
      return createJsonResponse(200, { status: 'ok', version: 'mock-runtime' })
    }

    if (options.method === 'POST' && path === '/session') {
      return createJsonResponse(200, { id: 'smoke-session' })
    }

    if (options.method === 'POST' && path === '/session/smoke-session/prompt') {
      return createJsonResponse(200, { output: 'respuesta de prueba' })
    }

    return createJsonResponse(404, { error: 'not_found' })
  }
}

const useRealRuntime = process.env.SMOKE_USE_REAL_RUNTIME === '1'

const client = new OpenCodeHttpClient({
  baseUrl: process.env.SMOKE_BASE_URL ?? 'http://localhost:4096',
  timeoutMs: 1_000,
  fetchImpl: useRealRuntime ? undefined : createMockFetch()
})

const health = await client.healthCheck()
const session = await client.createSession('Smoke Session')
const promptResponse = await client.sendPrompt({
  sessionId: session.id,
  prompt: 'Procesa una nota simple'
})

console.log(JSON.stringify({
  smoke: 'ok',
  health,
  session,
  promptResponse
}))
