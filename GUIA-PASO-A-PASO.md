# ByteClaro — guía para activar el comparador real

## Qué hace ahora el código
- La página permite buscar productos por texto, ordenar por precio y limitar el precio máximo.
- Los resultados se solicitan a un endpoint del servidor; el navegador no recibe la clave privada.
- Sin una clave válida y aprobada, la web informa de que la API no está configurada. No se inventan ofertas.
- La API candidata es Comparaloo. Sus datos requieren atribución visible y los enlaces de compra deben conservarse según sus condiciones.

## Paso 1. Solicitar acceso a la API
1. Publica primero el sitio para que el proveedor pueda revisarlo.
2. Lee los requisitos y solicita acceso en https://comparaloo.es/developers .
3. Espera la aprobación. La API es gratuita según su documentación, pero el acceso no es automático.
4. Guarda la clave que te entreguen; no la pegues en HTML, JavaScript del navegador ni en este repositorio.

## Paso 2. Desplegar ByteClaro en Netlify
GitHub Pages solo sirve archivos estáticos y no ejecuta la función de servidor. Para esta versión, despliega el repositorio con Netlify:
1. Crea una cuenta gratuita en https://www.netlify.com/ .
2. Añade un nuevo sitio importando el repositorio GitHub `Javiantonc/ByteClaro-v2`.
3. Deja el directorio de publicación como `.`; `netlify.toml` ya configura las funciones y la ruta `/api/search`.
4. Espera a que termine el despliegue y abre la URL de Netlify.

## Paso 3. Guardar la clave en el servidor
En la configuración del sitio Netlify, busca **Environment variables** y crea:
- Nombre: `COMPARALOO_API_KEY`
- Valor: la clave que te haya dado Comparaloo.

Guarda los cambios y vuelve a desplegar el sitio para que la función reciba la variable. No publiques el valor de la clave ni lo incluyas en capturas.

## Paso 4. Probar
1. Abre la URL de Netlify y busca un modelo concreto.
2. Comprueba que aparecen ofertas y que los enlaces llevan a la fuente de compra.
3. Si aparece un error de autorización, revisa que el proveedor haya aprobado la cuenta y que la variable de entorno esté escrita correctamente.
4. Los datos de la API se actualizan según el proveedor; no representan necesariamente todos los comercios de España ni garantizan el precio final con envío.

## Archivos importantes
- `index.html`: interfaz de búsqueda.
- `styles.css`: diseño responsive.
- `script.js`: consulta al endpoint y renderizado de resultados.
- `netlify/functions/search.mjs`: función segura que consulta la API.
- `netlify.toml`: configuración de despliegue y ruta API.

## Limitaciones y costes
El código es gratuito, pero la aprobación del proveedor es necesaria para obtener precios reales. La API de Comparaloo indica que sus enlaces de compra deben pasar por su red y que los datos deben atribuirse de forma visible. Revisa sus términos actuales: https://comparaloo.es/developers/docs . La integración todavía no puede considerarse activa hasta que añadas la clave y compruebes una búsqueda real.
