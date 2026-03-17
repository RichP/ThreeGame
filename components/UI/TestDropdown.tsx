import React, { useState } from 'react'
import Link from 'next/link'
import styles from './GameDropdown.module.css'

const TestDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div>
      <button onClick={() => setIsOpen(!isOpen)}>
        Test Dropdown
      </button>
      
      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownContent}>
            <div className={styles.dropdownSection}>
              <span className={styles.dropdownSectionTitle}>Test Navigation</span>
              <Link href="/" className={styles.dropdownLink}>
                Test Home
              </Link>
              <Link href="/lobby" className={styles.dropdownLink}>
                Test Lobby
              </Link>
            </div>
            
            <div className={styles.dropdownDivider} />
            
            <div className={styles.dropdownSection}>
              <span className={styles.dropdownSectionTitle}>Test Actions</span>
              <button className={styles.dropdownItem}>
                Test Button
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TestDropdown