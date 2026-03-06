# Configuración de Netlify para Guardar Cambios en GitHub

## Problema
Si los cambios se guardan localmente pero no en GitHub/Netlify, es porque falta configurar el token de GitHub en Netlify.

## Solución: Configurar el Token de GitHub en Netlify

### Paso 1: Crear un Token de GitHub

1. Ve a GitHub.com y entra a tu cuenta
2. Ve a **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
3. Haz clic en **Generate new token** → **Generate new token (classic)**
4. Dale un nombre como "Netlify Leash to Legacy"
5. Selecciona ✅ `repo` (acceso completo a repositorios)
6. Haz clic en **Generate token**
7. **IMPORTANTE**: Copia el token inmediatamente (solo se muestra una vez)

### Paso 2: Configurar el Token en Netlify

1. Ve a tu dashboard de Netlify: https://app.netlify.com
2. Selecciona tu sitio
3. Ve a **Site settings** → **Environment variables**
4. Haz clic en **Add a variable** → **Add single variable**
5. Configura:
   - **Key**: `GITHUB_TOKEN`
   - **Value**: Pega el token
6. Haz clic en **Save**
7. Ve a **Deploys** → **Trigger deploy** → **Clear cache and deploy site**

### Paso 3: Verificar que Funciona

1. Abre el panel de administración
2. Modifica algún texto
3. Guarda los cambios
4. Deberías ver el mensaje sin "guardado localmente"