# Configuración de Netlify para Guardar Cambios en GitHub

## Problema
Si los cambios se guardan localmente pero no en GitHub/Netlify, es porque falta configurar el token de GitHub en Netlify.

## Solución: Configurar el Token de GitHub en Netlify

### Paso 1: Crear un Token de GitHub

1. Ve a GitHub.com y entra a tu cuenta
2. Ve a **Settings** (Configuración) → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
3. Haz clic en **Generate new token** → **Generate new token (classic)**
4. Dale un nombre como "Netlify Leash to Legacy"
5. Selecciona los siguientes permisos (scopes):
   - ✅ `repo` (acceso completo a repositorios)
6. Haz clic en **Generate token**
7. **IMPORTANTE**: Copia el token inmediatamente (solo se muestra una vez). Se verá algo como: `ghp_xxxxxxxxxxxxxxxxxxxx`

### Paso 2: Configurar el Token en Netlify

1. Ve a tu dashboard de Netlify: https://app.netlify.com
2. Selecciona tu sitio (leash-to-legacy o el nombre que tenga)
3. Ve a **Site settings** (Configuración del sitio)
4. En el menú lateral, busca **Environment variables** (Variables de entorno)
5. Haz clic en **Add a variable** (Agregar variable)
6. Configura:
   - **Key**: `GITHUB_TOKEN`
   - **Value**: Pega el token que copiaste en el Paso 1
7. Haz clic en **Save**
8. **IMPORTANTE**: Después de agregar la variable, necesitas hacer un nuevo deploy:
   - Ve a **Deploys** (Despliegues)
   - Haz clic en **Trigger deploy** → **Clear cache and deploy site**

### Paso 3: Verificar que Funciona

1. Abre el panel de administración en tu sitio
2. Modifica algún texto (por ejemplo, About Us)
3. Guarda los cambios
4. Deberías ver el mensaje: "About Us actualizado exitosamente" (sin el texto "guardado localmente")
5. Espera 1-2 minutos y recarga la página principal para ver los cambios

## Verificar que la Función Está Desplegada

1. En Netlify, ve a **Functions** (Funciones)
2. Deberías ver `update-site-data` en la lista
3. Si no aparece, verifica que:
   - El archivo esté en `netlify/functions/update-site-data.js`
   - El archivo `netlify.toml` esté en la raíz del proyecto
   - Haya un nuevo deploy después de agregar estos archivos

## Solución de Problemas

### Error: "Token no configurado"
- Verifica que la variable `GITHUB_TOKEN` esté configurada en Netlify
- Asegúrate de haber hecho un nuevo deploy después de agregar la variable

### Error: "Method Not Allowed" o 405
- Verifica que estés haciendo un POST request
- Revisa la consola del navegador (F12) para ver el error completo

### Error: "No se pudo conectar"
- Verifica que la función esté desplegada en Netlify
- Revisa los logs de la función en Netlify (Functions → update-site-data → Logs)

### Los cambios no aparecen
- Espera 1-2 minutos después de guardar (Netlify necesita tiempo para actualizar)
- Recarga la página con Ctrl+F5 (forzar recarga)
- Verifica en GitHub que el archivo `site-data.json` se haya actualizado

## Nota Importante

El token de GitHub tiene permisos completos a tus repositorios. Manténlo seguro y no lo compartas públicamente.

