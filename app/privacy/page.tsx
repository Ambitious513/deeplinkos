import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal-layout";

export const metadata: Metadata = {
  title:       "Privacy Policy",
  description: "DeepLinkOS Privacy Policy. Learn how we collect, use, and protect your data when you use our free deep link generator.",
  alternates:  { canonical: "https://deeplinkos.com/privacy" },
  robots:      { index: true, follow: true },
  openGraph: {
    type:        "website",
    locale:      "en_US",
    siteName:    "DeepLinkOS",
    url:         "https://deeplinkos.com/privacy",
    title:       "Privacy Policy | DeepLinkOS",
    description: "Learn how DeepLinkOS collects, uses, and protects your data.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "DeepLinkOS Privacy Policy" }],
  },
  twitter: {
    card:        "summary_large_image",
    title:       "Privacy Policy | DeepLinkOS",
    description: "Learn how DeepLinkOS collects, uses, and protects your data.",
    images:      ["/og-image.png"],
  },
};

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated="May 1, 2026">

      <div className="legal-section">
        <p>
          Your privacy matters to us. This Privacy Policy explains what information
          DeepLinkOS collects when you use our website and link generation tool, how
          we use that information, and what choices you have.
        </p>
        <p>
          We have written this policy to be clear and readable. If something is not
          clear, feel free to reach out through our website.
        </p>
      </div>

      <hr className="legal-divider" />

      <div className="legal-section">
        <h2>1. Information We Collect</h2>
        <p>
          <strong>Information you provide directly:</strong> When you use the link
          generator, we process the URL you paste in order to detect the platform and
          generate your smart link. We do not associate this URL with your identity
          unless you create an account (accounts are not currently required).
        </p>
        <p>
          <strong>Usage data:</strong> Like most websites, we collect standard web
          analytics data including pages visited, time spent on the site, browser type,
          operating system, and general geographic region (country/city level). This
          data is aggregated and not linked to individual identities.
        </p>
        <p>
          <strong>Link redirect data:</strong> When someone clicks a DeepLinkOS-generated
          link, we log basic redirect metadata including the timestamp, the device type
          (mobile or desktop), and the destination platform. This helps us improve the
          service. We do not log personally identifiable information about link clickers.
        </p>
      </div>

      <div className="legal-section">
        <h2>2. How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Generate and serve smart deep links based on your input</li>
          <li>Monitor and improve the performance and reliability of the service</li>
          <li>Understand how the platform is being used so we can build better features</li>
          <li>Detect and prevent abuse, fraud, and violations of our Terms of Service</li>
          <li>Serve relevant advertising through Google AdSense (see Section 4)</li>
        </ul>
        <p>We do not sell your personal data to third parties.</p>
      </div>

      <div className="legal-section">
        <h2>3. Cookies</h2>
        <p>
          DeepLinkOS uses cookies and similar tracking technologies to improve your
          experience. These include:
        </p>
        <ul>
          <li>
            <strong>Functional cookies:</strong> Used to remember your preferences,
            such as your chosen light or dark mode setting.
          </li>
          <li>
            <strong>Analytics cookies:</strong> Used by Google Analytics to help us
            understand how visitors use the site. These are anonymized and aggregated.
          </li>
          <li>
            <strong>Advertising cookies:</strong> Used by Google AdSense to serve
            relevant ads. Google may use cookies to personalize the ads you see based
            on your browsing history across the web.
          </li>
        </ul>
        <p>
          You can control cookie behavior through your browser settings. Note that
          disabling cookies may affect some functionality of the site.
        </p>
      </div>

      <div className="legal-section">
        <h2>4. Google AdSense and Analytics</h2>
        <p>
          We use Google AdSense to display advertisements. Google may use cookies and
          web beacons to collect data about your visits to this and other websites in
          order to provide targeted ads. You can opt out of personalized advertising
          by visiting{" "}
          <a
            href="https://www.google.com/settings/ads"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google Ad Settings
          </a>
          .
        </p>
        <p>
          We use Google Analytics to analyze traffic patterns. Google Analytics collects
          data anonymously and reports website trends without identifying individual
          visitors. You can opt out using the{" "}
          <a
            href="https://tools.google.com/dlpage/gaoptout"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google Analytics Opt-out Browser Add-on
          </a>
          .
        </p>
      </div>

      <div className="legal-section">
        <h2>5. Data Retention</h2>
        <p>
          Link redirect logs are retained for up to 90 days to help us identify abuse
          and improve routing accuracy. Analytics data is retained per Google Analytics
          and AdSense default settings.
        </p>
        <p>
          If you create an account in a future version of DeepLinkOS, account data is
          retained until you request deletion.
        </p>
      </div>

      <div className="legal-section">
        <h2>6. Your Rights</h2>
        <p>
          Depending on your location, you may have rights under applicable privacy law
          (including GDPR for EU residents and CCPA for California residents) including:
        </p>
        <ul>
          <li>The right to access the personal data we hold about you</li>
          <li>The right to request correction of inaccurate data</li>
          <li>The right to request deletion of your data</li>
          <li>The right to object to or restrict certain processing activities</li>
          <li>The right to data portability</li>
        </ul>
        <p>
          To exercise any of these rights, contact us through our website. We will
          respond within the timeframes required by applicable law.
        </p>
      </div>

      <div className="legal-section">
        <h2>7. Children&apos;s Privacy</h2>
        <p>
          DeepLinkOS is not directed at children under the age of 13. We do not
          knowingly collect personal information from children. If you believe a child
          has provided us with personal information, please contact us and we will
          take appropriate steps to delete it.
        </p>
      </div>

      <div className="legal-section">
        <h2>8. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. When we do, we will
          update the &quot;Last updated&quot; date at the top of this page. We encourage you
          to review this policy periodically.
        </p>
      </div>

      <div className="legal-section">
        <h2>9. Contact Us</h2>
        <p>
          If you have questions or concerns about this Privacy Policy or our data
          practices, please reach out through the contact information available on
          our website.
        </p>
      </div>

    </LegalLayout>
  );
}
