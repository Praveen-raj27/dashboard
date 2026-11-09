
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Cart.css";

function Cart() {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("snowpify_cart") || "[]"
      );
    } catch {
      return [];
    }
  });

  const getValue = (item, key) =>
    item?.[key] ?? item?.[key.toLowerCase()] ?? "";

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(price) || 0);

  // Persist cart changes
  useEffect(() => {
    localStorage.setItem(
      "snowpify_cart",
      JSON.stringify(cartItems)
    );
  }, [cartItems]);

  // Update quantity
  const updateQuantity = (id, change) => {
    setCartItems((previous) =>
      previous
        .map((entry) => {
          const itemId = getValue(entry.item, "ITEM_ID");

          if (String(itemId) !== String(id)) {
            return entry;
          }

          const stock =
            Number(getValue(entry.item, "QUANTITY")) || 0;

          const nextQuantity = Math.min(
            stock,
            entry.quantity + change
          );

          return {
            ...entry,
            quantity: nextQuantity,
          };
        })
        .filter((entry) => entry.quantity > 0)
    );
  };

  // Remove product
  const removeItem = (id) => {
    setCartItems((previous) =>
      previous.filter(
        (entry) =>
          String(getValue(entry.item, "ITEM_ID")) !==
          String(id)
      )
    );
  };

  // Clear complete cart
  const clearCart = () => {
    setCartItems([]);
  };

  // Cart calculations
  const totalItems = cartItems.reduce(
    (total, entry) => total + entry.quantity,
    0
  );

  const subtotal = cartItems.reduce((total, entry) => {
    const price =
      Number(getValue(entry.item, "UNIT_PRICE")) || 0;

    return total + price * entry.quantity;
  }, 0);

  const deliveryCharge = 0;
  const grandTotal = subtotal + deliveryCharge;

  return (
    <main className="cart-page">
      <div className="cart-container">
        {/* Page Heading */}
        <div className="cart-heading">
          <div>
            <span className="cart-eyebrow">YOUR SHOPPING BAG</span>
            <h1>Shopping Cart</h1>
            <p>Review your selected products before checkout.</p>
          </div>

          <button
            type="button"
            className="continue-shopping-button"
            onClick={() => navigate("/home")}
          >
            ← Continue Shopping
          </button>
        </div>

        {cartItems.length === 0 ? (
          /* Empty Cart */
          <div className="cart-empty">
            <div className="cart-empty-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>
              Looks like you haven't added anything to your shopping cart yet.
            </p>

            <button type="button" onClick={() => navigate("/home")}>
              Explore Products →
            </button>
          </div>
        ) : (
          <div className="cart-layout">
            {/* Cart Products */}
            <section className="cart-products-section">
              <div className="cart-list-heading">
                <h2>Your Items ({totalItems})</h2>

                <button
                  type="button"
                  className="clear-cart-button"
                  onClick={clearCart}
                >
                  Clear Cart
                </button>
              </div>

              <div className="cart-product-list">
                {cartItems.map((entry) => {
                  const item = entry.item;

                  const id = getValue(item, "ITEM_ID");
                  const name = getValue(item, "ITEM_NAME") || "Unnamed Product";

                  const category = getValue(item, "CATEGORY") || "General";

                  const supplier =
                    getValue(item, "SUPPLIER") || "Snowpify Collection";

                  const price = Number(getValue(item, "UNIT_PRICE")) || 0;

                  const stock = Number(getValue(item, "QUANTITY")) || 0;

                  return (
                    <article className="cart-product" key={id}>
                      <div className="cart-product-image">📦</div>

                      <div className="cart-product-details">
                        <span className="cart-product-category">
                          {category}
                        </span>

                        <h3>{name}</h3>

                        <p>{supplier}</p>

                        <strong className="cart-mobile-price">
                          {formatPrice(price)}
                        </strong>
                      </div>

                      <div className="cart-product-price">
                        {formatPrice(price)}
                      </div>

                      <div className="cart-quantity-control">
                        <button
                          type="button"
                          onClick={() => updateQuantity(id, -1)}
                          aria-label={`Decrease ${name} quantity`}
                        >
                          −
                        </button>

                        <span>{entry.quantity}</span>

                        <button
                          type="button"
                          onClick={() => updateQuantity(id, 1)}
                          disabled={entry.quantity >= stock}
                          aria-label={`Increase ${name} quantity`}
                        >
                          +
                        </button>
                      </div>

                      <div className="cart-item-total">
                        <strong>{formatPrice(price * entry.quantity)}</strong>

                        <button
                          type="button"
                          className="remove-cart-item"
                          onClick={() => removeItem(id)}
                        >
                          Remove
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            {/* Order Summary */}
            <aside className="cart-summary-card">
              <h2>Order Summary</h2>

              <div className="cart-summary-row">
                <span>Items ({totalItems})</span>
                <strong>{formatPrice(subtotal)}</strong>
              </div>

              <div className="cart-summary-row">
                <span>Delivery</span>
                <strong className="free-delivery">Free</strong>
              </div>

              <div className="cart-summary-divider" />

              <div className="cart-summary-total">
                <span>Total Amount</span>
                <strong>{formatPrice(grandTotal)}</strong>
              </div>

              <button
                type="button"
                className="checkout-button"
                onClick={() => navigate("/checkout")}
              >
                Proceed to Checkout →
              </button>

              <p className="cart-summary-note">
                Final charges will be confirmed during checkout.
              </p>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}

export default Cart;
