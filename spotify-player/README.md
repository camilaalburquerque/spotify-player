# YT Music Player

Un clon de Spotify que usa YouTube como fuente de música. Totalmente gratis, sin necesidad de API keys ni Spotify Premium.

## Características

- ✅ Búsqueda de canciones en YouTube
- ✅ Reproductor con controles (play/pause, skip, volumen)
- ✅ Playlist personalizable
- ✅ UI moderna estilo Spotify/Apple Music
- ✅ Sin necesidad de API key
- ✅ Totalmente gratis

## Instalación

```bash
npm install
npm run dev
```

La app se abrirá en `http://localhost:5173`

## Cómo usar

1. **Busca una canción** usando la barra de búsqueda
2. **Haz clic en un resultado** para agregarlo a tu playlist y reproducirlo
3. **Usa los controles** en la parte inferior para controlar la reproducción
4. **Salta entre canciones** con los botones de skip

## Playlist por defecto

La app incluye una playlist con música lofi/chill para empezar:
- Lofi Girl - beats to relax/study to
- Lofi Girl - beats to sleep/chill to
- Synthwave Radio
- Chill Music for Work and Study

## Tech Stack

- React 19
- Vite
- Lucide React (iconos)
- YouTube embed (iframe)
- APIs públicas de búsqueda de YouTube

## Notas

- La música se reproduce directamente desde YouTube
- No se requiere autenticación
- Funciona en cualquier dispositivo con soporte para YouTube

## Próximas mejoras

- [ ] Guardar playlists en localStorage
- [ ] Modo oscuro/claro
- [ ] Historial de reproducción
- [ ] Compartir playlist
- [ ] Integrar letras de canciones
