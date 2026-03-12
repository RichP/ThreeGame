import React from 'react'
import styles from './ShopItem.module.css'

interface ShopItemProps {
  item: {
    id: string
    name: string
    description: string
    price: number
    category: string
    image: string
    rarity: 'common' | 'rare' | 'epic' | 'legendary'
    isLimited: boolean
    isOwned: boolean
  }
}

export const ShopItem: React.FC<ShopItemProps> = ({ item }) => {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return '#a0a0a0'
      case 'rare': return '#3b82f6'
      case 'epic': return '#8b5cf6'
      case 'legendary': return '#f59e0b'
      default: return '#ffffff'
    }
  }

  const getRarityBg = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'rgba(160, 160, 160, 0.2)'
      case 'rare': return 'rgba(59, 130, 246, 0.2)'
      case 'epic': return 'rgba(139, 92, 246, 0.2)'
      case 'legendary': return 'rgba(245, 158, 11, 0.2)'
      default: return 'rgba(255, 255, 255, 0.1)'
    }
  }

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'rgba(160, 160, 160, 0.4)'
      case 'rare': return 'rgba(59, 130, 246, 0.6)'
      case 'epic': return 'rgba(139, 92, 246, 0.6)'
      case 'legendary': return 'rgba(245, 158, 11, 0.8)'
      default: return 'rgba(255, 255, 255, 0.3)'
    }
  }

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'common': return '⚪'
      case 'rare': return '🔵'
      case 'epic': return '🟣'
      case 'legendary': return '🟡'
      default: return '⚪'
    }
  }

  return (
    <div 
      className={`${styles.shopItem} ${item.isOwned ? styles.ownedItem : ''}`}
      style={{
        borderColor: getRarityBorder(item.rarity),
        background: getRarityBg(item.rarity)
      }}
    >
      {/* Item Image */}
      <div className={styles.itemImage}>
        <img src={item.image} alt={item.name} />
        {item.isLimited && (
          <span className={styles.limitedTag}>Limited</span>
        )}
        {item.isOwned && (
          <span className={styles.ownedTag}>Owned</span>
        )}
      </div>

      {/* Item Info */}
      <div className={styles.itemInfo}>
        <div className={styles.itemHeader}>
          <h4 className={styles.itemName}>{item.name}</h4>
          <div className={styles.itemMeta}>
            <span 
              className={styles.rarityBadge}
              style={{ color: getRarityColor(item.rarity) }}
            >
              {getRarityIcon(item.rarity)} {item.rarity.toUpperCase()}
            </span>
            <span className={styles.categoryBadge}>{item.category}</span>
          </div>
        </div>
        
        <p className={styles.itemDescription}>{item.description}</p>
      </div>

      {/* Item Actions */}
      <div className={styles.itemActions}>
        <div className={styles.priceContainer}>
          <span className={styles.currencyIcon}>💎</span>
          <span className={styles.priceValue}>{item.price}</span>
        </div>
        
        <button 
          className={`${styles.actionButton} ${
            item.isOwned ? styles.ownedButton : styles.buyButton
          }`}
          disabled={item.isOwned}
        >
          {item.isOwned ? 'Owned' : 'Buy Now'}
        </button>
      </div>
    </div>
  )
}

export default ShopItem