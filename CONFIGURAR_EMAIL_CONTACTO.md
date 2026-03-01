# Configurar que los mensajes de Contact lleguen a shawn@leashtolegacy.org

Los mensajes del formulario de contacto se envían por email usando **Resend**. Solo necesitas crear una cuenta gratuita y añadir la API key en Netlify.

## Pasos

### 1. Crear cuenta en Resend

1. Entra en [resend.com](https://resend.com) y crea una cuenta (gratis).
2. En el dashboard, ve a **API Keys** y crea una nueva clave.
3. Copia la clave (empieza por `re_`).

### 2. Añadir la clave en Netlify

1. Entra en [app.netlify.com](https://app.netlify.com) y abre tu sitio.
2. Ve a **Site settings** → **Environment variables**.
3. Pulsa **Add a variable** (o **Add from .env**).
4. **Key:** `RESEND_API_KEY`
5. **Value:** pega la clave que copiaste de Resend.
6. Guarda.

### 3. Hacer un nuevo deploy

1. En Netlify, ve a **Deploys**.
2. Pulsa **Trigger deploy** → **Clear cache and deploy site**.
3. Espera a que termine el deploy.

### 4. Probar

1. Abre la página de tu sitio.
2. Ve a la sección **Contact**.
3. Rellena nombre, email y mensaje y envía.
4. Deberías recibir el mensaje en **shawn@leashtolegacy.org**.

## Nota sobre el remitente

Por defecto el email se envía desde `onboarding@resend.dev` (dominio de prueba de Resend). Para usar tu propio dominio (por ejemplo `@leashtolegacy.org`) debes verificar el dominio en Resend y luego cambiar en `netlify/functions/send-contact-email.js` la línea `from` a tu email verificado.

## Si algo falla

- Revisa en Netlify → **Functions** → **send-contact-email** → **Logs** para ver el error.
- Comprueba que la variable `RESEND_API_KEY` esté bien escrita y que hayas hecho un deploy después de añadirla.
