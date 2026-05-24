# DeepLinkOS Product Spec

## Overview
DeepLinkOS is a one-page deeplink tool for creating smart short links from existing social or app destination URLs.

The core idea is:

1. A user lands on a clean page with a single input.
2. They paste a destination URL such as YouTube, TikTok, Instagram, WhatsApp, Telegram, Google Maps, or a custom URL.
3. The app automatically detects the platform.
4. The app generates the first version of a smart short link.
5. The user can customize the second half of that link, such as the slug and optional fallback details.
6. The app returns a hosted short link that can be tested locally on `http://localhost:3000` during development.

This is a v1 validation product, not a full SaaS.

## Product Goal
Build the fastest possible experience for turning a normal destination URL into a smart short link.

The product should feel:

- simple
- modern
- visual
- mobile-friendly
- easy to understand in a few seconds

The user should not feel like they are using a dashboard or a complex link management system.

## Primary User Experience
The homepage should behave like a focused conversion tool, not a marketing-heavy website.

### First impression
When a user lands on the page, they should see:

- a strong centered hero headline
- a short supporting line
- one primary input box for the destination URL
- a minimal “customize” affordance above or near the input

The interface should initially feel almost empty on purpose.

### Main interaction flow
The intended flow is:

1. User pastes a destination URL.
2. The app detects the platform automatically.
3. The composer visually updates to show the detected platform icon or brand mark.
4. The second step appears underneath:
   - editable custom slug
   - optional advanced overrides and fallback fields
5. User clicks `Compose Link`.
6. The app returns a short link.
7. The user can copy it and test it immediately.

### Desired emotional feel
The tool should feel:

- instant
- intelligent
- clean
- lightweight

It should feel like the system “understands” the pasted URL rather than asking the user to configure everything manually.

## Core V1 Concept
The user should only need one required input:

- `destinationUrl`

Everything else should be either:

- inferred automatically
- prefilled intelligently
- optional to customize

This is the main product principle for v1.

## Supported V1 Detection Targets
The detection layer should recognize common platform URLs and classify them into a preset.

Current target presets:

- YouTube
- TikTok
- Instagram
- WhatsApp
- Telegram
- Google Maps
- Custom / unknown

The system should inspect the pasted URL hostname and path and determine the closest preset automatically.

## What The Detection Should Produce
When a URL is pasted, the inference layer should derive:

- detected preset
- default title
- default slug candidate
- default desktop destination
- default mobile destination behavior

### Slug generation goal
The slug should be derived from the input URL where possible.

Examples:

- `https://youtube.com/@buildwithtiana` -> `buildwithtiana`
- `https://www.tiktok.com/@creator` -> `creator`
- `https://t.me/mychannel` -> `mychannel`
- `https://wa.me/15551234567` -> `15551234567`

If a clean slug cannot be inferred, the system can fall back to a generated slug.

## UI Behavior
### Blank state
The initial blank state should show:

- no platform icon
- no slug editor
- no result panel
- just the main input and the surrounding hero

This keeps the first interaction simple.

### Active state after URL entry
Once the user enters a URL:

- show the detected social/app icon
- reveal the custom link section
- prefill the editable slug
- show a localhost preview of the final link

Example:

- base preview: `http://localhost:3000/r/`
- final preview: `http://localhost:3000/r/buildwithtiana`

### Result state after successful compose
After submitting successfully:

- show the final generated link
- provide a copy button
- provide a test button
- keep the result in the same page flow

The result should not navigate the user away from the page.

## Styling Direction
The design direction is intentionally close to the provided reference.

### Layout style
The visual structure should include:

- large centered hero headline
- short centered subheadline
- floating pill button above the composer
- one large rounded white composer card
- teal or teal-adjacent background for now
- soft circular/radial line decoration in the background

### Composer structure
The composer should visually break into two stages:

1. Top row:
   - detected platform icon
   - destination URL input
2. Bottom row:
   - label about customizing the unique identifier
   - slug/custom link editor
   - compose button

### Visual rules
The design should feel close to the reference, but can use:

- different teal values
- white card treatment
- slightly cleaner typography
- our own DeepLinkOS branding

### Mobile requirements
The page must adapt well to mobile:

- headline stays readable
- main input remains prominent
- slug editor stacks cleanly
- compose button becomes full width if needed
- result actions stack without breaking layout

## V1 Functional Requirements
### Required
- One-page landing and tool experience
- One required destination URL input
- Automatic platform detection
- Automatic icon rendering based on detected platform
- Automatic slug suggestion
- Editable custom slug
- Link creation via API
- Returned short link display
- Copy and test actions
- Localhost-friendly output for development

### Optional but supported in customization
- title override
- desktop fallback
- App Store fallback
- Play Store fallback

These should stay secondary in the UI.

## Local Development Behavior
For now, the product should assume local testing.

That means:

- displayed preview links should use `http://localhost:3000`
- displayed result links should also use `http://localhost:3000`
- redirect behavior should still work through local routes

In production later, the host should come from the deployed domain.

## Technical Behavior
### Frontend
The homepage should:

- render the hero and composer on `/`
- start in a minimal blank state
- progressively reveal customization after URL input
- show detected platform instantly as the user types or pastes

### Backend
The API should continue accepting link creation requests and should:

- infer platform from `destinationUrl`
- infer slug if user does not override it
- normalize URLs
- return a composed short link

### Redirect system
Short links should still resolve through:

- `/r/[slug]`

The redirect logic should continue supporting:

- iOS destination
- Android destination
- desktop fallback
- generic fallback when needed

## Non-Goals For V1
The following are explicitly out of scope for now:

- user accounts
- teams
- analytics dashboard
- billing
- saved link history as a primary feature
- branded multi-domain management
- complex admin panel

If something does not help the user paste one URL and get one smart link quickly, it should not be prioritized in v1.

## Success Criteria
V1 is successful if:

- a new user understands the page immediately
- the user can paste a supported destination URL without confusion
- the app detects the platform correctly
- the slug is suggested automatically
- the user can customize the second half easily
- the user gets a working localhost test link quickly
- the page feels polished and modern, not like an unfinished dashboard

## Future V2 Direction
Once v1 is validated, the product can evolve into a larger platform.

Possible v2 additions:

- saved links
- analytics
- accounts
- team collaboration
- branded domains
- campaign views
- richer routing controls

But v2 should build on the same core concept:

- intelligent destination detection
- clean link composition
- strong deeplink routing

## Short Summary
DeepLinkOS v1 is a focused, visually polished, one-page smart link composer.

The user pastes one destination URL.
The system detects the platform automatically.
The system suggests the custom link automatically.
The user edits the second half if desired.
The app returns a localhost-testable short link.

The product should feel intelligent, minimal, and fast.
