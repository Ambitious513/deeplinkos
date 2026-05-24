import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export default function MissingPage() {
  return (
    <div className="not-found-page">
      <Card className="not-found-card">
        <Badge>Missing link</Badge>
        <h1>This smart link could not be resolved.</h1>
        <p>
          The link may be inactive, missing, or incomplete. Open the generator to publish a fresh
          routing record with valid mobile and fallback destinations.
        </p>
        <div className="hero__actions">
          <Link href="/app" className="button button--primary">
            Open app
          </Link>
          <Link href="/app/links" className="button button--secondary">
            Recent links
          </Link>
        </div>
      </Card>
    </div>
  );
}
