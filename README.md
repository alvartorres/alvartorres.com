# alvartorres.com

Sitio web estático de Alvar Torres y Nuevo Contrato Social.

## Estructura

- `index.html`: página principal.
- `propuesta/`: explorador interactivo de la propuesta.
- `bio/`: biografía.
- `documentos/`: documentos descargables.
- `libro/`: El método Ututo.
- `contacto/`: contacto y prensa.
- `apoyar/`: información para apoyar el proyecto.
- `assets/`: fotografías y documentos PDF.

## Desarrollo local

No requiere compilación ni instalación de dependencias. Se puede servir con cualquier
servidor HTTP estático.

## Despliegue

El repositorio incluye `amplify.yml` para AWS Amplify Hosting. Al conectar la rama
principal, Amplify publica directamente los archivos estáticos del repositorio.

También incluye `infrastructure/cloudformation.yml` para crear una arquitectura
alternativa con S3 privado, CloudFront, certificado ACM y registros de Route 53.
