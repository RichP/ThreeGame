import React, { useState, useEffect } from 'react'
import MainLayout from '../components/MainLayout'
import SceneCanvas from '../components/SceneCanvas'
import { GameStatus } from '../components/UI/GameStatus'
import { Controls } from '../components/UI/Controls'
import { UnitInfo } from '../components/UI/UnitInfo'
import { ActionLog } from '../components/UI/ActionLog'
import { SessionHud } from '../components/UI/SessionHud'
import { DebugAnimations } from '../components/DebugAnimations'
import { AnimationSettings, useAnimationSettings } from '../components/AnimationSettings'
import { type MapPresetId } from '../game/gamestate'
import styles from './match.module.css'

export default function MatchPage() {
  const [isDebugMode, setIsDebugMode] = useState(false)

  return (
    <MainLayout>
      <div className={styles.matchInterface}>
        {/* Game Canvas */}
        <SceneCanvas 
          canvasProps={{
            style: {
              width: '100%',
              height: '100%',
              position: 'relative',
              zIndex: 1
            }
          }}
        />

        {/* Debug Toggle */}
        <div className={styles.debugToggle}>
          Debug Mode: 
          <button
            className={`${styles.debugToggleButton} ${isDebugMode ? styles.debugToggleButtonActive : styles.debugToggleButtonInactive}`}
            onClick={() => setIsDebugMode(!isDebugMode)}
          >
            {isDebugMode ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>
    </MainLayout>
  )
}
