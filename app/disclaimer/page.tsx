import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal-layout";

export const metadata: Metadata = {
  title:       "Disclaimer",
  description: "DeepLinkOS Disclaimer. Read important information about the limitations of our free deep link generator service.",
  alternates:  { canonical: "https://deeplinkos.com/disclaimer" },
  robots:      { index: true, follow: true },
  openGraph: {
    type:        "website",
    locale:      "en_US",
    siteName:    "DeepLinkOS",
    url:         "https://deeplinkos.com/disclaimer",
    title:       "Disclaimer | DeepLinkOS",
    description: "Important information about the limitations of the DeepLinkOS service.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "DeepLinkOS Disclaimer" }],
  },
  twitter: {
    card:        "summary_large_image",
    title:       "Disclaimer | DeepLinkOS",
    description: "Important information about the limitations of the DeepLinkOS service.",
    images:      ["/og-image.png"],
  },
};

export default function DisclaimerPage() {
  return (
    <LegalLayout title="Disclaimer" lastUpdated="May 1, 2026">

      <div className="legal-section">
        <p>
          The information and tools provided on DeepLinkOS are for general informational
          and utility purposes only. By using this service, you acknowledge and agree
          to the disclaimers set out below.
        </p>
      </div>

      <hr className="legal-divider" />

      <div className="legal-section">
        <h2>No Warranty</h2>
        <p>
          DeepLinkOS is provided on an "as is" basis. We make no representations or
          warranties of any kind, express or implied, about the completeness, accuracy,
          reliability, suitability, or availability of the service or the information
          it provides.
        </p>
        <p>
          Deep linking behavior depends on the operating system version, the target
          application version, and the device configuration. We cannot guarantee that
          a generated link will behave identically across all environments, and we
          accept no liability for links that do not function as expected on a particular
          device or platform.
        </p>
      </div>

      <div className="legal-section">
        <h2>Platform Compatibility</h2>
        <p>
          Mobile platforms (iOS and Android) and the applications that run on them
          change frequently. Apple and Google may update their deep linking standards,
          app store policies, or operating system behavior at any time, which may affect
          how DeepLinkOS-generated links function.
        </p>
        <p>
          Third-party applications (YouTube, Instagram, WhatsApp, TikTok, etc.) may
          also change their URI schemes or deep link handling without notice. DeepLinkOS
          updates its platform detection regularly but cannot guarantee compatibility
          at all times with all versions of all supported applications.
        </p>
      </div>

      <div className="legal-section">
        <h2>No Affiliation with Third-Party Platforms</h2>
        <p>
          DeepLinkOS is an independent service. We are not affiliated with, endorsed
          by, sponsored by, or officially connected to YouTube, Instagram, WhatsApp,
          TikTok, Telegram, X (Twitter), Facebook, Google Maps, Apple, Google, or any
          other platform whose links our tool supports.
        </p>
        <p>
          All product names, logos, and trademarks are the property of their respective
          owners. References to these platforms are for descriptive purposes only.
        </p>
      </div>

      <div className="legal-section">
        <h2>External Links</h2>
        <p>
          Our blog and other content on DeepLinkOS may contain links to external
          websites. These links are provided for convenience and informational purposes
          only. We have no control over the content, privacy practices, or availability
          of external sites, and including a link does not imply endorsement of the
          linked site or its content.
        </p>
      </div>

      <div className="legal-section">
        <h2>Blog Content and Accuracy</h2>
        <p>
          Articles published on the DeepLinkOS blog are written to be informative and
          helpful based on our research and experience. However, the mobile technology
          landscape changes quickly. Information that is accurate at the time of
          publication may become outdated as platforms and tools evolve.
        </p>
        <p>
          We review and update blog content regularly, but we cannot guarantee that
          every article reflects the most current state of the tools, platforms, or
          practices it describes. Always verify important technical decisions with
          current official documentation.
        </p>
      </div>

      <div className="legal-section">
        <h2>Limitation of Liability</h2>
        <p>
          To the fullest extent permitted by law, DeepLinkOS and its operators will not
          be liable for any loss or damage arising from your use of the service,
          including but not limited to loss of data, loss of revenue, or any indirect
          or consequential damages.
        </p>
        <p>
          Your use of DeepLinkOS is entirely at your own risk. You are responsible for
          ensuring that the links you create and share comply with the terms of service
          of the destination platforms and with all applicable laws.
        </p>
      </div>

      <div className="legal-section">
        <h2>Changes to This Disclaimer</h2>
        <p>
          This disclaimer may be updated at any time. The "Last updated" date at the
          top of this page reflects the most recent revision. Continued use of
          DeepLinkOS after changes are posted constitutes acceptance of the revised
          disclaimer.
        </p>
      </div>

    </LegalLayout>
  );
}
