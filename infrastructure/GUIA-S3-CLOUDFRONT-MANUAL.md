# Despliegue de alvartorres.com: S3 por CloudFormation y CloudFront manual

Esta variante separa los componentes para que un problema con el dominio no elimine el bucket ni el sitio. La plantilla `s3-only.yml` crea únicamente un bucket S3 privado, cifrado y versionado. El bucket tiene políticas de retención para que CloudFormation no lo borre al eliminar el stack.

## 1. Eliminar el stack fallido anterior

1. En CloudFormation, espera que el stack anterior llegue a `ROLLBACK_COMPLETE`.
2. Elimina ese stack.
3. No es necesario borrar un certificado ACM válido.

## 2. Crear solamente el bucket S3

1. Abre CloudFormation en la región **US East (N. Virginia), `us-east-1`**.
2. Elige **Create stack** y **With new resources**.
3. Selecciona **Upload a template file**.
4. Sube `infrastructure/s3-only.yml`.
5. Usa el nombre de stack `alvartorres-s3`.
6. Conserva `ProjectName = alvartorres.com` y crea el stack.
7. Cuando llegue a `CREATE_COMPLETE`, abre **Outputs** y copia `BucketName`.

## 3. Subir el sitio

1. Abre S3 y entra al bucket indicado por `BucketName`.
2. Elige **Upload**.
3. Sube **el contenido** de la carpeta local `para s3`, no la carpeta contenedora.
4. En la raíz del bucket deben quedar `index.html`, `styles.css`, `script.js` y las carpetas `assets`, `bio`, `propuesta`, etc.
5. Mantén bloqueado el acceso público. No actives **Static website hosting**.

## 4. Crear o revisar el certificado ACM

CloudFront solo acepta certificados ACM de **`us-east-1`**.

Si ya existe un certificado, comprueba que:

- su estado sea **Issued**;
- esté en `us-east-1`;
- incluya `alvartorres.com` y `www.alvartorres.com`.

Si falta alguno de esos requisitos:

1. Abre Certificate Manager en `us-east-1`.
2. Elige **Request certificate** y **Request a public certificate**.
3. Agrega `alvartorres.com` y `www.alvartorres.com`.
4. Elige **DNS validation**.
5. Después de solicitarlo, abre el certificado y elige **Create records in Route 53**.
6. Espera hasta que el estado sea **Issued**.

No elimines los CNAME de validación de ACM: permiten la renovación automática.

## 5. Crear CloudFront primero sin el dominio personalizado

1. Abre CloudFront y elige **Create distribution**.
2. Selecciona **Single website or app**.
3. Nombre: `alvartorres-production`.
4. Tipo de origen: **Amazon S3**.
5. Usa **Browse S3** y selecciona el bucket creado por el stack.
6. Elige **Use recommended origin settings**. Esto crea un Origin Access Control (OAC) y permite que CloudFront actualice la política del bucket.
7. No selecciones un endpoint de tipo `s3-website`; usa el bucket S3 normal.
8. En seguridad, no habilites AWS WAF salvo que quieras asumir su costo adicional.
9. Crea la distribución **sin agregar todavía** `alvartorres.com` ni `www`.
10. Espera a que el estado sea **Deployed**.

Después abre la distribución, edita **Settings** y establece:

- **Default root object:** `index.html`
- **HTTP versions:** HTTP/2 y HTTP/3
- **IPv6:** Enabled
- **Price class:** `Use North America and Europe` si quieres la alternativa de menor costo

Guarda los cambios y espera nuevamente a que diga **Deployed**.

## 6. Habilitar las rutas limpias

Sin esta función, `/bio/` y `/propuesta/` no encontrarían sus archivos `index.html` dentro del bucket privado.

1. En CloudFront abre **Functions** y elige **Create function**.
2. Nombre: `alvartorres-clean-urls`.
3. Runtime: **cloudfront-js-2.0**.
4. Pega este código:

