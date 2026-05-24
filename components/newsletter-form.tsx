"use client";

export function NewsletterForm() {
  return (
    <form
      className="blog-newsletter__form"
      onSubmit={(e) => {
        e.preventDefault();
        const email = (e.currentTarget.elements.namedItem("email") as HTMLInputElement).value;
        alert(`Thanks! We'll send updates to ${email} soon.`);
      }}
      aria-label="Newsletter signup"
    >
      <input
        type="email"
        name="email"
        className="blog-newsletter__input"
        placeholder="your@email.com"
        aria-label="Email address"
        required
        id="newsletter-email-input"
      />
      <button type="submit" className="btn-primary" id="newsletter-submit-btn">
        Subscribe →
      </button>
    </form>
  );
}
