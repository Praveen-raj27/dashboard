import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getInventory } from "../../services/salesService";
import "./Home.css";
import "./ProductModal.css";

function Home() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("default");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalQuantity, setModalQuantity] = useState(1);

  const [cart, setCart] = useState(() => {
    try {
      const savedCart = JSON.parse(
        localStorage.getItem("snowpify_cart") || "[]",
      );

      return savedCart.reduce((result, entry) => {
        const id = entry.item?.ITEM_ID ?? entry.item?.item_id;

        if (id != null) {
          result[id] = Number(entry.quantity) || 0;
        }

        return result;
      }, {});
    } catch {
      return {};
    }
  });

  const navigate = useNavigate();

  // Supports uppercase Snowflake columns and lowercase API fields
  const getValue = (item, key) =>
    item?.[key] ?? item?.[key.toLowerCase()] ?? "";

  // Get product image URL
  const getProductImage = (item) =>
    getValue(item, "IMAGE_URL") || getValue(item, "IMAGEURL") || "";

  // Fetch inventory
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

  // Persist cart
  useEffect(() => {
    if (loading || inventory.length === 0) return;

    const savedCart = inventory
      .filter((item) => {
        const id = getValue(item, "ITEM_ID");
        return cart[id] > 0;
      })
      .map((item) => {
        const id = getValue(item, "ITEM_ID");

        return {
          item,
          quantity: cart[id],
        };
      });

    localStorage.setItem("snowpify_cart", JSON.stringify(savedCart));
  }, [cart, inventory, loading]);

  // Categories
  const categories = useMemo(() => {
    return [
      "All",
      ...new Set(
        inventory.map((item) => getValue(item, "CATEGORY")).filter(Boolean),
      ),
    ];
  }, [inventory]);

  // Search, filter and sort
  const filteredProducts = useMemo(() => {
    let products = inventory.filter((item) => {
      const name = String(getValue(item, "ITEM_NAME"));
      const itemCategory = String(getValue(item, "CATEGORY"));

      const matchesSearch = name.toLowerCase().includes(search.toLowerCase());

      const matchesCategory = category === "All" || itemCategory === category;

      return matchesSearch && matchesCategory;
    });

    if (sortBy === "price-low") {
      products.sort(
        (a, b) =>
          Number(getValue(a, "UNIT_PRICE")) - Number(getValue(b, "UNIT_PRICE")),
      );
    } else if (sortBy === "price-high") {
      products.sort(
        (a, b) =>
          Number(getValue(b, "UNIT_PRICE")) - Number(getValue(a, "UNIT_PRICE")),
      );
    } else if (sortBy === "name") {
      products.sort((a, b) =>
        String(getValue(a, "ITEM_NAME")).localeCompare(
          String(getValue(b, "ITEM_NAME")),
        ),
      );
    }

    return products;
  }, [inventory, search, category, sortBy]);

  // Product modal
  const openProductModal = (item) => {
    setSelectedProduct(item);
    setModalQuantity(1);
  };

  const closeProductModal = () => {
    setSelectedProduct(null);
    setModalQuantity(1);
  };

  // Add or remove cart quantity
  const updateCart = (item, change) => {
    const id = getValue(item, "ITEM_ID");
    const stock = Number(getValue(item, "QUANTITY")) || 0;

    setCart((previous) => {
      const currentQuantity = previous[id] || 0;

      const nextQuantity = Math.max(
        0,
        Math.min(currentQuantity + change, stock),
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

  // Cart quantity
  const totalCartItems = Object.values(cart).reduce(
    (total, quantity) => total + quantity,
    0,
  );

  // Cart total
  const cartTotal = inventory.reduce((total, item) => {
    const id = getValue(item, "ITEM_ID");

    return total + (cart[id] || 0) * Number(getValue(item, "UNIT_PRICE") || 0);
  }, 0);

  const totalUnits = inventory.reduce(
    (total, item) => total + Number(getValue(item, "QUANTITY") || 0),
    0,
  );

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(price) || 0);

  // Category fallback icon
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

  // Reusable image fallback
  const handleImageError = (event) => {
    event.currentTarget.style.display = "none";
  };

  return (
    <div className="store-page">
      <main className="store-main">
        {/* Hero */}
        <section className="store-hero">
          <div className="store-hero-content">
            <span className="store-hero-label">DISCOVER OUR COLLECTION</span>

            <h1>
              Everything you need.
              <br />
              <span>All in one place.</span>
            </h1>

            <p>
              Explore our product collection and discover something you'll love.
            </p>

            <a href="#products" className="store-hero-button">
              Explore Products <span>→</span>
            </a>
          </div>

          <div className="store-hero-art">
            <div className="store-art-circle">
              <span>✦</span>
              <div className="store-art-box">S</div>
              <div className="store-art-caption">QUALITY COLLECTION</div>
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

          {/* Loading */}
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
                const quantity = Number(getValue(item, "QUANTITY")) || 0;
                const price = getValue(item, "UNIT_PRICE");
                const selectedQuantity = cart[id] || 0;
                const imageUrl = getProductImage(item);

                return (
                  <article
                    className="product-card product-card-clickable"
                    key={id}
                    onClick={() => openProductModal(item)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        openProductModal(item);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`View details for ${name}`}
                  >
                    <div className="product-image">
                      <span className="product-category-tag">
                        {itemCategory || "General"}
                      </span>

                      <div className="product-placeholder">
                        {getProductIcon(itemCategory)}
                      </div>

                      {imageUrl && (
                        <img
                          className="product-card-photo"
                          src={imageUrl}
                          alt={name || "Product"}
                          loading="lazy"
                          onError={handleImageError}
                        />
                      )}

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
                        {getValue(item, "SUPPLIER") || "Snowpify Collection"}
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
                              onClick={(event) => {
                                event.stopPropagation();
                                updateCart(item, -1);
                              }}
                              aria-label={`Remove one ${name}`}
                            >
                              −
                            </button>

                            <span>{selectedQuantity}</span>

                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                updateCart(item, 1);
                              }}
                              disabled={selectedQuantity >= quantity}
                              aria-label={`Add one ${name}`}
                            >
                              +
                            </button>
                          </div>

                          <button
                            type="button"
                            className="add-cart-button"
                            onClick={(event) => {
                              event.stopPropagation();
                              navigate("/cart");
                            }}
                          >
                            View Cart →
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="add-cart-button"
                          onClick={(event) => {
                            event.stopPropagation();
                            updateCart(item, 1);
                          }}
                          disabled={quantity <= 0}
                        >
                          {quantity <= 0 ? "Out of Stock" : "Add to Cart +"}
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

        {/* Product Details Modal */}
        {selectedProduct && (
          <div
            className="product-modal-backdrop"
            onClick={closeProductModal}
            role="presentation"
          >
            <section
              className="product-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="product-modal-title"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className="product-modal-close"
                onClick={closeProductModal}
                aria-label="Close product details"
              >
                ×
              </button>

              {/* Product Image Preview */}
              <div className="product-modal-visual">
                <span className="product-preview-label">
                  SNOWPIFY EXCLUSIVE
                </span>

                <div className="product-stage">
                  <div className="product-stage-glow" />

                  <div className="product-stage-platform">
                    {getProductImage(selectedProduct) && (
                      <img
                        className="product-stage-photo"
                        src={getProductImage(selectedProduct)}
                        alt={getValue(selectedProduct, "ITEM_NAME")}
                        onError={(event) => {
                          event.currentTarget.style.display = "none";

                          const fallback =
                            event.currentTarget.parentElement.querySelector(
                              ".product-stage-fallback",
                            );

                          if (fallback) {
                            fallback.style.display = "grid";
                          }
                        }}
                      />
                    )}

                    <div
                      className="product-stage-fallback"
                      style={{
                        display: getProductImage(selectedProduct)
                          ? "none"
                          : "grid",
                      }}
                    >
                      {getProductIcon(getValue(selectedProduct, "CATEGORY"))}
                    </div>
                  </div>
                  <div className="product-stage-shadow" />
                </div>

                <span className="product-preview-caption">PRODUCT DETAILS</span>
              </div>

              {/* Product Information */}
              <div className="product-modal-content">
                <span className="product-modal-eyebrow">
                  {getValue(selectedProduct, "CATEGORY") || "GENERAL"}
                </span>

                <h2 id="product-modal-title">
                  {getValue(selectedProduct, "ITEM_NAME") || "Unnamed Product"}
                </h2>

                <p className="product-modal-supplier">
                  {getValue(selectedProduct, "SUPPLIER") ||
                    "Snowpify Collection"}
                </p>

                <strong className="product-modal-price">
                  {formatPrice(getValue(selectedProduct, "UNIT_PRICE"))}
                </strong>

                <p className="product-modal-description">
                  A quality pick from the Snowpify collection. Add it to your
                  cart and continue exploring our store.
                </p>

                <div className="product-modal-stock">
                  <span
                    className={`modal-stock-dot ${
                      Number(getValue(selectedProduct, "QUANTITY")) > 0
                        ? "in-stock"
                        : "out-stock"
                    }`}
                  />

                  {Number(getValue(selectedProduct, "QUANTITY")) > 0
                    ? `${getValue(selectedProduct, "QUANTITY")} units available`
                    : "Currently out of stock"}
                </div>

                {/* Quantity Selector */}
                {Number(getValue(selectedProduct, "QUANTITY")) > 0 && (
                  <>
                    <div className="product-modal-quantity-row">
                      <span>Quantity</span>

                      <div className="quantity-control">
                        <button
                          type="button"
                          onClick={() =>
                            setModalQuantity((value) => Math.max(1, value - 1))
                          }
                          disabled={modalQuantity <= 1}
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>

                        <span>{modalQuantity}</span>

                        <button
                          type="button"
                          onClick={() =>
                            setModalQuantity((value) =>
                              Math.min(
                                Number(getValue(selectedProduct, "QUANTITY")),
                                value + 1,
                              ),
                            )
                          }
                          disabled={
                            modalQuantity >=
                            Number(getValue(selectedProduct, "QUANTITY"))
                          }
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Add to Cart */}
                    <button
                      type="button"
                      className="add-cart-button product-modal-add-button"
                      onClick={() => {
                        updateCart(selectedProduct, modalQuantity);
                        closeProductModal();
                      }}
                    >
                      Add {modalQuantity} to Cart ·{" "}
                      {formatPrice(
                        Number(getValue(selectedProduct, "UNIT_PRICE")) *
                          modalQuantity,
                      )}
                    </button>
                  </>
                )}
              </div>
            </section>
          </div>
        )}

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
