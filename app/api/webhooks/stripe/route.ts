import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { SUBSCRIPTION_PLANS } from "@/app/_lib/constants";
import Stripe from "stripe";
export const POST = async (request: Request) => {
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing environment variables" }, { status: 500 });
  }

  const text = await request.text();

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-10-28.acacia",
  });

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      text,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "invoice.paid": {
      const { customer, subscription, subscription_details } =
        event.data.object;
      const clerkUserId = subscription_details?.metadata?.clerk_user_id;

      if (!clerkUserId) {
        console.error("Missing clerk_user_id in subscription metadata");
        return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
      }

      try {
        await clerkClient().users.updateUser(clerkUserId, {
          privateMetadata: {
            stripeCustomerId: customer,
            stripeSubscriptionId: subscription,
          },
          publicMetadata: {
            subscriptionPlan: SUBSCRIPTION_PLANS.PREMIUM,
          },
        });
      } catch (error) {
        console.error("Failed to update user:", error);
        return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
      }
      break;
    }
    
    case "customer.subscription.deleted": {
      try {
        const subscription = await stripe.subscriptions.retrieve(
          event.data.object.id,
        );

        const clerkUserId = subscription.metadata.clerk_user_id;

        if (!clerkUserId) {
          console.error("Missing clerk_user_id in subscription metadata");
          return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
        }

        await clerkClient().users.updateUser(clerkUserId, {
          privateMetadata: {
            stripeCustomerId: null,
            stripeSubscriptionId: null,
          },
          publicMetadata: {
            subscriptionPlan: SUBSCRIPTION_PLANS.FREE,
          },
        });
      } catch (error) {
        console.error("Failed to handle subscription deletion:", error);
        return NextResponse.json({ error: "Failed to process cancellation" }, { status: 500 });
      }
      break;
    }
    
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
};
