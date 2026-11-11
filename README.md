# Portal Perú — Login realista

Pantalla de inicio de sesión moderna con fondos fotográficos del Perú (Machu Picchu, Costa Verde de Lima y Plaza de Armas de Cusco), construida con **React, TypeScript, Vite y Tailwind CSS**.

## Características

- **Fondos del Perú a pantalla completa** con cambio de paisaje en vivo y reloj en zona horaria `America/Lima`.
- **Acceso con Correo electrónico o DNI / Documento (CE)** con validación de formato peruano.
- **Controles realistas**: mostrar/ocultar contraseña, detección de `Bloq Mayús`, recordar usuario y botón de autocompletado de prueba.
- **Flujos completos**: registro de cuenta con medidor de seguridad, recuperación de contraseña con código OTP de 6 dígitos, acceso simulado con Google/Microsoft y vista de sesión iniciada.

## Credenciales de prueba

- **Correo:** `mateo.quispe@peru.pe` (o **DNI:** `72485910`)
- **Contraseña:** `Peru2026!`

## Cómo ejecutarlo en tu computadora

```bash
npm install
npm run dev
```

Luego abre la URL local que muestra la terminal (por defecto `http://localhost:5173`).

Para generar la versión de producción:

```bash
npm run build
```
