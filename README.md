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

Para el despliegue recomendado en AWS, usa `infrastructure/s3-only.yml`. Esta
plantilla crea solamente el bucket S3 privado; el certificado, CloudFront y Route 53
se configuran después siguiendo `infrastructure/GUIA-S3-CLOUDFRONT-MANUAL.md`.

La plantilla anterior de infraestructura completa permanece en
`infrastructure/cloudformation.yml` como referencia, pero no debe usarse mientras
el dominio continúe asociado a un recurso anterior de CloudFront.
