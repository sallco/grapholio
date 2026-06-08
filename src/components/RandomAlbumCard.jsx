import { useState } from 'react'
import albumIds from '../spotify_albums.json'

function pickRandom(exclude) {
  if (albumIds.length === 0) return null
  if (albumIds.length === 1) return albumIds[0]
  let id
  do { id = albumIds[Math.floor(Math.random() * albumIds.length)] } while (id === exclude)
  return id
}

function ActionButton({ href, onClick, children }) {
  const Tag = onClick ? 'button' : 'a'
  return (
    <Tag
      {...(onClick
        ? { type: 'button', onClick }
        : { href, target: '_blank', rel: 'noopener noreferrer' })}
      className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded transition-all duration-200"
      style={{
        border: '1px solid rgba(148,163,184,0.25)',
        color: '#94a3b8',
        background: 'rgba(148,163,184,0.06)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(148,163,184,0.5)'
        e.currentTarget.style.color = '#e2e8f0'
        e.currentTarget.style.background = 'rgba(148,163,184,0.12)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(148,163,184,0.25)'
        e.currentTarget.style.color = '#94a3b8'
        e.currentTarget.style.background = 'rgba(148,163,184,0.06)'
      }}
    >
      {children}
    </Tag>
  )
}

export default function RandomAlbumCard({ color = '#60a5fa', profileUrl }) {
  const [albumId, setAlbumId] = useState(() => pickRandom(null))

  if (!albumId) return null

  return (
    <div>
      <p className="text-base tracking-[0.2em] uppercase text-slate-500 mb-3 font-medium">
        Te recomiendo un álbum
      </p>
      <div
        className="rounded-md overflow-hidden mb-3"
        style={{ border: `1px solid ${color}30`, background: 'rgba(0,0,0,0.3)' }}
      >
        <iframe
          key={albumId}
          src={`https://open.spotify.com/embed/album/${albumId}?theme=0`}
          width="100%"
          height="380"
          style={{ border: 0, display: 'block' }}
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          title="Álbum recomendado"
        />
      </div>
      <div className="flex gap-3 flex-wrap">
        <ActionButton onClick={() => setAlbumId((cur) => pickRandom(cur))}>
          🔀 Otro álbum
        </ActionButton>
        {profileUrl && <ActionButton href={profileUrl}>Ver mi perfil</ActionButton>}
        <ActionButton href={`https://open.spotify.com/album/${albumId}`}>
          Abrir álbum
          <span className="opacity-50 text-[10px]">↗</span>
        </ActionButton>
      </div>
    </div>
  )
}
