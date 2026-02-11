export interface RuntimeLogger {
	debug(message: string, context?: Record<string, unknown>): void;
	info(message: string, context?: Record<string, unknown>): void;
	warn(message: string, context?: Record<string, unknown>): void;
	error(message: string, context?: Record<string, unknown>): void;
}

function writeLog(sink: Pick<Console, 'log' | 'error'>, entry: Record<string, unknown>) {
	const line = JSON.stringify({ timestamp: new Date().toISOString(), ...entry });
	if (entry.level === 'error') {
		sink.error(line);
		return;
	}
	sink.log(line);
}

export function createStructuredLogger(sink: Pick<Console, 'log' | 'error'> = console): RuntimeLogger {
	return {
		debug(message, context = {}) {
			writeLog(sink, { level: 'debug', message, ...context });
		},
		info(message, context = {}) {
			writeLog(sink, { level: 'info', message, ...context });
		},
		warn(message, context = {}) {
			writeLog(sink, { level: 'warn', message, ...context });
		},
		error(message, context = {}) {
			writeLog(sink, { level: 'error', message, ...context });
		}
	};
}
