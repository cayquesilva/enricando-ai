import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";
export const POST = async (request: Request) => {
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.error();
  }

  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.error();
  }

  const text = await request.text();

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-10-28.acacia",
  });

  const event = stripe.webhooks.constructEvent(
    text,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET,
  );

  switch (event.type) {
    //verifica tipo do evento do stripe para direcionar corretamente as ações
    case "invoice.paid": {
      //atualizar usuario com plano novo
      const { customer, subscription, subscription_details } =
        event.data.object;
      const clerkUserId = subscription_details?.metadata?.clerk_user_id;

      //pegar dados publicos do clerk
      if (!clerkUserId) {
        return NextResponse.error();
      }

      await clerkClient().users.updateUser(clerkUserId, {
        privateMetadata: {
          stripeCustomerId: customer,
          stripeSubscriptionId: subscription,
        },
        publicMetadata: {
          subscriptionPlan: "premium",
        },
      });
      break;
    }
    //caso seja solicitação de deletar, vamos remover o plano
    case "customer.subscription.deleted": {
      //pega informação da inscrição, pois não vem mastigado como o evento do case anterior
      const subscription = await stripe.subscriptions.retrieve(
        event.data.object.id,
      );

      const clerkUserId = subscription.metadata.clerk_user_id;

      if (!clerkUserId) {
        return NextResponse.error();
      }

      //atualiza usuario no clerk, removendo o plano
      await clerkClient().users.updateUser(clerkUserId, {
        privateMetadata: {
          stripeCustomerId: null,
          stripeSubscriptionId: null,
        },
        publicMetadata: {
          subscriptionPlan: null,
        },
      });
    }
  }

  return NextResponse.json({ received: true });
};
