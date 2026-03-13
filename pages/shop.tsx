import React, { useState } from 'react'
import MainLayout from '../components/MainLayout'
import { ProtectedRoute } from '../components/auth/ProtectedRoute'
import styles from './shop.module.css'
import { ShopCategories } from '../components/shop/ShopCategories'
import { ShopFilters } from '../components/shop/ShopFilters'
import { ShopGrid } from '../components/shop/ShopGrid'
import { ShopCart } from '../components/shop/ShopCart'
import { ShopHeader } from '../components/shop/ShopHeader'

export default function ShopPage() {
  const [activeCategory, setActiveCategory] = useState<'all' | 'cosmetics' | 'units' | 'maps' | 'bundles'>('all')
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'popularity'>('popularity')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500])
  const [showCart, setShowCart] = useState(false)

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className={styles.shop}>
          {/* Shop Header */}
          <ShopHeader 
            onCartClick={() => setShowCart(!showCart)}
            cartItemCount={3}
          />

          {/* Main Shop Layout */}
          <div className={styles.shopLayout}>
            {/* Sidebar */}
            <div className={styles.sidebar}>
              <ShopCategories 
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
              />
              <ShopFilters 
                sortBy={sortBy}
                onSortChange={setSortBy}
                priceRange={priceRange}
                onPriceRangeChange={setPriceRange}
              />
            </div>

            {/* Main Content */}
            <div className={styles.mainContent}>
              <ShopGrid 
                category={activeCategory}
                sortBy={sortBy}
                priceRange={priceRange}
              />
            </div>

            {/* Floating Cart */}
            {showCart && (
              <div className={styles.cartSidebar}>
                <ShopCart onClose={() => setShowCart(false)} />
              </div>
            )}
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  )
}