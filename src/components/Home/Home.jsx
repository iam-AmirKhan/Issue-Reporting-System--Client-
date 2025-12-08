import BannerSlider from "../Home/BannerSlider";
import Features from "./Features";
import LatestResolvedSection from "./LatestResolvedSection";
import NewsLetter from "./NewsLetter";
import Testimonials from "./Testimonials";

const Home = () => {
  return (
    <div>
      <BannerSlider />
      <LatestResolvedSection />
      <Features />
      <Testimonials />
      <NewsLetter />
      
    </div>
  );
};

export default Home;
