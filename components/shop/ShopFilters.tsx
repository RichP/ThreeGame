import React from 'react'
import styles from './ShopFilters.module.css'

interface ShopFiltersProps {
  sortBy: 'name' | 'price' | 'popularity'
  onSortChange: (sortBy: 'name' | 'price' | 'popularity') => void
  priceRange: [number, number]
  onPriceRangeChange: (range: [number, number]) => void
}

export const ShopFilters: React.FC<ShopFiltersProps> = ({
  sortBy,
  onSortChange,
  priceRange,
  onPriceRangeChange
}) => {
  const sortOptions = [
    { value: 'popularity', label: 'Most Popular' },
    { value: 'name', label: 'Name (A-Z)' },
    { value: 'price', label: 'Price (Low to High)' }
  ]

  return (
    <div className={styles.shopFilters}>
      <h3 className={styles.sectionTitle}>Filters</h3>
      
      {/* Sort By */}
      <div className={styles.filterGroup}>
        <label className={styles.filterLabel}>Sort By</label>
        <select 
          className={styles.sortSelect}
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as 'name' | 'price' | 'popularity')}
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div className={styles.filterGroup}>
        <label className={styles.filterLabel}>Price Range</label>
        <div className={styles.priceRange}>
          <div className={styles.priceInput}>
            <span className={styles.currencySymbol}>💎</span>
            <input
              type="number"
              value={priceRange[0]}
              onChange={(e) => onPriceRangeChange([parseInt(e.target.value), priceRange[1]])}
              className={styles.priceField}
              min="0"
              max="500"
            />
          </div>
          <span className={styles.priceSeparator}>to</span>
          <div className={styles.priceInput}>
            <span className={styles.currencySymbol}>💎</span>
            <input
              type="number"
              value={priceRange[1]}
              onChange={(e) => onPriceRangeChange([priceRange[0], parseInt(e.target.value)])}
              className={styles.priceField}
              min="0"
              max="500"
            />
          </div>
        </div>
      </div>

      {/* Quick Filters */}
      <div className={styles.filterGroup}>
        <label className={styles.filterLabel}>Quick Filters</label>
        <div className={styles.quickFilters}>
          <button className={styles.quickFilterButton}>Free Items</button>
          <button className={styles.quickFilterButton}>New</button>
          <button className={styles.quickFilterButton}>On Sale</button>
        </div>
      </div>
    </div>
  )
}

export default ShopFilters