import { useState, useEffect, useRef } from 'react'
import { Play, Pause, SkipBack, SkipForward, Volume2, Search, Music, ListMusic } from 'lucide-react'
import './App.css'

// Buscador usando YouTube Data API a través de proxy CORS
const searchYouTube = async (query) => {
  // Usamos un proxy CORS público para evitar restricciones del navegador
  const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
  const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(youtubeSearchUrl)}`

  try {
    const res = await fetch(proxyUrl, {
      headers: {
        'Accept': 'text/html,application/json'
      }
    })

    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const html = await res.text()

    // Extraer datos del HTML de YouTube usando regex
    // YouTube guarda los datos en variables de window["ytInitialData"]
    const match = html.match(/var ytInitialData\s*=\s*(\{.+?\});/)
    if (!match) throw new Error('No se pudo parsear respuesta')

    const data = JSON.parse(match[1])

    // Navegar por la estructura de YouTube
    const contents = data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents
    const resultsSection = contents?.[0]?.itemSectionRenderer?.contents

    if (!resultsSection) throw new Error('Sin resultados')

    // Filtrar solo videos (no canales, playlists, etc)
    const videos = resultsSection
      .filter(item => item.videoRenderer)
      .map(item => {
        const v = item.videoRenderer
        return {
          id: v.videoId,
          title: v.title?.runs?.[0]?.text || 'Sin título',
          channel: v.ownerText?.runs?.[0]?.text || 'Artista desconocido',
          thumbnail: v.thumbnail?.thumbnails?.[0]?.url || `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`
        }
      })

    if (videos.length === 0) throw new Error('No se encontraron videos')

    return videos
  } catch (err) {
    console.error('Error en búsqueda:', err)
    throw err
  }
}

// Canciones por defecto para demo
const DEFAULT_PLAYLIST = [
  { id: 'jfKfPfyJRdk', title: 'lofi hip hop radio - beats to relax/study to', artist: 'Lofi Girl', thumbnail: 'https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault.jpg' },
  { id: '5qap5aO4i9A', title: 'lofi hip hop radio - beats to sleep/chill to', artist: 'Lofi Girl', thumbnail: 'https://i.ytimg.com/vi/5qap5aO4i9A/hqdefault.jpg' },
  { id: '4xDzrJKX8Kc', title: 'Synthwave Radio - Beats to Game/Code/Relax to', artist: 'SpaceRider', thumbnail: 'https://i.ytimg.com/vi/4xDzrJKX8Kc/hqdefault.jpg' },
  { id: '3jWRrafhO7M', title: 'Chill Music for Work and Study', artist: 'Chillout', thumbnail: 'https://i.ytimg.com/vi/3jWRrafhO7M/hqdefault.jpg' },
]

function App() {
  const [currentTrack, setCurrentTrack] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.5)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState(null)
  const [playlist, setPlaylist] = useState(DEFAULT_PLAYLIST)
  const [showPlaylist, setShowPlaylist] = useState(true)
  const playerRef = useRef(null)
  const searchInputRef = useRef(null)

  // Foco en el input al hacer clic en el buscador
  const focusSearch = () => {
    searchInputRef.current?.focus()
  }

  const handlePlay = (track) => {
    setCurrentTrack(track)
    setIsPlaying(true)
  }

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  const skipNext = () => {
    if (!currentTrack) return
    const currentIndex = playlist.findIndex(t => t.id === currentTrack.id)
    const nextIndex = (currentIndex + 1) % playlist.length
    handlePlay(playlist[nextIndex])
  }

  const skipPrevious = () => {
    if (!currentTrack) return
    const currentIndex = playlist.findIndex(t => t.id === currentTrack.id)
    const prevIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1
    handlePlay(playlist[prevIndex])
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setSearchError(null)
    try {
      const results = await searchYouTube(searchQuery)
      const tracks = results.slice(0, 15).map(item => ({
        id: item.id,
        title: item.title,
        artist: item.channel || 'Artista desconocido',
        thumbnail: item.thumbnail,
      }))
      setSearchResults(tracks)
    } catch (err) {
      console.error('Error en búsqueda:', err)
      setSearchError('No se encontraron resultados. Intentá de nuevo.')
      setSearchResults([])
    }
    setIsSearching(false)
  }

  const addToPlaylist = (track) => {
    if (!playlist.find(t => t.id === track.id)) {
      setPlaylist([...playlist, track])
    }
    handlePlay(track)
  }

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-content">
          <Music size={32} className="logo-icon" />
          <span>YT Music Player</span>
        </div>
      </header>

      <main className="main-content">
        {/* Sidebar / Playlist */}
        {showPlaylist && (
          <aside className="sidebar">
            <div className="sidebar-header">
              <ListMusic size={20} />
              <h3>Tu Playlist</h3>
            </div>
            <div className="playlist">
              {playlist.map((track, index) => (
                <div
                  key={track.id}
                  className={`playlist-item ${currentTrack?.id === track.id ? 'active' : ''}`}
                  onClick={() => handlePlay(track)}
                >
                  <img src={track.thumbnail} alt={track.title} />
                  <div className="track-info">
                    <p className="track-name">{track.title}</p>
                    <p className="artist-name">{track.artist}</p>
                  </div>
                  {currentTrack?.id === track.id && isPlaying && (
                    <div className="equalizer">
                      <span></span><span></span><span></span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </aside>
        )}

        {/* Contenido principal */}
        <div className="content">
          {/* Buscador */}
          <form className="search-form" onSubmit={handleSearch}>
            <div className="search-input-wrapper" onClick={focusSearch}>
              <Search size={20} />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Buscar canciones, artistas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <button type="submit" disabled={isSearching || !searchQuery.trim()}>
              {isSearching ? 'Buscando...' : 'Buscar'}
            </button>
          </form>

          {/* Resultados de búsqueda */}
          {searchResults.length > 0 && (
            <div className="search-results">
              <h3>Resultados</h3>
              <div className="results-grid">
                {searchResults.map((track) => (
                  <div key={track.id} className="result-card" onClick={() => addToPlaylist(track)}>
                    <img src={track.thumbnail} alt={track.title} />
                    <div className="card-info">
                      <p className="track-name">{track.title}</p>
                      <p className="artist-name">{track.artist}</p>
                    </div>
                    <div className="play-overlay">
                      <Play size={32} fill="white" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mensaje de error */}
          {searchError && (
            <div className="search-error">
              <p>{searchError}</p>
              <button onClick={() => setSearchError(null)}>×</button>
            </div>
          )}

          {/* Estado de búsqueda vacía */}
          {isSearching && (
            <div className="search-loading">
              <Music size={48} className="spin" />
              <p>Buscando canciones...</p>
            </div>
          )}

          {/* Reproductor */}
          {currentTrack && (
            <div className="player-wrapper">
              <div className="video-container">
                <iframe
                  ref={playerRef}
                  src={`https://www.youtube.com/embed/${currentTrack.id}?autoplay=${isPlaying ? 1 : 0}&controls=0&modestbranding=1&rel=0`}
                  title={currentTrack.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="youtube-player"
                />
              </div>
            </div>
          )}

          {!currentTrack && (
            <div className="welcome">
              <Music size={64} className="welcome-icon" />
              <h2>Bienvenido a YT Music Player</h2>
              <p>Busca tu canción favorita o selecciona una de la playlist</p>
            </div>
          )}
        </div>
      </main>

      {/* Controles fijos abajo */}
      <footer className="player-bar">
        <div className="now-playing">
          {currentTrack ? (
            <>
              <img src={currentTrack.thumbnail} alt={currentTrack.title} />
              <div className="track-info">
                <p className="track-name">{currentTrack.title}</p>
                <p className="artist-name">{currentTrack.artist}</p>
              </div>
            </>
          ) : (
            <p className="no-track">Selecciona una canción</p>
          )}
        </div>

        <div className="player-controls">
          <button onClick={skipPrevious} className="control-btn" disabled={!currentTrack}>
            <SkipBack size={24} />
          </button>
          <button onClick={togglePlay} className="control-btn play-btn" disabled={!currentTrack}>
            {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" />}
          </button>
          <button onClick={skipNext} className="control-btn" disabled={!currentTrack}>
            <SkipForward size={24} />
          </button>
        </div>

        <div className="volume-controls">
          <Volume2 size={20} />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
          />
        </div>
      </footer>
    </div>
  )
}

export default App
