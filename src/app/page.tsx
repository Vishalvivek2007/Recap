import { AuroraBackground } from "@/components/landing/AuroraBackground";
import { Navbar } from "@/components/shared/Navbar";
import { Hero } from "@/components/landing/Hero";
import { FeatureBlocks } from "@/components/landing/FeatureBlocks";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { FAQ } from "@/components/landing/FAQ";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <>
      <AuroraBackground />
      <Navbar />
      <main className="relative">
        <Hero />
        <FeatureBlocks />
        <HowItWorks />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}