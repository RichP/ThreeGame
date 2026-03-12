import React from 'react'
import styles from './ShopCategories.module.css'

interface ShopCategoriesProps {
  activeCategory: 'all' | 'cosmetics' | 'units' | 'maps' | 'bundles'
  onCategoryChange: (category: 'all' | 'cosmetics' | 'units' | 'maps' | 'bundles') => void
}

export const ShopCategories: React.FC<ShopCategoriesProps> = ({
  activeCategory,
  onCategoryChange
}) => {
  const categories = [
    { id: 'all', name: 'All Items', icon: '🛍️' },
    { id: 'cosmetics', name: 'Cosmetics', icon: '🎭' },
    { id: 'units', name: 'Units', icon: '🎖️' },
    { id: 'maps', name: 'Maps', icon: '🗺️' },
    { id: 'bundles', name: 'Bundles', icon: '🎁' }
  ]

  return (
    <div className={styles.shopCategories}>
      <h3 className={styles.sectionTitle}>Categories</h3>
      <div className={styles.categoryList}>
        {categories.map((category) => (
          <button
            key={category.id}
            className={`${styles.categoryButton} ${
              activeCategory === category.id ? styles.categoryButtonActive : ''
            }`}
            onClick={() => onCategoryChange(category.id as 'all' | 'cosmetics' | 'units' | 'maps' | 'bundles')}
          >
            <span className={styles.categoryIcon}>{category.icon}</span>
            <span className={styles.categoryName}>{category.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default ShopCategories