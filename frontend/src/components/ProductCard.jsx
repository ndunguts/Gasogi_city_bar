import { useCart } from '../context/CartContext'
import styles from './ProductCard.module.css'  // shyiramo path nyayo

export default function ProductCard({ product }) {
  const { addToCart } = useCart()

  return (
    <div className={styles.card}>
      <figure className={styles.figure}>
        <img
          src={product.image}
          alt={product.name}
          className={styles.image}
        />
      </figure>
      <div className={styles.content}>
        <h2 className={styles.title}>{product.name}</h2>
        <p className={styles.category}>Category: {product.category}</p>
        <p className={styles.price}>{product.price} RWF</p>
        <button
          onClick={() => addToCart(product)}
          className={styles.button}
        >
          + Ongeramo
        </button>
      </div>
    </div>
  )
}
