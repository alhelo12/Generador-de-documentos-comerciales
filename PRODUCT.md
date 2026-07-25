# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

El usuario principal es el dueño de una pequena empresa que necesita crear y gestionar documentos comerciales durante su operacion diaria.

## Product Purpose

DocGen permite trabajar con documentos comerciales de forma local y offline. El producto debe permitir que una pequena empresa opere sin depender de una cuenta, un backend o una conexion permanente a internet.

El exito se mide por la capacidad de completar el trabajo documental dentro de la aplicacion y conservar los datos localmente.

## Positioning

Decision abierta. El repositorio confirma una herramienta local para documentos comerciales, pero no define un posicionamiento diferencial aprobado por el usuario.

## Operating Context

El usuario crea facturas, cotizaciones y notas de remision, edita datos de empresa y cliente, agrega conceptos, consulta el historial y prepara documentos para imprimir o descargar como PDF.

Los documentos se usan como archivos comerciales imprimibles y pueden conservarse en el historial local de la aplicacion.

## Capabilities and Constraints

- Crear facturas, cotizaciones y notas de remision.
- Editar datos de empresa, cliente, conceptos, impuestos, notas, condiciones, datos bancarios y firmas.
- Usar plantillas de documento clasica, moderna y minimalista.
- Guardar documentos en IndexedDB.
- Guardar configuracion de empresa en localStorage.
- Exportar e importar respaldos JSON.
- Imprimir mediante el dialogo nativo del navegador.
- Descargar PDF mediante html2pdf.js.
- No existe login, backend ni sincronizacion remota confirmada.
- La aplicacion debe seguir funcionando sin conexion despues de cargar sus recursos.
- Las interfaces deben conservar comportamiento responsive para escritorio y movil web.

## Brand Commitments

- Nombre del producto: DocGen.
- Terminologia funcional actual: factura, cotizacion, remision, historial, configuracion, cliente y empresa.
- La identidad visual actual existe en el codigo y puede evolucionar en trabajos posteriores, pero este documento no fija una nueva direccion visual.

## Evidence on Hand

- Aplicacion Vue 3 en `src/`.
- Rutas funcionales para dashboard, editor, historial y configuracion.
- Plantillas imprimibles en `src/components/documents/`.
- Persistencia local mediante `idb-keyval` y `localStorage`.
- No hay testimonios, clientes, metricas comerciales ni pruebas externas aprobadas para usar como claims.

## Product Principles

- Local-first: el trabajo y los datos deben permanecer disponibles localmente.
- Documentos utilizables: el resultado debe ser claro, imprimible y exportable.
- Operacion directa: las tareas frecuentes deben requerir pocos pasos.
- Control del negocio: empresa, numeracion, plantillas y secciones deben ser configurables.

## Accessibility & Inclusion

Requisito abierto. Las futuras decisiones deben preservar como minimo el uso responsive, el foco visible, los controles nativos comprensibles y el contraste suficiente.
