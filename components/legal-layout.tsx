import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

interface LegalPageProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export function LegalLayout({ title, lastUpdated, children }: LegalPageProps) {
  return (
    <>
      <SiteHeader />
      <main className="legal-page" id="main-content">
        <div className="container">
          <header className="legal-header">
            <h1>{title}</h1>
            <p className="legal-header__meta">Last updated: {lastUpdated}</p>
          </header>
          <div className="legal-content">
            {children}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
