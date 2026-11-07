
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getInventory } from "../services/salesService";
import "./Home.css";

function Home() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("default");
  const [cart, setCart] = useState({});

  const navigate = useNavigate();

  // Supports uppercase Snowflake columns and lowercase API fields
  const getValue = (item, key) =>
    item[key] ?? item[key.toLowerCase()] ?? "";

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getInventory();
      setInventory(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Unable to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const categories = useMemo(() => {
    return [
      "All",
      ...new Set(
        inventory
          .map((item) => getValue(item, "CATEGORY"))
          .filter(Boolean)
      ),
    ];
  }, [inventory]);

  const filteredProducts = useMemo(() => {
    let products = inventory.filter((item) => {
      const name = String(getValue(item, "ITEM_NAME"));
      const itemCategory = String(getValue(item, "CATEGORY"));

      const matchesSearch = name
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesCategory =
        category === "All" || itemCategory === category;

      return matchesSearch && matchesCategory;
    });

    if (sortBy === "price-low") {
      products.sort(
        (a, b) =>
          Number(getValue(a, "UNIT_PRICE")) -
          Number(getValue(b, "UNIT_PRICE"))
      );
    } else if (sortBy === "price-high") {
      products.sort(
        (a, b) =>
          Number(getValue(b, "UNIT_PRICE")) -
          Number(getValue(a, "UNIT_PRICE"))
      );
    } else if (sortBy === "name") {
      products.sort((a, b) =>
        String(getValue(a, "ITEM_NAME")).localeCompare(
          String(getValue(b, "ITEM_NAME"))
        )
      );
    }

    return products;
  }, [inventory, search, category, sortBy]);

  // Add or remove product quantity
  const updateCart = (item, change) => {
    const id = getValue(item, "ITEM_ID");
    const stock = Number(getValue(item, "QUANTITY")) || 0;

    setCart((previous) => {
      const currentQuantity = previous[id] || 0;

      const nextQuantity = Math.max(
        0,
        Math.min(currentQuantity + change, stock)
      );

      const updated = { ...previous };

      if (nextQuantity === 0) {
        delete updated[id];
      } else {
        updated[id] = nextQuantity;
      }

      return updated;
    });
  };

  // Cart total quantity
  const totalCartItems = Object.values(cart).reduce(
    (total, quantity) => total + quantity,
    0
  );

  // Cart total price
  const cartTotal = inventory.reduce((total, item) => {
    const id = getValue(item, "ITEM_ID");

    return (
      total +
      (cart[id] || 0) *
        Number(getValue(item, "UNIT_PRICE") || 0)
    );
  }, 0);

  const totalUnits = inventory.reduce(
    (total, item) =>
      total + Number(getValue(item, "QUANTITY") || 0),
    0
  );

  const totalValue = inventory.reduce(
    (total, item) =>
      total +
      Number(getValue(item, "QUANTITY") || 0) *
        Number(getValue(item, "UNIT_PRICE") || 0),
    0
  );

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(price) || 0);

  const getProductIcon = (category) => {
    const value = String(category).toLowerCase();

    if (value.includes("electronic")) return "💻";
    if (value.includes("cloth") || value.includes("fashion")) return "👕";
    if (value.includes("food")) return "🥗";
    if (value.includes("furniture")) return "🪑";
    if (value.includes("book")) return "📚";
    if (value.includes("accessor")) return "⌚";

    return "📦";
  };

  return (
    <div className="store-page">
      <main className="store-main">
        {/* Hero */}
        <section className="store-hero">
          <div className="store-hero-content">
            <span className="store-hero-label">
              DISCOVER OUR COLLECTION
            </span>

            <h1>
              Everything you need.
              <br />
              <span>All in one place.</span>
            </h1>

            <p>
              Explore our product collection and discover
              something you'll love.
            </p>

            <a href="#products" className="store-hero-button">
              Explore Products <span>→</span>
            </a>
          </div>

          <div className="store-hero-art">
            <div className="store-art-circle">
              <span>✦</span>
              <div className="store-art-box">S</div>
              <div className="store-art-caption">
                QUALITY COLLECTION
              </div>
            </div>
          </div>
        </section>

        {/* Store Statistics */}
        <section className="store-summary">
          <div className="summary-item">
            <span className="summary-icon">▦</span>
            <div>
              <strong>{inventory.length}</strong>
              <span>Products</span>
            </div>
          </div>

          <div className="summary-item">
            <span className="summary-icon">◈</span>
            <div>
              <strong>{totalUnits.toLocaleString("en-IN")}</strong>
              <span>Available Units</span>
            </div>
          </div>

         
        </section>

        {/* Categories */}
        <section className="store-categories" id="categories">
          <div className="store-section-heading">
            <div>
              <span className="store-eyebrow">BROWSE COLLECTION</span>
              <h2>Shop by category</h2>
            </div>
          </div>

          <div className="category-list">
            {categories.map((item) => (
              <button
                key={item}
                className={`category-button ${
                  category === item ? "active" : ""
                }`}
                onClick={() => setCategory(item)}
              >
                {item === "All" ? "✦" : getProductIcon(item)}
                <span>{item}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Products */}
        <section className="store-products" id="products">
          <div className="store-products-heading">
            <div>
              <span className="store-eyebrow">OUR COLLECTION</span>
              <h2>Explore products</h2>
              <p>Find the perfect product for you.</p>
            </div>

            <div className="store-controls">
              <div className="store-search">
                <span>⌕</span>
                <input
                  type="search"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort products"
              >
                <option value="default">Default sorting</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>
          </div>

          {/* Cart Summary */}
          {totalCartItems > 0 && (
            <div className="store-cart-summary">
  <div className="store-cart-info">
    <span className="store-cart-icon">🛒</span>

    <div>
      <strong>
        {totalCartItems} {totalCartItems === 1 ? "Item" : "Items"}
      </strong>
      <span>{formatPrice(cartTotal)}</span>
    </div>
  </div>

  <button
    type="button"
    className="view-cart-icon"
    onClick={() => navigate("/cart")}
    aria-label="View shopping cart"
    title="View Cart"
  >
    <span>🛒</span>
    <span className="cart-count">{totalCartItems}</span>
  </button>
</div>
          )}

          {loading ? (
            <div className="store-message">
              <div className="store-spinner"></div>
              <p>Loading our collection...</p>
            </div>
          ) : error ? (
            <div className="store-message store-error">
              <h3>Unable to load products</h3>
              <p>{error}</p>
              <button onClick={fetchItems}>Try again</button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="store-message">
              <span>🔍</span>
              <h3>No products found</h3>
              <p>Try another search or category.</p>
              <button
                onClick={() => {
                  setSearch("");
                  setCategory("All");
                }}
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="product-grid">
              {filteredProducts.map((item) => {
                const id = getValue(item, "ITEM_ID");
                const name = getValue(item, "ITEM_NAME");
                const itemCategory = getValue(item, "CATEGORY");
                const quantity =
                  Number(getValue(item, "QUANTITY")) || 0;
                const price = getValue(item, "UNIT_PRICE");
                const selectedQuantity = cart[id] || 0;

                return (
                  <article className="product-card" key={id}>
                    <div className="product-image">
                      <span className="product-category-tag">
                        {itemCategory || "General"}
                      </span>

                      <div className="product-placeholder">
                        {getProductIcon(itemCategory)}
                      </div>

                      <span
                        className={`product-stock ${
                          quantity > 0 ? "in-stock" : "out-stock"
                        }`}
                      >
                        {quantity > 0 ? "In Stock" : "Out of Stock"}
                      </span>
                    </div>

                    <div className="product-details">
                      <span className="product-supplier">
                        {getValue(item, "SUPPLIER") ||
                          "Snowpify Collection"}
                      </span>

                      <h3>{name || "Unnamed Product"}</h3>

                      <div className="product-price-row">
                        <strong>{formatPrice(price)}</strong>
                        <span>{quantity} available</span>
                      </div>

                      {/* Cart Quantity Controls */}
                      {selectedQuantity > 0 ? (
                        <div className="product-cart-actions">
                          <div className="quantity-control">
                            <button
                              type="button"
                              onClick={() => updateCart(item, -1)}
                              aria-label={`Remove one ${name}`}
                            >
                              −
                            </button>

                            <span>{selectedQuantity}</span>

                            <button
                              type="button"
                              onClick={() => updateCart(item, 1)}
                              disabled={selectedQuantity >= quantity}
                              aria-label={`Add one ${name}`}
                            >
                              +
                            </button>
                          </div>

                          <button
                            type="button"
                            className="add-cart-button"
                            onClick={() => navigate("/cart")}
                          >
                            View Cart →
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="add-cart-button"
                          onClick={() => updateCart(item, 1)}
                          disabled={quantity <= 0}
                        >
                          {quantity <= 0
                            ? "Out of Stock"
                            : "Add to Cart +"}
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {!loading && !error && (
            <p className="store-result-count">
              Showing {filteredProducts.length} of {inventory.length} products
            </p>
          )}
        </section>

        {/* Footer */}
        <footer className="store-footer">
          <div>
            <h3>Snowpify.</h3>
            <p>Manage smarter. Shop better. Grow together.</p>
          </div>
          <span>
            © {new Date().getFullYear()} Snowpify. All rights reserved.
          </span>
        </footer>
      </main>
    </div>
  );
}

export default Home;
