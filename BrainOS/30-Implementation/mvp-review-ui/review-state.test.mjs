import test from "node:test";
import assert from "node:assert/strict";

import {
  createReviewModel,
  getFallbackMessage,
  transitionReviewModel,
} from "./review-state.mjs";

test("transiciona a ready y acepta de forma deterministica", () => {
  const model = createReviewModel({ originalContent: "ORIGINAL" });

  const processing = transitionReviewModel(model, { type: "START_PROCESSING" });
  assert.equal(processing.status, "processing");

  const ready = transitionReviewModel(processing, {
    type: "RUNTIME_READY",
    suggestionContent: "SUGERIDA",
  });
  assert.equal(ready.status, "ready");

  const accepted = transitionReviewModel(ready, { type: "ACCEPT" });
  assert.equal(accepted.decision, "accepted");
  assert.equal(accepted.appliedContent, "SUGERIDA");

  const ignored = transitionReviewModel(accepted, { type: "REJECT" });
  assert.equal(ignored.decision, "accepted");
  assert.equal(ignored.appliedContent, "SUGERIDA");
});

test("rechazar conserva el contenido original", () => {
  const model = createReviewModel({ originalContent: "BASE" });
  const ready = transitionReviewModel(
    transitionReviewModel(model, { type: "START_PROCESSING" }),
    { type: "RUNTIME_READY", suggestionContent: "CAMBIO" },
  );

  const rejected = transitionReviewModel(ready, { type: "REJECT" });
  assert.equal(rejected.decision, "rejected");
  assert.equal(rejected.appliedContent, "BASE");
});

test("error de runtime muestra fallback sin perder control", () => {
  const model = createReviewModel({ originalContent: "BASE" });
  const failed = transitionReviewModel(
    transitionReviewModel(model, { type: "START_PROCESSING" }),
    { type: "RUNTIME_ERROR", message: "Sin conexion" },
  );

  assert.equal(failed.status, "error");
  assert.equal(failed.errorMessage, "Sin conexion");
  assert.match(getFallbackMessage(failed), /Runtime no disponible/);
  assert.equal(failed.originalContent, "BASE");
});

test("ignora runtime_ready tardio cuando ya no esta procesando", () => {
  const model = createReviewModel({ originalContent: "BASE" });
  const failed = transitionReviewModel(
    transitionReviewModel(model, { type: "START_PROCESSING" }),
    { type: "RUNTIME_ERROR", message: "Sin conexion" },
  );

  const staleReady = transitionReviewModel(failed, {
    type: "RUNTIME_READY",
    suggestionContent: "CAMBIO TARDIO",
  });

  assert.equal(staleReady.status, "error");
  assert.equal(staleReady.errorMessage, "Sin conexion");
  assert.equal(staleReady.suggestionContent, "");
});

test("cancelar deja resultado controlado por usuario", () => {
  const model = createReviewModel({ originalContent: "BASE" });

  const cancelled = transitionReviewModel(model, { type: "CANCEL" });
  assert.equal(cancelled.decision, "cancelled");
  assert.equal(cancelled.status, "idle");
  assert.equal(cancelled.appliedContent, "BASE");
});
