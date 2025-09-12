import { useEffect, useState, useRef } from "react";
import axios from "axios";
import ProductCard from "../components/ProductCard";
import styles from "./Home.module.css";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [category, setCategory] = useState("ibiribwa"); // default
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const carouselInterval = useRef(null);

  // Fetch all products from Django API
  useEffect(() => {
    axios
      .get("http://16.171.195.132/api/products/")
      .then((response) => {
        // Use response.data.products because API returns an object
        setProducts(response.data.products || []);
      })
      .catch((error) => console.error("Error fetching products:", error));
  }, []);

  // Filter products based on category
  useEffect(() => {
    const filtered = Array.isArray(products)
      ? products.filter(
          (p) => p.category?.toLowerCase() === category.toLowerCase()
        )
      : [];
    setFilteredProducts(filtered);
    setCurrentImageIndex(0); // reset carousel
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
      {/* Filter buttons */}
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

      {/* Products list */}
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
              src={filteredProducts[currentImageIndex]?.image}
              alt={filteredProducts[currentImageIndex]?.name || ""}
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
