import {
  createReviewModel,
  getFallbackMessage,
  transitionReviewModel,
} from "./review-state.mjs";

const initialContent = `# Nota original\n\n- Idea A\n- Idea B\n- Pendiente: conectar con permanent note.`;
const suggestedContent = `# Nota original\n\n- Idea A\n- Idea B (refinada)\n- Nueva conexión: [[Tesis sobre fricción repetida]].`;

let model = createReviewModel({ originalContent: initialContent });

const stateBadge = document.getElementById("state-badge");
const stateText = document.getElementById("state-text");
const originalPreview = document.getElementById("original-preview");
const suggestionPreview = document.getElementById("suggestion-preview");
const resultPreview = document.getElementById("result-preview");
const errorBox = document.getElementById("error-box");
const actionLog = document.getElementById("action-log");

const processingButton = document.getElementById("simulate-processing");
const runtimeErrorButton = document.getElementById("simulate-runtime-error");
const acceptButton = document.getElementById("accept");
const rejectButton = document.getElementById("reject");
const cancelButton = document.getElementById("cancel");

function updateView() {
  stateBadge.dataset.state = model.status;
  stateText.textContent = `Estado actual: ${model.status}`;

  originalPreview.value = model.originalContent;
  suggestionPreview.value = model.suggestionContent || "(sin sugerencia aún)";

  const resultText = model.appliedContent ?? model.originalContent;
  resultPreview.value = resultText;

  errorBox.textContent = model.status === "error"
    ? `${model.errorMessage}\n${getFallbackMessage(model)}`
    : "";

  const ready = model.status === "ready";
  const terminal = model.decision !== null;

  acceptButton.disabled = !ready || terminal;
  rejectButton.disabled = !ready || terminal;
  cancelButton.disabled = terminal;

  if (model.decision) {
    actionLog.textContent = `Decisión final: ${model.decision}`;
  } else {
    actionLog.textContent = "Sin decisión final aún.";
  }
}

function dispatch(event) {
  model = transitionReviewModel(model, event);
  updateView();
}

processingButton.addEventListener("click", () => {
  dispatch({ type: "START_PROCESSING" });

  window.setTimeout(() => {
    dispatch({ type: "RUNTIME_READY", suggestionContent: suggestedContent });
  }, 500);
});

runtimeErrorButton.addEventListener("click", () => {
  dispatch({ type: "START_PROCESSING" });

  window.setTimeout(() => {
    dispatch({ type: "RUNTIME_ERROR", message: "No se pudo conectar con opencode serve (HTTP/SSE)." });
  }, 350);
});

acceptButton.addEventListener("click", () => dispatch({ type: "ACCEPT" }));
rejectButton.addEventListener("click", () => dispatch({ type: "REJECT" }));
cancelButton.addEventListener("click", () => dispatch({ type: "CANCEL" }));

updateView();
