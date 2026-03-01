# 🔧 Solución: Token de GitHub no configurado

## Error que estás viendo:
```
Token no configurado en variables de entorno
```

## ✅ Solución paso a paso:

### Paso 1: Crear un Token de GitHub

1. Ve a **GitHub.com** e inicia sesión
2. Haz clic en tu foto de perfil (arriba derecha) → **Settings**
3. En el menú lateral izquierdo, ve a **Developer settings**
4. Haz clic en **Personal access tokens** → **Tokens (classic)**
5. Haz clic en **Generate new token** → **Generate new token (classic)**
6. Configura:
   - **Note**: `Netlify Leash to Legacy` (o cualquier nombre)
   - **Expiration**: Elige una fecha (recomiendo 90 días o más)
   - **Select scopes**: Marca ✅ **repo** (esto da acceso completo a repositorios)
7. Haz clic en **Generate token** (abajo)
8. ⚠️ **IMPORTANTE**: Copia el token inmediatamente (empieza con `ghp_`). Solo se muestra una vez.

### Paso 2: Configurar el Token en Netlify

1. Ve a **https://app.netlify.com**
2. Selecciona tu sitio: **leachtolegacy** (o el nombre que tenga)
3. En el menú superior, haz clic en **Site settings**
4. En el menú lateral izquierdo, busca y haz clic en **Environment variables**
5. Haz clic en **Add a variable** (botón azul)
6. Completa:
   - **Key**: `GITHUB_TOKEN` (exactamente así, en mayúsculas)
   - **Value**: Pega el token que copiaste (el que empieza con `ghp_`)
7. Haz clic en **Save**

### Paso 3: Hacer un Nuevo Deploy (MUY IMPORTANTE)

⚠️ **CRÍTICO**: Después de agregar la variable, DEBES hacer un nuevo deploy para que la función la reconozca.

1. En Netlify, ve a **Deploys** (en el menú superior)
2. Haz clic en **Trigger deploy** → **Clear cache and deploy site**
3. Espera a que termine el deploy (verás un check verde)

### Paso 4: Verificar que Funciona

1. Abre tu panel de administración
2. Modifica un texto (por ejemplo, About Us)
3. Guarda los cambios
4. Deberías ver: **"About Us actualizado exitosamente"** (sin el texto "guardado localmente")
5. Espera 1-2 minutos y recarga la página principal para ver los cambios

## 🔍 Verificar que el Token Está Configurado

1. En Netlify, ve a **Site settings** → **Environment variables**
2. Deberías ver `GITHUB_TOKEN` en la lista
3. Si no aparece, agrégalo siguiendo el Paso 2

## ❌ Si Aún No Funciona

1. **Verifica el nombre del repositorio**:
   - En `netlify/functions/update-site-data.js`, línea 50-51, verifica que el `owner` y `repo` sean correctos
   - Actualmente está: `owner: "AdrianCrea038"`, `repo: "leash-to-legacy"`

2. **Verifica los permisos del token**:
   - El token debe tener el scope `repo` marcado
   - Si no lo tiene, crea uno nuevo

3. **Revisa los logs de la función**:
   - En Netlify, ve a **Functions** → **update-site-data** → **Logs**
   - Ahí verás errores más detallados

4. **Verifica que la función esté desplegada**:
   - En Netlify, ve a **Functions**
   - Deberías ver `update-site-data` en la lista
   - Si no aparece, verifica que el archivo esté en `netlify/functions/update-site-data.js`

## 📝 Nota Importante

- El token tiene acceso completo a tus repositorios. Manténlo seguro.
- No compartas el token públicamente.
- Si el token expira, necesitarás crear uno nuevo y actualizarlo en Netlify.

