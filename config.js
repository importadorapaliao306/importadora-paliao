/* ====================================================================
   config.js · Conexión con Firebase
   Pega aquí los datos de tu app web de Firebase
   (Firebase → ⚙ Configuración del proyecto → "Tus apps" → Configuración del SDK → "Config").
   Estos datos son públicos por diseño: la seguridad la dan las reglas de
   firestore.rules (solo tu cuenta puede modificar la tienda).

   Si algún día los dejas vacíos, la tienda y el panel vuelven al MODO DEMOSTRACIÓN
   (los cambios se guardan solo en el navegador donde los hagas).
   ==================================================================== */
window.PALIO_CONFIG = {
  firebase: {
    apiKey: 'AIzaSyDpB0hWgTrlEL6HpOEBcxEYFZ46aQ1yjp4',
    authDomain: 'importadora-paliao.firebaseapp.com',
    projectId: 'importadora-paliao',
    appId: '1:47037005630:web:3ef6303d6a23b70a05f66f'
  },
  // Si entras al panel con un "usuario" (sin @), internamente se usa usuario@<este dominio>.
  // Puedes dejarlo así; también puedes entrar con un correo real.
  dominioUsuarios: 'palio.app'
};
