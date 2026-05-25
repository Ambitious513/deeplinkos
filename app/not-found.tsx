import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="not-found-page">
      <Card className="not-found-card">
        <Badge>Missing link</Badge>
        <h1>This smart link could not be found.</h1>
        <p>
          The slug may have been removed, mistyped, or never created. You can head back to the app
          and publish a fresh short link in a minute.
        </p>
        <div className="hero__actions">
          <Link href="/dashboard" className="button button--primary">
            Open app
          </Link>
          <Link href="/" className="button button--secondary">
            Back to home
          </Link>
        </div>
      </Card>
    </div>
  );
}
