"use strict";

/**
 * @typedef {"user"|"assistant"|"system"} MessageRole
 */

/**
 * @typedef {Object} SessionMessage
 * @property {string} id
 * @property {MessageRole} role
 * @property {string} content
 * @property {number} timestamp
 */

/**
 * @typedef {Object} PendingSuggestion
 * @property {string} id
 * @property {string} title
 * @property {string} payload
 * @property {"pending"|"shown"|"accepted"|"rejected"} status
 * @property {number} createdAt
 */

/**
 * @typedef {Object} SessionMetadata
 * @property {string|null} sessionId
 * @property {number|null} startedAt
 * @property {number|null} lastActivityAt
 * @property {number|null} expiresAt
 */

/**
 * @typedef {Object} SessionState
 * @property {SessionMetadata} metadata
 * @property {SessionMessage[]} history
 * @property {PendingSuggestion[]} pendingSuggestions
 */

const DEFAULT_LIMITS = Object.freeze({
  maxHistory: 10,
  maxPendingSuggestions: 25,
  ttlMs: null,
});

class SessionStateManager {
  /**
   * @param {{
   *   maxHistory?: number;
   *   maxPendingSuggestions?: number;
   *   ttlMs?: number | null;
   * }} [options]
   */
  constructor(options = {}) {
    const limits = { ...DEFAULT_LIMITS, ...options };
    this.limits = {
      maxHistory: normalizeLimit(limits.maxHistory, DEFAULT_LIMITS.maxHistory),
      maxPendingSuggestions: normalizeLimit(
        limits.maxPendingSuggestions,
        DEFAULT_LIMITS.maxPendingSuggestions
      ),
      ttlMs: normalizeTtl(limits.ttlMs),
    };

    this._cleanupHooks = [];
    this._resetState();
  }

  /**
   * @param {string} sessionId
   * @param {number} [now]
   */
  startSession(sessionId, now = Date.now()) {
    if (!sessionId || typeof sessionId !== "string") {
      throw new Error("sessionId must be a non-empty string");
    }
    this.state.metadata.sessionId = sessionId;
    this.state.metadata.startedAt = now;
    this.state.metadata.lastActivityAt = now;
    this.state.metadata.expiresAt =
      this.limits.ttlMs == null ? null : now + this.limits.ttlMs;
  }

  /**
   * @param {SessionMessage} message
   * @param {number} [now]
   */
  addMessage(message, now = Date.now()) {
    assertActiveSession(this.state.metadata.sessionId);
    const normalized = {
      id: String(message.id),
      role: message.role,
      content: String(message.content),
      timestamp: Number.isFinite(message.timestamp) ? message.timestamp : now,
    };
    this.state.history.push(normalized);
    trimToLimit(this.state.history, this.limits.maxHistory);
    this._touch(now);
  }

  /**
   * @param {PendingSuggestion} suggestion
   * @param {number} [now]
   */
  addSuggestion(suggestion, now = Date.now()) {
    assertActiveSession(this.state.metadata.sessionId);
    const normalized = {
      id: String(suggestion.id),
      title: String(suggestion.title),
      payload: String(suggestion.payload),
      status: suggestion.status || "pending",
      createdAt: Number.isFinite(suggestion.createdAt)
        ? suggestion.createdAt
        : now,
    };
    this.state.pendingSuggestions.push(normalized);
    trimToLimit(this.state.pendingSuggestions, this.limits.maxPendingSuggestions);
    this._touch(now);
  }

  /**
   * @param {string} suggestionId
   * @param {PendingSuggestion["status"]} nextStatus
   * @param {number} [now]
   */
  updateSuggestionStatus(suggestionId, nextStatus, now = Date.now()) {
    const found = this.state.pendingSuggestions.find((s) => s.id === suggestionId);
    if (!found) {
      return false;
    }
    found.status = nextStatus;
    this._touch(now);
    return true;
  }

  /**
   * @param {number} [now]
   */
  isExpired(now = Date.now()) {
    const { expiresAt } = this.state.metadata;
    return expiresAt != null && now >= expiresAt;
  }

  /**
   * @param {() => void} hook
   */
  registerCleanupHook(hook) {
    if (typeof hook !== "function") {
      throw new Error("cleanup hook must be a function");
    }
    this._cleanupHooks.push(hook);
  }

  /**
   * @param {{ reason?: string }} [options]
   */
  clearSession(options = {}) {
    const cleanupErrors = [];
    for (const hook of this._cleanupHooks) {
      try {
        hook();
      } catch (error) {
        cleanupErrors.push({
          reason: options.reason || "manual-clear",
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
    this._resetState();
    return { cleanupErrors };
  }

  /**
   * @param {string} nextSessionId
   * @param {number} [now]
   */
  restartSession(nextSessionId, now = Date.now()) {
    const { cleanupErrors } = this.clearSession({ reason: "restart" });
    this.startSession(nextSessionId, now);
    return { cleanupErrors };
  }

  getSnapshot() {
    return structuredClone(this.state);
  }

  _touch(now) {
    this.state.metadata.lastActivityAt = now;
    if (this.limits.ttlMs != null) {
      this.state.metadata.expiresAt = now + this.limits.ttlMs;
    }
  }

  _resetState() {
    /** @type {SessionState} */
    this.state = {
      metadata: {
        sessionId: null,
        startedAt: null,
        lastActivityAt: null,
        expiresAt: null,
      },
      history: [],
      pendingSuggestions: [],
    };
  }
}

function trimToLimit(list, maxItems) {
  while (list.length > maxItems) {
    list.shift();
  }
}

function normalizeLimit(value, fallback) {
  if (!Number.isInteger(value) || value <= 0) {
    return fallback;
  }
  return value;
}

function normalizeTtl(value) {
  if (value == null) {
    return null;
  }
  if (!Number.isInteger(value) || value <= 0) {
    return null;
  }
  return value;
}

function assertActiveSession(sessionId) {
  if (!sessionId) {
    throw new Error("no active session");
  }
}

module.exports = {
  SessionStateManager,
};
