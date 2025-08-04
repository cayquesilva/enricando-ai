"use server";

import { requireAuth } from "@/app/_lib/auth";
import Stripe from "stripe";

export const createStripeCheckout = async () => {
  const userId = await requireAuth();

  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Stripe Key não encontrada.");
  }

  if (!process.env.STRIPE_PREMIUM_PLAN_PRICE_ID) {
    throw new Error("Price ID do plano premium não configurado.");
  }

  if (!process.env.NEXT_PUBLIC_APP_URL) {
    throw new Error("URL da aplicação não configurada.");
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-10-28.acacia",
  });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "subscription",
    success_url: process.env.NEXT_PUBLIC_APP_URL,
    cancel_url: process.env.NEXT_PUBLIC_APP_URL,
    subscription_data: {
      metadata: {
        clerk_user_id: userId,
      },
    },
    line_items: [
      {
        price: process.env.STRIPE_PREMIUM_PLAN_PRICE_ID,
        quantity: 1,
      },
    ],
  });

  return { sessionId: session.id };
};
