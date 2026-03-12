import React from 'react'
import styles from './ShopCart.module.css'

interface ShopCartProps {
  onClose: () => void
}

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
}

export const ShopCart: React.FC<ShopCartProps> = ({ onClose }) => {
  const cartItems: CartItem[] = [
    {
      id: '1',
      name: 'Shadow Ops Skin',
      price: 250,
      quantity: 1,
      image: '/api/placeholder/60/60'
    },
    {
      id: '2',
      name: 'Glow Effect',
      price: 50,
      quantity: 1,
      image: '/api/placeholder/60/60'
    },
    {
      id: '3',
      name: 'Starter Pack',
      price: 100,
      quantity: 1,
      image: '/api/placeholder/60/60'
    }
  ]

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const total = subtotal // No taxes or fees for now

  return (
    <div className={styles.shopCart}>
      <div className={styles.cartHeader}>
        <h3 className={styles.cartTitle}>Shopping Cart</h3>
        <button className={styles.closeButton} onClick={onClose}>
          ✕
        </button>
      </div>

      <div className={styles.cartContent}>
        {cartItems.length > 0 ? (
          <>
            <div className={styles.cartItems}>
              {cartItems.map((item) => (
                <div key={item.id} className={styles.cartItem}>
                  <img src={item.image} alt={item.name} className={styles.itemImage} />
                  <div className={styles.itemInfo}>
                    <h4 className={styles.itemName}>{item.name}</h4>
                    <div className={styles.itemPrice}>
                      <span className={styles.currencyIcon}>💎</span>
                      <span className={styles.priceValue}>{item.price}</span>
                    </div>
                  </div>
                  <div className={styles.itemActions}>
                    <span className={styles.quantity}>x{item.quantity}</span>
                    <button className={styles.removeButton}>Remove</button>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.cartSummary}>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Subtotal</span>
                <span className={styles.summaryValue}>
                  <span className={styles.currencyIcon}>💎</span>
                  <span>{subtotal}</span>
                </span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Total</span>
                <span className={styles.summaryValue}>
                  <span className={styles.currencyIcon}>💎</span>
                  <span>{total}</span>
                </span>
              </div>
            </div>

            <div className={styles.cartActions}>
              <button className={styles.checkoutButton}>
                Checkout
              </button>
              <button className={styles.continueShoppingButton} onClick={onClose}>
                Continue Shopping
              </button>
            </div>
          </>
        ) : (
          <div className={styles.emptyCart}>
            <span className={styles.emptyIcon}>🛒</span>
            <span className={styles.emptyText}>Your cart is empty</span>
            <span className={styles.emptySubtext}>Add some items to get started</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default ShopCart