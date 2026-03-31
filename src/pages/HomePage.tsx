import { Hero } from '../sections/Hero';
import { About } from '../sections/About';
import { CityMotion } from '../sections/CityMotion';
import { PortraitStudy } from '../sections/PortraitStudy';
import { DayNight } from '../sections/DayNight';
import { AllProducts } from '../sections/AllProducts';
import { CraftSection } from '../sections/CraftSection';
import { FinalScene } from '../sections/FinalScene';
import { Newsletter } from '../sections/Newsletter';
import { Signature } from '../sections/Signature';
import { Footer } from '../sections/Footer';

export function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <CityMotion />
      <PortraitStudy />
      <DayNight />
      <AllProducts />
      <CraftSection />
      <FinalScene />
      <Newsletter />
      <Signature />
      <Footer />
    </>
  );
}
