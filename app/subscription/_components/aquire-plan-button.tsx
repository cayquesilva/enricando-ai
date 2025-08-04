"use client";

import { Button } from "@/app/_components/ui/button";
import { createStripeCheckout } from "../_actions/create-checkout";
import { loadStripe } from "@stripe/stripe-js";
import { useUser } from "@clerk/nextjs";
import { SUBSCRIPTION_PLANS } from "@/app/_lib/constants";
import { useState } from "react";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

const AquirePlanButton = () => {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  const handleAcquirePlanClick = async () => {
    try {
      setIsLoading(true);
      
      const { sessionId } = await createStripeCheckout();

      if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
        throw new Error("Stripe publishable key não encontrada.");
      }

      const stripe = await loadStripe(
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      );

      if (!stripe) {
        throw new Error("Não foi possível carregar a biblioteca Stripe.");
      }

      await stripe.redirectToCheckout({ sessionId });
    } catch (error) {
      console.error("Erro ao processar checkout:", error);
      toast.error("Erro ao processar pagamento. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const hasPremiumPlan = user?.publicMetadata.subscriptionPlan === SUBSCRIPTION_PLANS.PREMIUM;

  if (hasPremiumPlan) {
    return (
      <Button className="w-full rounded-full font-bold" variant="link">
        <Link
          href={`${process.env.NEXT_PUBLIC_STRIPE_CUSTOMER_PORTAL_URL as string}?prefilled_email=${user.emailAddresses[0].emailAddress}`}
        >
          Gerenciar Plano
        </Link>
      </Button>
    );
  }
  
  return (
    <Button
      className="w-full rounded-full font-bold"
      onClick={handleAcquirePlanClick}
      disabled={isLoading}
      variant="default"
    >
      {isLoading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
      Adquirir plano
    </Button>
  );
};

export default AquirePlanButton;
