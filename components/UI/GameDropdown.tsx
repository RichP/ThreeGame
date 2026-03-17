import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import styles from './GameDropdown.module.css'

interface GameDropdownProps {
  children: React.ReactNode
  isOpen: boolean
  onClose: () => void
}

const GameDropdown: React.FC<GameDropdownProps> = ({ children, isOpen, onClose }) => {
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Handle clicks outside the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('touchstart', handleClickOutside)
      document.body.style.overflow = 'hidden' // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className={styles.backdrop} onClick={onClose} />
      
      {/* Dropdown Menu */}
      <div ref={dropdownRef} className={styles.dropdown}>
        <div className={styles.dropdownHeader}>
          <h3 className={styles.dropdownTitle}>Game Menu</h3>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close menu">
            <span className={styles.closeIcon}>✕</span>
          </button>
        </div>
        
        <div className={styles.dropdownContent}>
          {children}
        </div>
      </div>
    </>
  )
}

export default GameDropdown