import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { matchApi } from '../../services/api'
import styles from './CustomMatch.module.css'

interface CustomMatchProps {
  onCreateMatch?: (settings: CustomMatchSettings) => void
}

interface CustomMatchSettings {
  map: string
  timeControl: string
  maxTurns: number
  fogOfWar: boolean
  allowSpectators: boolean
  password?: string
}

export const CustomMatch: React.FC<CustomMatchProps> = ({ onCreateMatch }) => {
  const router = useRouter()
  const [settings, setSettings] = useState<CustomMatchSettings>({
    map: 'crossroads',
    timeControl: 'daily',
    maxTurns: 50,
    fogOfWar: false,
    allowSpectators: true
  })
  const [isPrivate, setIsPrivate] = useState(false)
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleCreateMatch = async () => {
    if (isLoading) return
    
    try {
      setIsLoading(true)
      
      const gameMode = isPrivate ? 'private' : 'custom'
      console.log('Creating match with game mode:', gameMode)
      const response = await matchApi.createMatch(gameMode, settings, isPrivate ? password : undefined)
      console.log('Create match response:', response)
      
      if (response.success && response.data) {
        console.log('Response data:', response.data)
        console.log('Response data type:', typeof response.data)
        console.log('Response data keys:', Object.keys(response.data))
        
        // The response structure is: { success: true, data: { match: {...}, participants: [...] } }
        // So we need to access response.data.data.match
        const responseData = response.data as any
        console.log('Response data.data:', responseData.data)
        console.log('Response data.data.match:', responseData.data?.match)
        
        // Try different ways to access the match ID
        const matchId = responseData.data?.match?.id || responseData.match?.id || responseData.matchId
        console.log('Extracted match ID:', matchId)
        
        if (matchId) {
          console.log('Redirecting to match:', matchId)
          // Redirect to match page
          router.push(`/match/${matchId}`)
          onCreateMatch?.(settings)
        } else {
          console.error('Could not extract match ID from response:', response.data)
          throw new Error('Match ID not found in response')
        }
      } else {
        throw new Error(response.error || 'Failed to create match')
      }
    } catch (error) {
      console.error('Match creation error:', error)
      // You could add a toast notification here
    } finally {
      setIsLoading(false)
    }
  }

  const updateSetting = (key: keyof CustomMatchSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className={styles.customMatch}>
      <div className={styles.header}>
        <h2 className={styles.title}>Create Custom Match</h2>
        <p className={styles.subtitle}>Set up a private match with your own rules</p>
      </div>

      <div className={styles.settings}>
        {/* Map Selection */}
        <div className={styles.settingGroup}>
          <label className={styles.label}>Map Selection</label>
          <div className={styles.mapGrid}>
            <div className={`${styles.mapOption} ${settings.map === 'crossroads' ? styles.mapOptionActive : ''}`}
                 onClick={() => updateSetting('map', 'crossroads')}>
              <div className={styles.mapPreview}>
                <div className={styles.mapIcon}>🛣️</div>
              </div>
              <div className={styles.mapInfo}>
                <span className={styles.mapName}>Crossroads</span>
                <span className={styles.mapDesc}>Balanced map with multiple paths</span>
              </div>
            </div>
            
            <div className={`${styles.mapOption} ${settings.map === 'forest' ? styles.mapOptionActive : ''}`}
                 onClick={() => updateSetting('map', 'forest')}>
              <div className={styles.mapPreview}>
                <div className={styles.mapIcon}>🌲</div>
              </div>
              <div className={styles.mapInfo}>
                <span className={styles.mapName}>Forest</span>
                <span className={styles.mapDesc}>Cover-heavy map for tactical play</span>
              </div>
            </div>
            
            <div className={`${styles.mapOption} ${settings.map === 'mountain' ? styles.mapOptionActive : ''}`}
                 onClick={() => updateSetting('map', 'mountain')}>
              <div className={styles.mapPreview}>
                <div className={styles.mapIcon}>⛰️</div>
              </div>
              <div className={styles.mapInfo}>
                <span className={styles.mapName}>Mountain</span>
                <span className={styles.mapDesc}>High ground advantage map</span>
              </div>
            </div>
            
            <div className={`${styles.mapOption} ${settings.map === 'desert' ? styles.mapOptionActive : ''}`}
                 onClick={() => updateSetting('map', 'desert')}>
              <div className={styles.mapPreview}>
                <div className={styles.mapIcon}>🏜️</div>
              </div>
              <div className={styles.mapInfo}>
                <span className={styles.mapName}>Desert</span>
                <span className={styles.mapDesc}>Open map with limited cover</span>
              </div>
            </div>
          </div>
        </div>

        {/* Game Settings */}
        <div className={styles.settingGroup}>
          <label className={styles.label}>Game Settings</label>
          <div className={styles.settingsGrid}>
            <div className={styles.settingItem}>
              <label className={styles.settingLabel}>Time Control</label>
              <select 
                className={styles.settingSelect}
                value={settings.timeControl}
                onChange={(e) => updateSetting('timeControl', e.target.value)}
              >
                <option value="daily">Daily (24h per turn)</option>
                <option value="3days">3 Days (72h per turn)</option>
                <option value="realtime">Real-time (60s per turn)</option>
                <option value="hourly">Hourly (1h per turn)</option>
              </select>
            </div>

            <div className={styles.settingItem}>
              <label className={styles.settingLabel}>Max Turns</label>
              <select 
                className={styles.settingSelect}
                value={settings.maxTurns}
                onChange={(e) => updateSetting('maxTurns', parseInt(e.target.value))}
              >
                <option value={30}>30 turns</option>
                <option value={50}>50 turns</option>
                <option value={75}>75 turns</option>
                <option value={100}>100 turns</option>
                <option value={0}>Unlimited</option>
              </select>
            </div>

            <div className={styles.settingItem}>
              <label className={styles.settingLabel}>Fog of War</label>
              <div className={styles.toggleSwitch}>
                <input
                  type="checkbox"
                  id="fogOfWar"
                  checked={settings.fogOfWar}
                  onChange={(e) => updateSetting('fogOfWar', e.target.checked)}
                />
                <label htmlFor="fogOfWar" className={styles.toggleLabel}>
                  <span className={styles.toggleSlider}></span>
                </label>
              </div>
            </div>

            <div className={styles.settingItem}>
              <label className={styles.settingLabel}>Allow Spectators</label>
              <div className={styles.toggleSwitch}>
                <input
                  type="checkbox"
                  id="spectators"
                  checked={settings.allowSpectators}
                  onChange={(e) => updateSetting('allowSpectators', e.target.checked)}
                />
                <label htmlFor="spectators" className={styles.toggleLabel}>
                  <span className={styles.toggleSlider}></span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className={styles.settingGroup}>
          <label className={styles.label}>Privacy Settings</label>
          <div className={styles.privacyOptions}>
            <div className={`${styles.privacyOption} ${!isPrivate ? styles.privacyOptionActive : ''}`}
                 onClick={() => setIsPrivate(false)}>
              <div className={styles.privacyIcon}>🌍</div>
              <div className={styles.privacyInfo}>
                <span className={styles.privacyTitle}>Public Match</span>
                <span className={styles.privacyDesc}>Anyone can join</span>
              </div>
            </div>
            
            <div className={`${styles.privacyOption} ${isPrivate ? styles.privacyOptionActive : ''}`}
                 onClick={() => setIsPrivate(true)}>
              <div className={styles.privacyIcon}>🔒</div>
              <div className={styles.privacyInfo}>
                <span className={styles.privacyTitle}>Private Match</span>
                <span className={styles.privacyDesc}>Invite only</span>
              </div>
            </div>
          </div>

          {isPrivate && (
            <div className={styles.passwordField}>
              <label className={styles.passwordLabel}>Match Password</label>
              <input
                type="password"
                className={styles.passwordInput}
                placeholder="Enter password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Create Match Button */}
      <div className={styles.createSection}>
        <button className={styles.createButton} onClick={handleCreateMatch}>
          <span className={styles.createIcon}>➕</span>
          <span className={styles.createText}>Create Match</span>
        </button>
        <p className={styles.createDesc}>
          {isPrivate ? "Private match will be created with password protection" : "Public match will be listed in the lobby"}
        </p>
      </div>

      {/* Match Summary */}
      <div className={styles.summary}>
        <h3 className={styles.summaryTitle}>Match Summary</h3>
        <div className={styles.summaryGrid}>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Map:</span>
            <span className={styles.summaryValue}>{settings.map}</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Time Control:</span>
            <span className={styles.summaryValue}>{settings.timeControl}</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Max Turns:</span>
            <span className={styles.summaryValue}>{settings.maxTurns === 0 ? 'Unlimited' : settings.maxTurns}</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Fog of War:</span>
            <span className={styles.summaryValue}>{settings.fogOfWar ? 'Enabled' : 'Disabled'}</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Spectators:</span>
            <span className={styles.summaryValue}>{settings.allowSpectators ? 'Allowed' : 'Disabled'}</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Privacy:</span>
            <span className={styles.summaryValue}>{isPrivate ? 'Private' : 'Public'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomMatch