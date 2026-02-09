# AGENT & SKILLS REQUIREMENTS FROM VIDEOS

Base derivacion: VIDEO 1 + VIDEO 2 (claims trazables en analisis individuales).

## Requisitos funcionales (RF)

| ID | requisito funcional | evidencia de video | prioridad |
|---|---|---|---|
| `RF-01` | Separar flujo `external-source` y `internal-insight` en el vault | `VIDEO-1 01:42.32` "external ... separate ... internal" | Alta |
| `RF-02` | Captura multi-inbox: `source`, `daily`, `blank`, `project` | `VIDEO-2 09:23.32`, `10:20.20`, `11:08.52` | Alta |
| `RF-03` | Campo obligatorio `reference_link` para notas derivadas de fuente | `VIDEO-2 05:00.32`, `05:43.24` | Alta |
| `RF-04` | Triage con decision por nota: `drop|keep-inbox|to-atom` | `VIDEO-1 10:30.72` (externo/interno), `VIDEO-2 13:50.24` (distill central) | Alta |
| `RF-05` | Distilacion a atom en palabras propias antes de promocion | `VIDEO-1 13:27.68`, `VIDEO-2 14:12.28` | Alta |
| `RF-06` | Promocion atom -> molecule como transicion explicita de estado | `VIDEO-2 17:48.96` | Alta |
| `RF-07` | Composicion de salida desde secuencia de molecules | `VIDEO-2 25:30.24` | Media |
| `RF-08` | Priorizacion por proyecto/pregunta activa | `VIDEO-1 27:34.52`, `50:19.60` | Alta |
| `RF-09` | Metricas de valor por conexiones utiles, no por volumen bruto | `VIDEO-1 49:36.92`, `VIDEO-2 22:39.76` | Alta |
| `RF-10` | Auditoria de claims con `timestamp + cita + decision` en research | requerimiento operativo + metodologia del usuario | Alta |

## Requisitos no funcionales (RNF)

| ID | categoria | requisito no funcional |
|---|---|---|
| `RNF-01` | Seguridad | No exfiltrar notas/fuentes a servicios externos sin consentimiento explicito por sesion.
| `RNF-02` | User control | Ninguna automatizacion de mover/renombrar/borrar sin preview y confirmacion.
| `RNF-03` | Reversibilidad | Toda edicion estructural debe registrar `before/after` y permitir rollback.
| `RNF-04` | Trazabilidad | Cada nota promovida debe conservar enlace a origen (cuando aplique).
| `RNF-05` | Robustez | Si falta metadata critica (`reference_link`), degradar a warning y no destruir contenido.
| `RNF-06` | Minimalismo operativo | v0.1 debe usar el minimo de tipos/campos para evitar friccion.
| `RNF-07` | Alcance | Este agente no tiene objetivo de publicacion; salidas quedan internas al vault.
| `RNF-08` | Dependencias | No recomendar ni requerir plugins externos en este diseno.
| `RNF-09` | IA externa | No integrar servicios de IA externos en el flujo base.

## Mapeo RF/RNF -> componente

| requisito | `AGENTS.md` | `vault-bootstrap` | `zettelkasten-operator` | `obsidian-safe-editor` |
|---|---|---|---|---|
| `RF-01` | Definir politica externa/interna | Crear carpetas/plantillas base | Enforzar clasificacion en triage | Validar metadatos al guardar |
| `RF-02` | Declarar canales de captura permitidos | Provisionar templates `source/daily/blank/project` | Comando `capture --inbox` | Crear nota segura con defaults |
| `RF-03` | Regla: fuente -> `reference_link` | Campo en frontmatter de templates | Linter de metadatos en triage/promocion | Bloqueo suave + fix suggestions |
| `RF-04` | Estado obligatorio por nota | Semillas de estados | `triage` con decision explicita | Actualizacion atomica de estado |
| `RF-05` | Politica "own words before promote" | Template atom con seccion `own_words` | `distill` exige resumen propio | Diff seguro al reescribir |
| `RF-06` | Definir transiciones validas | Tags/estado iniciales | `promote atom->molecule` | Guardas anti-salto de estado |
| `RF-07` | Politica de composicion de salidas | Template output/alloy | `compose-output` desde molecules | Insercion no destructiva de embeds |
| `RF-08` | Requerir contexto de proyecto/pregunta | Campos `project_ref` en templates | Ranking por proyecto activo | Edicion segura de backlinks |
| `RF-09` | KPI recomendado en guia operativa | N/A | Reporte de conexiones y reuse | N/A |
| `RF-10` | Regla de investigacion trazable | Template research con tabla claim | Validador de tabla de claims | N/A |
| `RNF-01` | Guardrail privacidad | N/A | Bloquear integraciones externas sin flag | N/A |
| `RNF-02` | Guardrail confirmacion humana | N/A | Modo `--preview` obligatorio en cambios masivos | Aplicar cambios solo tras confirmacion |
| `RNF-03` | Politica de rollback | N/A | Registrar journal de operaciones | Implementar undo por lote |
| `RNF-04` | Estandar de trazabilidad | Metadata estandarizada | Verificacion en pipeline | Preservar referencias al editar |
| `RNF-05` | Politica de fallo seguro | N/A | Degradar a warning no destructivo | Validaciones pre-write |
| `RNF-06` | Principio de minima complejidad | Bootstrap minimo | Flujos cortos por defecto | UI/edicion simple |
| `RNF-07` | Politica de alcance (sin publicacion) | N/A | No exponer comando de publicacion | N/A |
| `RNF-08` | Guardrail de dependencias | Bootstrap solo core files | N/A | N/A |
| `RNF-09` | Guardrail de IA externa | N/A | Bloquear conectores externos en v0.1 | N/A |

## Notas de alineacion con BrainOS
- Decisiones cerradas por usuario: anti-huerfanas como recomendacion no estricta; sin recomendaciones de plugins; sin IA externa; sin objetivo de publicacion.
- Criterio rector: utilidad practica en vault real + control total del usuario.
