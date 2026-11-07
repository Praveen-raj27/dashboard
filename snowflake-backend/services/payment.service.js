
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createRazorpayOrder = async ({
  amount,
  receipt,
}) => {
  return razorpay.orders.create({
    amount: Math.round(amount * 100), // INR to paise
    currency: "INR",
    receipt,
  });
};

export const fetchRazorpayPayment = async (paymentId) => {
  return razorpay.payments.fetch(paymentId);
};

export default razorpay;
