import { SiteHeader } from "@/components/site-header";
import { RunwaySection } from "@/components/runway/runway-section";
import { RailSection } from "@/components/rail/rail-section";
import { BagDialog } from "@/components/bag/bag-dialog";
import { BagToast } from "@/components/bag/bag-toast";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <RunwaySection />
        <RailSection />
      </main>
      <BagDialog />
      <BagToast />
    </>
  );
}
