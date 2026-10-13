import { Hero } from "@/components/site/Hero";
import { SiteHeader } from "@/components/site/SiteHeader";

export default function Page() {
  return (
    <>
      <SiteHeader cta="login" bordered={false} />
      <main>
        <Hero />
      </main>
    </>
  );
}
