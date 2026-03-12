import React from 'react'
import styles from './ShopGrid.module.css'
import { ShopItem } from './ShopItem'

interface ShopGridProps {
  category: 'all' | 'cosmetics' | 'units' | 'maps' | 'bundles'
  sortBy: 'name' | 'price' | 'popularity'
  priceRange: [number, number]
}

export const ShopGrid: React.FC<ShopGridProps> = ({
  category,
  sortBy,
  priceRange
}) => {
  // Mock shop items data
  const shopItems = [
    {
      id: '1',
      name: 'Shadow Ops Skin',
      description: 'Exclusive cosmetic skin for all units',
      price: 250,
      category: 'cosmetics',
      image: '/api/placeholder/200/200',
      rarity: 'epic',
      isLimited: false,
      isOwned: false
    },
    {
      id: '2',
      name: 'Sniper Elite Unit',
      description: 'High-precision long-range unit',
      price: 150,
      category: 'units',
      image: '/api/placeholder/200/200',
      rarity: 'rare',
      isLimited: false,
      isOwned: true
    },
    {
      id: '3',
      name: 'Cyber City Map',
      description: 'Futuristic urban battlefield',
      price: 300,
      category: 'maps',
      image: '/api/placeholder/200/200',
      rarity: 'epic',
      isLimited: true,
      isOwned: false
    },
    {
      id: '4',
      name: 'Tactical Bundle',
      description: 'Complete package with exclusive items',
      price: 500,
      category: 'bundles',
      image: '/api/placeholder/200/200',
      rarity: 'legendary',
      isLimited: true,
      isOwned: false
    },
    {
      id: '5',
      name: 'Glow Effect',
      description: 'Unit outline glow effect',
      price: 50,
      category: 'cosmetics',
      image: '/api/placeholder/200/200',
      rarity: 'common',
      isLimited: false,
      isOwned: false
    },
    {
      id: '6',
      name: 'Medic Support Unit',
      description: 'Healing and support specialist',
      price: 120,
      category: 'units',
      image: '/api/placeholder/200/200',
      rarity: 'rare',
      isLimited: false,
      isOwned: false
    },
    {
      id: '7',
      name: 'Forest Ambush Map',
      description: 'Dense forest tactical map',
      price: 200,
      category: 'maps',
      image: '/api/placeholder/200/200',
      rarity: 'rare',
      isLimited: false,
      isOwned: true
    },
    {
      id: '8',
      name: 'Starter Pack',
      description: 'Beginner-friendly item collection',
      price: 100,
      category: 'bundles',
      image: '/api/placeholder/200/200',
      rarity: 'common',
      isLimited: false,
      isOwned: false
    }
  ]

  // Filter items based on category and price range
  const filteredItems = shopItems.filter(item => {
    const matchesCategory = category === 'all' || item.category === category
    const matchesPrice = item.price >= priceRange[0] && item.price <= priceRange[1]
    return matchesCategory && matchesPrice
  })

  // Sort items
  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'price':
        return a.price - b.price
      case 'popularity':
        return b.price - a.price // Mock popularity based on price for now
      default:
        return 0
    }
  })

  return (
    <div className={styles.shopGrid}>
      <div className={styles.gridHeader}>
        <h3 className={styles.gridTitle}>
          {category === 'all' ? 'All Items' : category.charAt(0).toUpperCase() + category.slice(1)}
        </h3>
        <span className={styles.itemCount}>{sortedItems.length} items</span>
      </div>
      
      {sortedItems.length > 0 ? (
        <div className={styles.itemsGrid}>
          {sortedItems.map((item) => (
            <ShopItem key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>🛍️</span>
          <span className={styles.emptyText}>No items found</span>
          <span className={styles.emptySubtext}>Try adjusting your filters</span>
        </div>
      )}
    </div>
  )
}

export default ShopGrid