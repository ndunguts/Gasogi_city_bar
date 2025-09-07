import { useCart } from '../context/CartContext'
import styles from './Home.module.css' // cyangwa Cart.module.css niba warayitandukanije

export default function Cart() {
  const { cartItems, removeFromCart, clearCart, updateQuantity } = useCart()

  const total = cartItems.reduce(
    (sum, item) => sum + parseFloat(item.price) * (item.quantity || 1),
    0
  )

  return (
    <div className={styles.cartContainer}>
      <h1 className={styles.cartTitle}>🛒 Igikapu cyawe</h1>

      {cartItems.length === 0 ? (
        <p className={styles.cartEmpty}>Nta kintu kirimo mu gikapu.</p>
      ) : (
        <>
          <ul className={styles.cartList}>
            {cartItems.map(item => (
              <li key={item.id} className={styles.cartItem}>
                <div className={styles.itemDetails}>
                  <img
                    src={
                      item.image
                        ? item.image
                        : `https://source.unsplash.com/64x64/?${item.category},food`
                    }
                    alt={item.name}
                    className={styles.cartItemImage}
                  />
                  <div>
                    <h2 className={styles.itemName}>{item.name}</h2>
                    <p className={styles.itemPrice}>Frw {item.price}</p>

                    {/* Quantity Input */}
                    <div className="mt-1">
                      <label className="text-sm mr-2">Igano:</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity || 1}
                        onChange={(e) =>
                          updateQuantity(item.id, parseInt(e.target.value))
                        }
                        className="border px-2 py-1 w-16 rounded"
                      />
                    </div>

                    {/* Subtotal */}
                    <p className="text-sm text-gray-500 mt-1">
                      🧾 Igiteranyo: <strong>{parseFloat(item.price) * (item.quantity || 1)} RWF</strong>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className={styles.removeBtn}
                >
                  Siba
                </button>
              </li>
            ))}
          </ul>

          <div className={styles.cartTotal}>
            <p className={styles.totalText}>💵 Igiciro cyose: <strong>{total} RWF</strong></p>
            <div className={styles.actionButtons}>
              <button onClick={clearCart} className={styles.clearBtn}>Siba byose</button>
              
            </div>
          </div>
        </>
      )}
    </div>
  )
}
