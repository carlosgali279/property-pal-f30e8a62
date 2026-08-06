# Property Pal

Quiero construir una plataforma web de seguimiento de predios inmobiliarios. Estas son las especificaciones:

Contexto general

Administro 37 predios (crecimiento esporádico, no frecuente). Cada predio tiene documentos, datos clave y un seguimiento financiero. Hoy todo está disperso en carpetas de Drive y Excel; quiero centralizarlo.

Roles y vistas (simulado, sin login real)

Dos roles:

Admin (soy yo): acceso total a todos los predios — puede crear/editar predios, subir y editar documentos (simulado), y gestionar el módulo financiero.

Propietario: solo puede VER los predios que le correspondan (según los datos mock), sus documentos, su estado de completitud, alertas y reportes. No puede editar.

No uses autenticación real todavía. El rol se selecciona con un control simple en la interfaz (ej. dropdown "Ver como: Admin / Propietario X / Propietario Y"), y la app filtra lo que se muestra según el rol seleccionado.

Modelo de datos (entidades principales)

Predio

nombre / identificador

dirección / ciudad (ubicación)

razón social (a nombre de quién está)

estado (ej: arrendado, en construcción, disponible — puedes proponerme un set inicial)

propietario(s) / socio(s) (relación muchos-a-muchos con "Contactos", ver abajo)

Contacto (propietario/socio)

nombre

rol dentro del predio (propietario principal / socio)

email

teléfono

Documento

predio asociado

tipo de documento (de una lista predefinida, ver abajo, pero debe poder ampliarse)

archivo adjunto

fecha de carga

para el tipo "Contrato de arrendamiento" específicamente: fecha de inicio, fecha de terminación, % de aumento del canon

Tipos de documento iniciales (lista editable/ampliable, no cerrada):

Planos

Licencia de construcción

Contrato de arrendamiento

Otrosí

Escritura del inmueble

Contacto del arrendatario

Cotización de mantenimientos / Facturas

Contrato de construcción

Movimiento financiero

predio asociado

tipo: ingreso o gasto

categoría (ingresos: arriendo, aumento de canon, otros — gastos: mantenimiento, impuestos, servicios, otros)

monto

fecha

descripción/nota opcional

Funcionalidades clave

Dashboard de predios: listado de los 37 predios con filtros por ubicación, razón social y propietario/socio. Cada tarjeta de predio debe mostrar de un vistazo un indicador de completitud de documentos (ej. "6/8 documentos cargados" con un ícono de alerta si falta algo).

Vista de detalle de predio:

Info general (ubicación, razón social, propietarios/socios).

Sección de documentos: lista de los tipos de documento con estado (cargado / faltante), botón para subir/reemplazar archivo.

Sección financiera: tabla de ingresos y gastos del predio, con totales y algún gráfico simple de balance por periodo.

Sección de alertas: fechas próximas a vencer (ej. terminación de contrato de arrendamiento), calculadas desde los datos del documento.

Alertas: mostrar de forma visible (dashboard o notificación dentro de la plataforma) los contratos/documentos con fecha de vencimiento próxima (ej. dentro de 30 días).

Reportes: poder generar/exportar un reporte en PDF y en Excel de un predio (info general + documentos + resumen financiero), pensado para entregarle a un propietario o socio.

Vista de propietario: versión reducida de todo lo anterior, solo lectura, filtrada a sus predios.

Notas técnicas

Esta primera versión es SOLO FRONTEND. No conectes Supabase, no uses backend, ni autenticación real, ni storage real, ni ninguna integración externa (nada de Drive tampoco).

Todos los datos deben ser mock/estáticos, guardados en el estado de la app (o un archivo de datos de ejemplo) — no en una base de datos real. Genera datos de ejemplo realistas para varios predios (no hace falta que sean los 37, con 6-8 predios de muestra es suficiente para ver el diseño funcionando).

La "subida" de documentos puede simularse (ej. seleccionar un archivo y que aparezca en la lista como si se hubiera subido, sin guardarlo realmente en ningún lado).

El cambio de rol (Admin / Propietario) puede simularse con un selector simple en la interfaz (ej. un switch o dropdown "Ver como: Admin / Propietario"), sin login real.

La generación de reportes en PDF/Excel puede ser un botón que simule la acción (o genere algo básico en el navegador) — no necesita ser robusto todavía.

Diseño limpio, tipo dashboard administrativo, priorizando que se entienda rápido el estado de cada predio (completitud de documentos + salud financiera) desde el listado principal.

Alcance de esta primera versión

Quiero que construyas TODO el frontend en esta misma iteración, completo y navegable con datos mock:

Dashboard principal de predios con filtros (ubicación, razón social, propietario) e indicador de completitud.

Vista de detalle de predio completa: info general, documentos (lista con estado cargado/faltante y botón de "subir" simulado), sección financiera con tabla y gráfico de balance, y sección de alertas de vencimiento.

Botones de "generar reporte" en PDF y Excel por predio (pueden ser simulados por ahora).

Vista de propietario (solo lectura, filtrada a sus predios), accesible mediante el selector de rol simulado.

El objetivo de esta iteración es tener el diseño y la navegación completos para poder validar el flujo visualmente. La conexión con datos reales (base de datos, autenticación, Drive) la haremos en una siguiente fase, una vez validado el diseño.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/6753f379-545a-4337-a51a-52792ee2d913).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
