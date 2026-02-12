---
name: brainos-link-suggester
description: Sugiere 1-3 wikilinks relevantes con justificacion semantica breve y sin inventar relaciones.
---

# Skill: brainos-link-suggester

## Cuando usar

- Despues de clasificar una nota para proponer conexiones utiles.
- Cuando se necesita enriquecer una nota sin reescribirla completa.

## Entrada esperada

- Nota actual (titulo, ruta, contenido).
- Lista de notas candidatas en el vault (si disponible).

## Salida obligatoria

1. Entre 1 y 3 enlaces sugeridos en formato wikilink.
2. Justificacion breve por enlace.
3. Indicacion explicita de dudas cuando la similitud semantica no es suficiente.

## Reglas

1. No inventar relaciones sin respaldo semantico.
2. No sugerir auto-enlace a la misma nota.
3. Si no hay buena conexion, devolver lista vacia y explicacion.
