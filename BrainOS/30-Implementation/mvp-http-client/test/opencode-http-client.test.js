import { test } from 'node:test'
import assert from 'node:assert/strict'

import {
  OpenCodeHttpClient,
  OpenCodeNetworkError,
  OpenCodeRuntimeError,
  OpenCodeTimeoutError
} from '../src/index.js'

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

test('healthCheck returns parsed JSON payload', async () => {
  const fetchImpl = async (url, options) => {
    assert.equal(url, 'http://runtime.test/global/health')
    assert.equal(options.method, 'GET')
    return createJsonResponse(200, { status: 'ok', version: 'test-1.0.0' })
  }

  const client = new OpenCodeHttpClient({
    baseUrl: 'http://runtime.test',
    timeoutMs: 250,
    fetchImpl
  })

  const result = await client.healthCheck()
  assert.deepEqual(result, { status: 'ok', version: 'test-1.0.0' })
})

test('sendPrompt posts body and returns JSON response', async () => {
  const fetchImpl = async (url, options) => {
    assert.equal(url, 'http://runtime.test/session/session-123/prompt')
    assert.equal(options.method, 'POST')

    const body = JSON.parse(options.body)
    assert.equal(body.parts?.[0]?.type, 'text')
    assert.equal(body.parts?.[0]?.text, 'hola mundo')

    return createJsonResponse(200, { output: 'ok' })
  }

  const client = new OpenCodeHttpClient({
    baseUrl: 'http://runtime.test',
    timeoutMs: 250,
    fetchImpl
  })

  const result = await client.sendPrompt({ sessionId: 'session-123', prompt: 'hola mundo' })
  assert.deepEqual(result, { output: 'ok' })
})

test('maps non-2xx responses to OpenCodeRuntimeError', async () => {
  const fetchImpl = async () => createJsonResponse(503, { error: 'runtime_down' })

  const client = new OpenCodeHttpClient({
    baseUrl: 'http://runtime.test',
    timeoutMs: 250,
    fetchImpl
  })

  await assert.rejects(() => client.healthCheck(), (error) => {
    assert.equal(error instanceof OpenCodeRuntimeError, true)
    assert.equal(error.status, 503)
    assert.deepEqual(error.body, { error: 'runtime_down' })
    return true
  })
})

test('maps timeout to OpenCodeTimeoutError', async () => {
  const fetchImpl = async () => {
    const timeoutError = new Error('The operation was aborted due to timeout')
    timeoutError.name = 'TimeoutError'
    throw timeoutError
  }

  const client = new OpenCodeHttpClient({
    baseUrl: 'http://runtime.test',
    timeoutMs: 20,
    fetchImpl
  })

  await assert.rejects(() => client.healthCheck(), (error) => {
    assert.equal(error instanceof OpenCodeTimeoutError, true)
    return true
  })
})

test('timeout is enforced for fetch implementations that wait on abort signal', async () => {
  const fetchImpl = async (_url, options) => {
    await new Promise((resolve) => {
      options.signal.addEventListener('abort', resolve, { once: true })
    })
    const abortError = new Error('aborted')
    abortError.name = 'AbortError'
    throw abortError
  }

  const client = new OpenCodeHttpClient({
    baseUrl: 'http://runtime.test',
    timeoutMs: 20,
    fetchImpl
  })

  await assert.rejects(() => client.healthCheck(), (error) => {
    assert.equal(error instanceof OpenCodeTimeoutError, true)
    return true
  })
})


test('maps invalid JSON payloads on successful HTTP responses to OpenCodeRuntimeError', async () => {
  const fetchImpl = async () => ({
    ok: true,
    status: 200,
    headers: {
      get(name) {
        return name.toLowerCase() === 'content-type' ? 'application/json' : null
      }
    },
    async text() {
      return '{"unfinished":true'
    }
  })

  const client = new OpenCodeHttpClient({
    baseUrl: 'http://runtime.test',
    timeoutMs: 250,
    fetchImpl
  })

  await assert.rejects(() => client.healthCheck(), (error) => {
    assert.equal(error instanceof OpenCodeRuntimeError, true)
    assert.equal(error instanceof OpenCodeNetworkError, false)
    assert.equal(error.status, 200)
    assert.equal(error.meta.reason, 'invalid_json_payload')
    return true
  })
})

test('maps empty JSON payloads to OpenCodeRuntimeError', async () => {
  const fetchImpl = async () => ({
    ok: true,
    status: 200,
    headers: {
      get(name) {
        return name.toLowerCase() === 'content-type' ? 'application/json' : null
      }
    },
    async text() {
      return ''
    }
  })

  const client = new OpenCodeHttpClient({
    baseUrl: 'http://runtime.test',
    timeoutMs: 250,
    fetchImpl
  })

  await assert.rejects(() => client.healthCheck(), (error) => {
    assert.equal(error instanceof OpenCodeRuntimeError, true)
    assert.equal(error.status, 200)
    assert.equal(error.meta.reason, 'empty_json_payload')
    return true
  })
})

test('maps connection failures to OpenCodeNetworkError', async () => {
  const fetchImpl = async () => {
    throw new TypeError('fetch failed')
  }

  const client = new OpenCodeHttpClient({
    baseUrl: 'http://runtime.test',
    timeoutMs: 100,
    fetchImpl
  })

  await assert.rejects(() => client.healthCheck(), (error) => {
    assert.equal(error instanceof OpenCodeNetworkError, true)
    return true
  })
})

test('failure logs keep event message key stable', async () => {
  const entries = []
  const logger = {
    info() {},
    error(message, context) {
      entries.push({ message, context })
    }
  }

  const fetchImpl = async () => {
    throw new TypeError('fetch failed')
  }

  const client = new OpenCodeHttpClient({
    baseUrl: 'http://runtime.test',
    timeoutMs: 100,
    fetchImpl,
    logger
  })

  await assert.rejects(() => client.healthCheck(), (error) => {
    assert.equal(error instanceof OpenCodeNetworkError, true)
    return true
  })

  assert.equal(entries.length, 1)
  assert.equal(entries[0].message, 'opencode.request.failure')
  assert.equal(entries[0].context.errorMessage, 'Failed to connect to OpenCode runtime')
})
