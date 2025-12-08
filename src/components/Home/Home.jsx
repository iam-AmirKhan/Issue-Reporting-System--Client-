import BannerSlider from "../Home/BannerSlider";
import Features from "./Features";
import FeatureSection from "./FeatureSection";
import LatestResolvedSection from "./LatestResolvedSection";
import NewsLetter from "./NewsLetter";
import Testimonials from "./Testimonials";

const Home = () => {
  return (
    <div>
      <BannerSlider />
      <LatestResolvedSection />
      <FeatureSection />
      <Features />
      <Testimonials />
      <NewsLetter />
      
    </div>
  );
};

export default Home;
