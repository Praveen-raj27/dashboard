
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Checkout.css";

function Checkout() {
  const navigate = useNavigate();

  const [cartItems] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("snowpify_cart") || "[]"
      );
    } catch {
      return [];
    }
  });

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    paymentMethod: "cod",
    notes: "",
  });

  const [errors, setErrors] = useState({});
  const [reviewReady, setReviewReady] = useState(false);

  const getValue = (item, key) =>
    item?.[key] ?? item?.[key.toLowerCase()] ?? "";

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(price) || 0);

  const totalItems = useMemo(
    () =>
      cartItems.reduce(
        (total, entry) => total + Number(entry.quantity || 0),
        0
      ),
    [cartItems]
  );

  const subtotal = useMemo(
    () =>
      cartItems.reduce((total, entry) => {
        const price =
          Number(getValue(entry.item, "UNIT_PRICE")) || 0;

        return total + price * Number(entry.quantity || 0);
      }, 0),
    [cartItems]
  );

  const deliveryCharge = 0;
  const grandTotal = subtotal + deliveryCharge;

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    setReviewReady(false);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Please enter your full name.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = "Enter a valid 10-digit Indian mobile number.";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Please enter your delivery address.";
    }

    if (!formData.city.trim()) {
      newErrors.city = "Please enter your city.";
    }

    if (!formData.state.trim()) {
      newErrors.state = "Please enter your state.";
    }

    if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = "Enter a valid 6-digit PIN code.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (cartItems.length === 0) {
      navigate("/cart");
      return;
    }

    if (!validateForm()) {
      setReviewReady(false);
      return;
    }

    // Frontend review only. No real order is created yet.
    setReviewReady(true);

    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  };

  if (cartItems.length === 0) {
    return (
      <main className="checkout-page">
        <div className="checkout-empty">
          <span>🛒</span>
          <h2>Your cart is empty</h2>
          <p>Add products before proceeding to checkout.</p>

          <button
            type="button"
            onClick={() => navigate("/")}
          >
            Explore Products →
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <div className="checkout-container">

        {/* Header */}
        <div className="checkout-heading">
          <div>
            <span className="checkout-eyebrow">
              ALMOST THERE
            </span>
            <h1>Checkout</h1>
            <p>Complete your delivery details to review your order.</p>
          </div>

          <button
            type="button"
            className="checkout-back-button"
            onClick={() => navigate("/cart")}
          >
            ← Back to Cart
          </button>
        </div>

        {/* Checkout Steps */}
        <div className="checkout-steps">
          <div className="checkout-step completed">
            <span>✓</span>
            <p>Shopping Cart</p>
          </div>

          <div className="checkout-step active">
            <span>2</span>
            <p>Checkout</p>
          </div>

          <div className="checkout-step">
            <span>3</span>
            <p>Confirmation</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="checkout-layout">

            {/* Customer Details */}
            <div className="checkout-form-section">

              {/* Contact Information */}
              <section className="checkout-card">
                <div className="checkout-card-heading">
                  <span className="checkout-section-number">01</span>
                  <div>
                    <h2>Contact Information</h2>
                    <p>Enter your contact details.</p>
                  </div>
                </div>

                <div className="checkout-form-grid">
                  <div className="checkout-field full-width">
                    <label htmlFor="fullName">Full Name *</label>
                    <input
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      autoComplete="name"
                    />
                    {errors.fullName && (
                      <span className="checkout-error">
                        {errors.fullName}
                      </span>
                    )}
                  </div>

                  <div className="checkout-field">
                    <label htmlFor="email">Email Address *</label>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      autoComplete="email"
                    />
                    {errors.email && (
                      <span className="checkout-error">
                        {errors.email}
                      </span>
                    )}
                  </div>

                  <div className="checkout-field">
                    <label htmlFor="phone">Mobile Number *</label>
                    <input
                      id="phone"
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      inputMode="numeric"
                      autoComplete="tel"
                    />
                    {errors.phone && (
                      <span className="checkout-error">
                        {errors.phone}
                      </span>
                    )}
                  </div>
                </div>
              </section>

              {/* Delivery Address */}
              <section className="checkout-card">
                <div className="checkout-card-heading">
                  <span className="checkout-section-number">02</span>
                  <div>
                    <h2>Delivery Address</h2>
                    <p>Where should we deliver your order?</p>
                  </div>
                </div>

                <div className="checkout-form-grid">
                  <div className="checkout-field full-width">
                    <label htmlFor="address">Street Address *</label>
                    <textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="House number, street, area..."
                      rows={3}
                      autoComplete="street-address"
                    />
                    {errors.address && (
                      <span className="checkout-error">
                        {errors.address}
                      </span>
                    )}
                  </div>

                  <div className="checkout-field">
                    <label htmlFor="city">City *</label>
                    <input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="City"
                      autoComplete="address-level2"
                    />
                    {errors.city && (
                      <span className="checkout-error">
                        {errors.city}
                      </span>
                    )}
                  </div>

                  <div className="checkout-field">
                    <label htmlFor="state">State *</label>
                    <input
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="State"
                      autoComplete="address-level1"
                    />
                    {errors.state && (
                      <span className="checkout-error">
                        {errors.state}
                      </span>
                    )}
                  </div>

                  <div className="checkout-field">
                    <label htmlFor="pincode">PIN Code *</label>
                    <input
                      id="pincode"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      placeholder="6-digit PIN code"
                      maxLength={6}
                      inputMode="numeric"
                      autoComplete="postal-code"
                    />
                    {errors.pincode && (
                      <span className="checkout-error">
                        {errors.pincode}
                      </span>
                    )}
                  </div>

                  <div className="checkout-field full-width">
                    <label htmlFor="notes">
                      Delivery Instructions (Optional)
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="Any special instructions..."
                      rows={2}
                    />
                  </div>
                </div>
              </section>

              {/* Payment Method */}
              <section className="checkout-card">
                <div className="checkout-card-heading">
                  <span className="checkout-section-number">03</span>
                  <div>
                    <h2>Payment Method</h2>
                    <p>Select your preferred payment method.</p>
                  </div>
                </div>

                <label className="payment-option selected">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={formData.paymentMethod === "cod"}
                    onChange={handleChange}
                  />

                  <span className="payment-option-icon">💵</span>

                  <span className="payment-option-content">
                    <strong>Cash on Delivery</strong>
                    <small>Pay when your order arrives.</small>
                  </span>

                  <span className="payment-option-check">✓</span>
                </label>

                <div className="payment-coming-soon">
                  Online payments (UPI / Cards) will be available soon.
                </div>
              </section>
            </div>

            {/* Order Summary */}
            <aside className="checkout-order-card">
              <h2>Order Summary</h2>

              <p className="checkout-order-count">
                {totalItems} {totalItems === 1 ? "item" : "items"}
                {" "}in your cart
              </p>

              <div className="checkout-order-items">
                {cartItems.map((entry) => {
                  const item = entry.item;
                  const id = getValue(item, "ITEM_ID");
                  const name = getValue(item, "ITEM_NAME");
                  const price =
                    Number(getValue(item, "UNIT_PRICE")) || 0;

                  return (
                    <div className="checkout-order-item" key={id}>
                      <div className="checkout-order-item-info">
                        <strong>{name}</strong>
                        <span>Qty: {entry.quantity}</span>
                      </div>

                      <strong>
                        {formatPrice(price * entry.quantity)}
                      </strong>
                    </div>
                  );
                })}
              </div>

              <div className="checkout-total-row">
                <span>Subtotal</span>
                <strong>{formatPrice(subtotal)}</strong>
              </div>

              <div className="checkout-total-row">
                <span>Delivery</span>
                <strong className="checkout-free">Free</strong>
              </div>

              <div className="checkout-total-divider" />

              <div className="checkout-grand-total">
                <span>Total</span>
                <strong>{formatPrice(grandTotal)}</strong>
              </div>

              <button
                type="submit"
                className="checkout-submit-button"
              >
                Review Order →
              </button>

              <p className="checkout-secure-note">
                🔒 Your details are used for this checkout preview.
              </p>
            </aside>
          </div>

          {/* Review Confirmation */}
          {reviewReady && (
            <section className="checkout-review-result">
              <h2>✓ Details validated successfully</h2>

              <p>
                Your checkout information is ready for order
                submission. No order or payment has been created yet.
              </p>

              <div className="checkout-review-address">
                <strong>Delivery Address</strong>
                <p>{formData.fullName}</p>
                <p>{formData.address}</p>
                <p>
                  {formData.city}, {formData.state} - {formData.pincode}
                </p>
                <p>{formData.phone}</p>
              </div>

              <strong className="checkout-review-total">
                Order Total: {formatPrice(grandTotal)}
              </strong>

              <p className="checkout-review-note">
                Backend order creation and payment integration are
                required before this can become a real order.
              </p>
            </section>
          )}
        </form>
      </div>
    </main>
  );
}

export default Checkout;
