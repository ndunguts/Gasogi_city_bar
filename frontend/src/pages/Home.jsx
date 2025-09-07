import { useEffect, useState, useRef } from "react";
import axios from "axios";
import ProductCard from "../components/ProductCard";
import styles from "./Home.module.css"; // shyiraho path nyayo

export default function Home() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [category, setCategory] = useState("ibiribwa"); // default = ibiribwa
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const carouselInterval = useRef(null);

  // Fetch all products
  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/products/")
      .then((response) => {
        setProducts(response.data);
      })
      .catch((error) => console.error("Error fetching products:", error));
  }, []);

  // Whenever products or category change => filter
  useEffect(() => {
    const filtered = products.filter(
      (p) => p.category?.toLowerCase() === category.toLowerCase()
    );
    setFilteredProducts(filtered);
    setCurrentImageIndex(0); // reset carousel kuri first item
  }, [products, category]);

  // Carousel auto change
  useEffect(() => {
    if (filteredProducts.length === 0) return;

    carouselInterval.current = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === filteredProducts.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000);

    return () => clearInterval(carouselInterval.current);
  }, [filteredProducts]);

  const handlePrev = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? filteredProducts.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === filteredProducts.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div className={styles.container}>
      {/* 🔹 Filter buttons */}
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => setCategory("ibiribwa")}
          className={`px-4 py-2 rounded-lg ${
            category === "ibiribwa" ? "bg-blue text-white" : "bg-white"
          }`}
        >
          🍛 Ibiribwa
        </button>
        <button
          onClick={() => setCategory("ibinyobwa")}
          className={`px-4 py-2 rounded-lg ${
            category === "ibinyobwa" ? "bg-blue text-white" : "bg-white"
          }`}
        >
          🥤 Ibinyobwa
        </button>
      </div>

      <div className={styles.productsList}>
        {filteredProducts.map((product) => (
          <div key={product.id} className={styles.productCardWrapper}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {/* Carousel */}
      <div className={styles.carouselContainer}>
        {filteredProducts.length > 0 ? (
          <>
            <img
              src={filteredProducts[currentImageIndex].image}
              alt={filteredProducts[currentImageIndex].name}
              className={styles.carouselImage}
            />
            <div className={styles.buttonsContainer}>
              <button onClick={handlePrev} className={styles.carouselBtn}>
                Prev
              </button>
              <button onClick={handleNext} className={styles.carouselBtn}>
                Next
              </button>
            </div>
          </>
        ) : (
          <p>Nta products ziboneka muri {category}</p>
        )}
      </div>
    </div>
  );
}