```javascript
async function handler(event) {
    var request = event.request;
    var uri = request.uri;

    if (uri.endsWith('/')) {
        request.uri += 'index.html';
    } else if (!uri.includes('.')) {
        request.uri += '/index.html';
    }

    return request;
}
```

5. Guarda, prueba y elige **Publish function**. La función debe quedar en la etapa **LIVE**.
6. Ignora **Associated KeyValueStore**; el sitio no utiliza un KeyValueStore.
7. Vuelve a **CloudFront → Distributions** y abre la distribución nueva.
8. Abre **Behaviors**, selecciona `Default (*)` y elige **Edit**.
9. En **Function associations**, busca **Viewer request** y selecciona `alvartorres-clean-urls` como CloudFront Function.
10. Deja **Viewer response** sin asociación y guarda los cambios.
11. Espera a que la distribución termine de desplegar.

## 7. Probar antes de conectar el dominio

Abre el dominio asignado por CloudFront, por ejemplo:

`https://d123example.cloudfront.net/`

Comprueba también:

- `/bio/`
- `/propuesta/`
- `/documentos/`

No continúes hasta que estas rutas funcionen.

## 8. Agregar el certificado y los dominios

1. Abre la distribución y elige **Settings → Edit**.
2. En **Custom SSL certificate**, selecciona el certificado ACM emitido, pero no agregues dominios todavía.
3. Guarda y espera el estado **Deployed**. Esto deja preparada la distribución de destino para diagnosticar o mover un dominio ocupado.
4. Vuelve a **Settings → Edit** y en **Alternate domain names** agrega:
   - `alvartorres.com`
   - `www.alvartorres.com`
5. Guarda y espera el estado **Deployed**.

### Si reaparece `CNAMEAlreadyExists`

La distribución seguirá funcionando mediante `cloudfront.net`. Anota su **Distribution ID** y usa AWS CloudShell para identificar el dueño del alias:

```bash
aws cloudfront list-domain-conflicts \
  --domain alvartorres.com \
  --domain-control-validation-resource DistributionId=ID_DE_LA_DISTRIBUCION
```

Repite con `www.alvartorres.com`. Si el conflicto pertenece a esta misma cuenta, o el recurso anterior ya está deshabilitado, obtén el ETag actual y mueve primero el dominio raíz:

```bash
ETAG=$(aws cloudfront get-distribution-config \
  --id ID_DE_LA_DISTRIBUCION \
  --query ETag \
  --output text)

aws cloudfront update-domain-association \
  --domain alvartorres.com \
  --target-resource DistributionId=ID_DE_LA_DISTRIBUCION \
  --if-match "$ETAG"
```

Obtén un ETag nuevo y repite para `www`:

```bash
ETAG=$(aws cloudfront get-distribution-config \
  --id ID_DE_LA_DISTRIBUCION \
  --query ETag \
  --output text)

aws cloudfront update-domain-association \
  --domain www.alvartorres.com \
  --target-resource DistributionId=ID_DE_LA_DISTRIBUCION \
  --if-match "$ETAG"
```

Si el comando indica que el recurso de origen pertenece a otra cuenta y sigue habilitado, no se puede forzar desde esta cuenta. Abre un caso de AWS Support con el ID de la distribución nueva; ya tendrás un destino verificable para que AWS libere o mueva el dominio.

## 9. Crear los registros de Route 53

Haz este paso solamente después de que CloudFront acepte ambos dominios.

1. Abre Route 53 → **Hosted zones** → `alvartorres.com`.
2. Crea un registro **A**, activa **Alias**, deja vacío el nombre y selecciona **Alias to CloudFront distribution**.
3. Selecciona la distribución nueva.
4. Crea también un registro **AAAA** equivalente para el dominio raíz.
5. Repite ambos registros con nombre `www`.
6. No borres los registros NS, SOA ni los CNAME de validación ACM.

## 10. Actualizaciones posteriores

Para publicar cambios, reemplaza los archivos en S3. Después abre CloudFront → **Invalidations** y crea una invalidación con:

`/*`

Esto fuerza a CloudFront a entregar inmediatamente la versión nueva.
