import React from 'react'
import SceneCanvas from '../game/SceneCanvas'
import styles from './HeroPreview.module.css'

interface HeroPreviewProps {
  height?: number
}

export const HeroPreview: React.FC<HeroPreviewProps> = ({ height = 400 }) => {
  const containerStyle = height !== 400 
    ? { '--custom-height': `${height}px` } as React.CSSProperties
    : undefined

  return (
    <div className={`${styles.heroPreview} ${height !== 400 ? styles.heroPreviewCustomHeight : ''}`} style={containerStyle}>
      <SceneCanvas 
        mode="preview"
        canvasProps={{
          style: {
            width: '100%',
            height: '100%',
            cursor: 'default', // Disable cursor changes for preview mode
            pointerEvents: 'none' // Disable all pointer events on canvas
          },
          events: false // Disable Three.js event system entirely
        }}
      />
      
      {/* Overlay content for hero section */}
      <div className={styles.overlay}>
        <h1 className={styles.title}>
          ThreeGame
        </h1>
        <p className={styles.subtitle}>
          Strategic 3D Turn-Based Combat
        </p>
      </div>
    </div>
  )
}

export default HeroPreview
