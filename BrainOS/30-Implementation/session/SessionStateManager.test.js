"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const { SessionStateManager } = require("./SessionStateManager");

test("mantiene estado durante sesion activa y purga al cerrar", () => {
  const manager = new SessionStateManager();
  manager.startSession("s-1", 1000);
  manager.addMessage(
    { id: "m1", role: "user", content: "hola", timestamp: 1001 },
    1001
  );
  manager.addSuggestion(
    {
      id: "sg-1",
      title: "Sugerencia",
      payload: "Aplicar cambio",
      status: "pending",
      createdAt: 1002,
    },
    1002
  );

  let snapshot = manager.getSnapshot();
  assert.equal(snapshot.metadata.sessionId, "s-1");
  assert.equal(snapshot.history.length, 1);
  assert.equal(snapshot.pendingSuggestions.length, 1);

  manager.clearSession();
  snapshot = manager.getSnapshot();
  assert.equal(snapshot.metadata.sessionId, null);
  assert.equal(snapshot.history.length, 0);
  assert.equal(snapshot.pendingSuggestions.length, 0);
});

test("aplica limites explicitos para historial y cola de sugerencias", () => {
  const manager = new SessionStateManager({
    maxHistory: 3,
    maxPendingSuggestions: 2,
  });
  manager.startSession("s-2", 2000);

  for (let i = 1; i <= 5; i += 1) {
    manager.addMessage(
      { id: `m${i}`, role: "assistant", content: `msg-${i}`, timestamp: 2000 + i },
      2000 + i
    );
  }
  for (let i = 1; i <= 4; i += 1) {
    manager.addSuggestion(
      {
        id: `sg-${i}`,
        title: `Sugerencia ${i}`,
        payload: `payload-${i}`,
        status: "pending",
        createdAt: 3000 + i,
      },
      3000 + i
    );
  }

  const snapshot = manager.getSnapshot();
  assert.deepEqual(
    snapshot.history.map((m) => m.id),
    ["m3", "m4", "m5"]
  );
  assert.deepEqual(
    snapshot.pendingSuggestions.map((s) => s.id),
    ["sg-3", "sg-4"]
  );
});

test("soporta TTL opcional para expiracion de sesion", () => {
  const manager = new SessionStateManager({ ttlMs: 1000 });
  manager.startSession("s-ttl", 0);
  assert.equal(manager.isExpired(999), false);
  assert.equal(manager.isExpired(1000), true);
});

test("errores en limpieza no bloquean reinicio de sesion", () => {
  const manager = new SessionStateManager();
  manager.startSession("s-3", 0);
  manager.registerCleanupHook(() => {
    throw new Error("cleanup failed");
  });

  const { cleanupErrors } = manager.restartSession("s-4", 1);
  const snapshot = manager.getSnapshot();

  assert.equal(cleanupErrors.length, 1);
  assert.equal(snapshot.metadata.sessionId, "s-4");
  assert.equal(snapshot.history.length, 0);
  assert.equal(snapshot.pendingSuggestions.length, 0);
});
