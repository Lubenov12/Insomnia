import Stripe from "stripe";
import { loadStripe } from "@stripe/stripe-js";

// Server-side Stripe instance
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
  typescript: true,
});

// Client-side Stripe instance
let stripePromise: Promise<Stripe | null>;
export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
};

// Stripe configuration validation
export const validateStripeConfig = () => {
  const requiredEnvVars = {
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  };

  const missing = Object.entries(requiredEnvVars)
    .filter(([key, value]) => !value || value === "your_key_here")
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(
      `Missing or placeholder Stripe environment variables: ${missing.join(
        ", "
      )}. Please check your .env.local file.`
    );
  }
};

// Helper function to format amount for Stripe (convert to cents/stotinki)
export const formatAmountForStripe = (
  amount: number,
  currency: string
): number => {
  // Bulgarian Lev (BGN) uses subunits (stotinki) - 1 BGN = 100 stotinki
  return Math.round(amount * 100);
};

// Helper function to format amount from Stripe (convert from cents/stotinki)
export const formatAmountFromStripe = (
  amount: number,
  currency: string
): number => {
  return amount / 100;
};
