
import Hero from "./Components/Hero";
import Newest from "./Components/Newset";
import OurMissionPage from "./Components/OurMissions";

export default function Home() {
  return (
  <div className="font-[family-name:var(--font-poppins)] scrollbar-hide gsap-scale">
<Hero/>
<Newest/>
  </div>
 
  );
}
