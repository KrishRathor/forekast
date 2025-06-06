import { Features } from "@/components/landing/Features";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { LiveMarket } from "@/components/landing/LiveMarket";
import type React from "react";

export const LandingPage = (): React.ReactElement => {
  return (
    <div className="bg-[#0E0F14] text-white min-h-screen">
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <LiveMarket />
      </main>
    </div>
  )
}

