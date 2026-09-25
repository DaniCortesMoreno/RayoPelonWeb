import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { HeroSection } from '../components/home/HeroSection';
import { StandingsSection } from '../components/standings/StandingsSection';
import { KitsSection } from '../components/kits/KitsSection';
import { SquadSection } from '../components/squad/SquadSection';
import { MediaSection } from '../components/media/MediaSection';
import { NewsSection } from '../components/news/NewsSection';
import { SponsorsSection } from '../components/sponsors/SponsorsSection';
import { ContactSection } from '../components/contact/ContactSection';

export const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-rayo-carbon text-rayo-bone selection:bg-rayo-gold selection:text-black">
      <Navbar />
      <main className="pt-20">
        <HeroSection />
        <StandingsSection />
        <KitsSection />
        <SquadSection />
        <MediaSection />
        <NewsSection />
        <SponsorsSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};
