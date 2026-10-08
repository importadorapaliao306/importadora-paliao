/* ====================================================================
   config.js · Conexión con Firebase
   Pega aquí los datos de tu app web de Firebase
   (Firebase → ⚙ Configuración del proyecto → "Tus apps" → Configuración del SDK → "Config").
   Estos datos son públicos por diseño: la seguridad la dan las reglas de
   firestore.rules (solo tu cuenta puede modificar la tienda).

   Mientras estén vacíos, la tienda y el panel funcionan en MODO DEMOSTRACIÓN
   (los cambios se guardan solo en el navegador donde los hagas).
   ==================================================================== */
window.PALIO_CONFIG = {
  firebase: {
    apiKey: '',
    authDomain: '',
    projectId: '',
    appId: ''
  },
  // Si entras al panel con un "usuario" (sin @), internamente se usa usuario@<este dominio>.
  // Puedes dejarlo así; también puedes entrar con un correo real.
  dominioUsuarios: 'palio.app'
};
