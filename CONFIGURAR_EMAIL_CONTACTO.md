# Configurar que los mensajes de Contact lleguen a shawn@leashtolegacy.org

Los mensajes del formulario de contacto se envían por email usando **Resend**.

## Pasos

### 1. Crear cuenta en Resend

1. Entra en [resend.com](https://resend.com) y crea una cuenta (gratis).
2. En el dashboard, ve a **API Keys** y crea una nueva clave.
3. Copia la clave (empieza por `re_`).

### 2. Añadir la clave en Netlify

1. Entra en [app.netlify.com](https://app.netlify.com) y abre tu sitio.
2. Ve a **Site settings** → **Environment variables**.
3. Pulsa **Add a variable**.
4. **Key:** `RESEND_API_KEY`
5. **Value:** pega la clave.
6. Guarda.

### 3. Hacer un nuevo deploy

1. En Netlify, ve a **Deploys**.
2. Pulsa **Trigger deploy** → **Clear cache and deploy site**.

### 4. Probar

1. Abre la página de tu sitio.
2. Ve a la sección **Contact**.
3. Rellena y envía.
4. Deberías recibir el mensaje en **shawn@leashtolegacy.org**.