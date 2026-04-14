/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: [
    "./App.tsx",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./presentation/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Colores de interfaz (Escala de grises profesional)
        principal: "#09090b",    // Casi negro (Textos/Botones primarios)
        secundario: "#71717a",   // Gris medio (Subtítulos/Iconos)
        superficie: "#ffffff",   // Blanco (Tarjetas/Fondo de inputs)
        fondo: "#fafafa",        // Gris ultra claro (Fondo de pantalla)
        borde: "#e4e4e7",        // Color para líneas divisorias

        // Color de acción principal
        primary: "#3D64F4",      // Azul (Botones de acción / Elementos interactivos)

        // Colores de estado (Semánticos normales)
        success: "#22c55e",      // Verde (Mesa libre / Pedido enviado)
        error: "#ef4444",        // Rojo (Mesa ocupada / Error login)
        info: "#3b82f6",         // Azul (Botones de acción / Login)
        warning: "#f59e0b",      // Naranja (Pendiente / Alerta)
      },
      fontFamily: {
        'titulo': ['OpenSans-Bold'], 
        'cuerpo': ['OpenSans-Regular'],
      },
    },
  },
  plugins: [],
}