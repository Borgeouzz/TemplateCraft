import Hero from "@/components/hero";
import Navbar from "@/components/navbar";
import PricingCard from "@/components/pricing-card";
import Footer from "@/components/footer";
import { ArrowUpRight, CheckCircle2, Zap, Shield, Users } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import { HomeContent } from "@/components/home-content";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />
      <Hero />
      <HomeContent />
      <Footer />
      <Toaster />
    </div>
  );
}
