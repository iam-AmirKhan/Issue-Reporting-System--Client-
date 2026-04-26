import React from "react";
import BannerSlider from "./BannerSlider";
import FeatureSection from "./FeatureSection";
import LatestResolvedSection from "./LatestResolvedSection";
import RecentReportsSection from "./RecentReportsSection";
import HowItWorks from "./HowItWorks";
import Testimonials from "./Testimonials";
import NewsLetter from "./NewsLetter";

const Home = () => {
  return (
    <div className="bg-white">
      {/* 1. Banner Section */}
      <BannerSlider />

      {/* 2. Recent Community Reports */}
      <RecentReportsSection />

      {/* 3. Latest Resolved Issues */}
      <LatestResolvedSection />

      {/* 3. Features Section */}
      <FeatureSection />

      {/* 4. How It Works Section */}
      <HowItWorks />

      {/* 5. Extra Section 1: Testimonials */}
      <Testimonials />

      {/* 6. Extra Section 2: Newsletter */}
      <NewsLetter />
    </div>
  );
};

export default Home;
