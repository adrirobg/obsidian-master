const TERMINAL_DECISIONS = new Set(["accepted", "rejected", "cancelled"]);

function ensureString(value, fieldName) {
  if (typeof value !== "string") {
    throw new TypeError(`${fieldName} must be a string`);
  }
  return value;
}

export function createReviewModel({ originalContent, suggestionContent = "" }) {
  return {
    status: "idle",
    decision: null,
    originalContent: ensureString(originalContent, "originalContent"),
    suggestionContent: ensureString(suggestionContent, "suggestionContent"),
    appliedContent: null,
    errorMessage: "",
  };
}

function canTransition(model) {
  return !TERMINAL_DECISIONS.has(model.decision);
}

export function transitionReviewModel(model, event) {
  if (!model || typeof model !== "object") {
    throw new TypeError("model must be an object");
  }
  if (!event || typeof event !== "object") {
    throw new TypeError("event must be an object");
  }

  const next = { ...model };

  if (!canTransition(next)) {
    return next;
  }

  switch (event.type) {
    case "START_PROCESSING": {
      next.status = "processing";
      next.errorMessage = "";
      next.decision = null;
      return next;
    }
    case "RUNTIME_READY": {
      next.status = "ready";
      next.suggestionContent = ensureString(event.suggestionContent, "suggestionContent");
      next.errorMessage = "";
      return next;
    }
    case "RUNTIME_ERROR": {
      next.status = "error";
      next.errorMessage = ensureString(event.message, "message");
      return next;
    }
    case "ACCEPT": {
      if (next.status !== "ready") {
        return next;
      }
      next.decision = "accepted";
      next.appliedContent = next.suggestionContent;
      return next;
    }
    case "REJECT": {
      if (next.status !== "ready") {
        return next;
      }
      next.decision = "rejected";
      next.appliedContent = next.originalContent;
      return next;
    }
    case "CANCEL": {
      next.decision = "cancelled";
      next.status = "idle";
      next.appliedContent = next.originalContent;
      next.errorMessage = "";
      return next;
    }
    default:
      return next;
  }
}

export function getFallbackMessage(model) {
  if (model.status !== "error") {
    return "";
  }
  return "Runtime no disponible. Mantén control manual del contenido y reintenta cuando el servicio esté activo.";
}
