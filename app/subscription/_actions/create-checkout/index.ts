"use server";

import { auth } from "@clerk/nextjs/server";
import Stripe from "stripe";

//caso tenha mais de um plano, passar como parametro o productId
export const createStripeCheckout = async () => {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Não autorizado.");
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Stripe Key não encontrada.");
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-10-28.acacia",
  });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "subscription",
    success_url: `http://localhost:3000`,
    cancel_url: `http://localhost:3000`,
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
