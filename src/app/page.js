
import Banner from "./Banner/page";
import FeaturedRecipes from "./Featured.jsx/page";
import PopularRecipes from "./PopularRecipe/page";
import HowItWorks from "./Static1/page";
import WhyChooseUs from "./Static2/page";

export default function HomePage() {
  return (
    <>
      <Banner />
      <FeaturedRecipes />
      <PopularRecipes />
      <HowItWorks />
      <WhyChooseUs />
    </>
  );
}

