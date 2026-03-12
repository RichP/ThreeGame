import React from 'react'
import styles from './ShopHeader.module.css'

interface ShopHeaderProps {
  onCartClick: () => void
  cartItemCount: number
}

export const ShopHeader: React.FC<ShopHeaderProps> = ({
  onCartClick,
  cartItemCount
}) => {
  return (
    <div className={styles.shopHeader}>
      <div className={styles.headerContent}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>ThreeGame Shop</h1>
          <p className={styles.subtitle}>Enhance your tactical experience</p>
        </div>
        
        <div className={styles.actions}>
          <div className={styles.balance}>
            <span className={styles.balanceLabel}>Balance</span>
            <span className={styles.balanceValue}>1,250</span>
            <span className={styles.currencyIcon}>💎</span>
          </div>
          
          <button 
            className={styles.cartButton}
            onClick={onCartClick}
          >
            <span className={styles.cartIcon}>🛒</span>
            <span className={styles.cartText}>Cart</span>
            {cartItemCount > 0 && (
              <span className={styles.cartBadge}>{cartItemCount}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ShopHeader