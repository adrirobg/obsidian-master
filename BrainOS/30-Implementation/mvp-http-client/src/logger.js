function writeLog(sink, entry) {
  const line = JSON.stringify({ timestamp: new Date().toISOString(), ...entry })
  if (entry.level === 'error') {
    sink.error(line)
    return
  }
  sink.log(line)
}

export function createStructuredLogger(sink = console) {
  return {
    debug(message, context = {}) {
      writeLog(sink, { level: 'debug', message, ...context })
    },
    info(message, context = {}) {
      writeLog(sink, { level: 'info', message, ...context })
    },
    warn(message, context = {}) {
      writeLog(sink, { level: 'warn', message, ...context })
    },
    error(message, context = {}) {
      writeLog(sink, { level: 'error', message, ...context })
    }
  }
}
