# MVP-04: Flujo E2E "Procesar nota actual" con confirmación

Estado: listo para implementación MVP v0.1
Issue: #4

## 1. Alcance

Este entregable cubre exclusivamente el flujo A de `TECHNICAL-REALTIME.md`:

1. Usuario invoca `BrainOS: Procesar nota actual` desde el editor activo.
2. El plugin toma el contenido de la nota activa y envía la solicitud al runtime por HTTP.
3. El plugin consume eventos incrementales por SSE.
4. El plugin muestra una propuesta de cambio (diff/preview) sin aplicar escritura automática.
5. El usuario decide explícitamente `Aceptar` o `Rechazar`.
6. El sistema registra la decisión (aceptado/rechazado) con trazabilidad básica.

## 2. No objetivos

1. Procesamiento por lotes de inbox.
2. Persistencia durable conversacional.
3. Automatizaciones de Canvas runtime API interna.
4. Cambio de transporte fuera de HTTP + SSE.

## 3. Requisitos funcionales

1. `RF-01` Comando UI disponible para nota activa.
2. `RF-02` Envío de contenido de nota al runtime por HTTP (sesión activa).
3. `RF-03` Recepción incremental de progreso/salida por SSE.
4. `RF-04` Render de propuesta de cambio en formato preview/diff.
5. `RF-05` Acción obligatoria del usuario antes de cualquier escritura.
6. `RF-06` Registro de decisión (`accepted` o `rejected`) con timestamp y nota objetivo.

## 4. Contrato interno mínimo (plugin)

Para evitar acoplamiento a nombres de eventos externos versionados, el plugin normaliza eventos del runtime en una capa adaptadora interna:

```ts
export type ProcessingEvent =
  | { kind: 'run_started'; sessionId: string; notePath: string; at: string }
  | { kind: 'progress'; message: string; at: string }
  | { kind: 'output_delta'; delta: string; at: string }
  | { kind: 'suggestion_ready'; patch: string; at: string }
  | { kind: 'run_completed'; at: string }
  | { kind: 'run_failed'; error: string; at: string };
```

Notas:
- Los nombres reales de eventos de OpenCode se resuelven en el adaptador, no en la UI.
- La UI y la lógica de confirmación dependen solo de `ProcessingEvent`.

## 5. Máquina de estados del flujo

```text
IDLE
  -> REQUESTING (HTTP request enviada)
  -> STREAMING (SSE activo)
  -> REVIEW_REQUIRED (hay patch disponible)
      -> ACCEPTED (se aplica cambio)
      -> REJECTED (no se aplica cambio)
  -> COMPLETED

Errores:
REQUESTING/STREAMING -> FAILED (fallback seguro, sin escritura)
```

## 6. Reglas de seguridad MVP

1. Nunca aplicar cambios automáticamente al recibir `suggestion_ready`.
2. Si hay error de red/runtime, terminar en `FAILED` sin tocar el archivo.
3. Si el usuario cancela o rechaza, registrar decisión y conservar nota original.
4. No crear archivos permanentes adicionales fuera del registro mínimo de decisión.

## 7. Criterios de aceptación (issue #4)

1. El usuario completa el flujo dentro del editor (sin salir a herramientas externas).
2. Ningún cambio se aplica sin confirmación explícita.
3. La decisión queda registrada como `accepted` o `rejected`.
4. Existe demo reproducible local documentada.

## 8. Demo reproducible local

Artefactos en `BrainOS/30-Implementation/mvp-04-demo/`:

1. `active-note.md`: nota de entrada.
2. `runtime-events.ndjson`: stream incremental simulado.
3. `suggested.patch`: diff propuesto por el runtime.
4. `decision-log.ndjson`: ejemplo de registro de decisión.

Pasos de demo:

1. Abrir `active-note.md` como nota activa.
2. Ejecutar comando `BrainOS: Procesar nota actual`.
3. Reproducir `runtime-events.ndjson` en la UI de estado (simulación de SSE).
4. Mostrar preview con `suggested.patch`.
5. Elegir `Aceptar` o `Rechazar`.
6. Verificar línea nueva en `decision-log.ndjson` con `decision` y `notePath`.

## 9. Checklist de validación manual

- [ ] El comando aparece en paleta y opera sobre la nota activa.
- [ ] Se muestra progreso incremental durante streaming.
- [ ] Se muestra un diff/preview antes de escribir.
- [ ] Sin clic en `Aceptar`, no hay cambios en la nota.
- [ ] Con `Rechazar`, no hay cambios en la nota y se registra decisión.
- [ ] Con `Aceptar`, se aplica el patch y se registra decisión.
- [ ] Ante error de conexión, no hay escritura y estado final es fallo seguro.

## 10. Riesgos y follow-up

1. Versionado de eventos runtime: mitigar con adaptador aislado.
2. Diffs ambiguos/conflictivos: bloquear aplicación automática y mantener preview.
3. UX de confirmación: medir fricción en el ciclo metodológico de 2-3 semanas.
