import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal-layout";

export const metadata: Metadata = {
  title:       "Terms of Service",
  description: "Read the DeepLinkOS Terms of Service. By using our free deep link generator, you agree to these terms.",
  alternates:  { canonical: "https://deeplinkos.com/terms" },
  robots:      { index: true, follow: true },
  openGraph: {
    type:        "website",
    locale:      "en_US",
    siteName:    "DeepLinkOS",
    url:         "https://deeplinkos.com/terms",
    title:       "Terms of Service | DeepLinkOS",
    description: "Read the DeepLinkOS Terms of Service.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "DeepLinkOS Terms of Service" }],
  },
  twitter: {
    card:        "summary_large_image",
    title:       "Terms of Service | DeepLinkOS",
    description: "Read the DeepLinkOS Terms of Service.",
    images:      ["/og-image.png"],
  },
};

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" lastUpdated="May 1, 2026">

      <div className="legal-section">
        <p>
          Welcome to DeepLinkOS. By accessing or using our website at{" "}
          <a href="https://deeplinkos.com">deeplinkos.com</a> and the link generation
          tool we provide, you agree to be bound by these Terms of Service. Please read
          them carefully before using the service.
        </p>
        <p>
          If you do not agree to these terms, do not use DeepLinkOS.
        </p>
      </div>

      <hr className="legal-divider" />

      <div className="legal-section">
        <h2>1. Description of Service</h2>
        <p>
          DeepLinkOS provides a free web-based tool that allows users to generate smart
          deep links for mobile applications. The service detects the platform from a
          provided URL and creates a redirect link that routes end users to the appropriate
          native mobile application or web fallback based on their device.
        </p>
        <p>
          The service is provided free of charge on its current version (v1). We reserve
          the right to introduce paid plans, usage limits, or account requirements in
          future versions.
        </p>
      </div>

      <div className="legal-section">
        <h2>2. Acceptable Use</h2>
        <p>You agree not to use DeepLinkOS for any of the following purposes:</p>
        <ul>
          <li>Generating links to content that is illegal, harmful, threatening, abusive, or fraudulent</li>
          <li>Distributing malware, spyware, or other malicious software</li>
          <li>Phishing, identity theft, or deceptive redirection of users</li>
          <li>Circumventing platform terms of service for any mobile application</li>
          <li>Sending unsolicited commercial communications (spam)</li>
          <li>Attempting to overload, exploit, or reverse-engineer our systems</li>
          <li>Creating links that infringe on the intellectual property rights of third parties</li>
        </ul>
        <p>
          We reserve the right to disable or delete any generated link that violates
          these terms without notice.
        </p>
      </div>

      <div className="legal-section">
        <h2>3. Generated Links and User Responsibility</h2>
        <p>
          When you generate a deep link using DeepLinkOS, you are responsible for the
          content that link points to. We do not review, monitor, or take responsibility
          for the destination content of any link created through our platform.
        </p>
        <p>
          DeepLinkOS acts as a routing intermediary only. We do not store the destination
          URL content, nor do we endorse or represent any third-party application or
          website that a generated link may point to.
        </p>
      </div>

      <div className="legal-section">
        <h2>4. Intellectual Property</h2>
        <p>
          The DeepLinkOS name, logo, website design, and underlying technology are the
          intellectual property of DeepLinkOS and its operators. You may not copy,
          reproduce, modify, distribute, or create derivative works of any part of the
          platform without express written permission.
        </p>
        <p>
          Third-party trademarks referenced on this site (YouTube, Instagram, WhatsApp,
          TikTok, etc.) remain the property of their respective owners. DeepLinkOS is
          not affiliated with, endorsed by, or sponsored by any of these platforms.
        </p>
      </div>

      <div className="legal-section">
        <h2>5. Disclaimers and Limitation of Liability</h2>
        <p>
          DeepLinkOS is provided on an "as is" and "as available" basis without warranties
          of any kind, either express or implied. We do not guarantee that the service
          will be uninterrupted, error-free, or that generated links will function
          correctly on all devices, operating system versions, or app versions.
        </p>
        <p>
          Mobile application deep linking behavior is controlled by the respective
          platform (Apple iOS, Google Android) and the target application itself.
          Changes made by those platforms or applications may affect how generated
          links behave, and we cannot guarantee continued compatibility.
        </p>
        <p>
          To the maximum extent permitted by applicable law, DeepLinkOS and its operators
          shall not be liable for any direct, indirect, incidental, special, or
          consequential damages arising from your use of or inability to use the service.
        </p>
      </div>

      <div className="legal-section">
        <h2>6. Third-Party Services</h2>
        <p>
          DeepLinkOS may use third-party services including but not limited to Google
          Analytics for usage analytics and Google AdSense for advertising. These
          services have their own privacy and data practices. We encourage you to review
          their respective policies.
        </p>
      </div>

      <div className="legal-section">
        <h2>7. Changes to These Terms</h2>
        <p>
          We may update these Terms of Service at any time. Changes will be posted on
          this page with an updated "Last updated" date. Continued use of DeepLinkOS
          after changes are posted constitutes your acceptance of the revised terms.
        </p>
      </div>

      <div className="legal-section">
        <h2>8. Governing Law</h2>
        <p>
          These terms shall be governed by and construed in accordance with applicable
          law. Any disputes arising from these terms or your use of the service shall
          be resolved through good-faith negotiation before any formal legal proceedings.
        </p>
      </div>

      <div className="legal-section">
        <h2>9. Contact</h2>
        <p>
          If you have any questions about these Terms of Service, please contact us
          through the information available on our website.
        </p>
      </div>

    </LegalLayout>
  );
}
