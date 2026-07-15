/** Prompt brands can use to produce a markdown kit for Brand → Import .md */
export const BRAND_KIT_MD_PROMPT = `You are our brand strategist. Write a complete brand kit as a single Markdown document we can import into our marketing system.

Be specific to OUR company — no generic fluff. Use real products, markets, customers, and language. If something is unknown, mark it as [TBD] and propose a strong draft anyway.

Return ONLY the Markdown below (no preamble, no code fences).

# [Company legal / trading name]

## Snapshot
- One-line what we do
- Industry / category
- HQ / primary market
- Years in business (if known)
- Website

## Mission
2–4 sentences.

## Vision
2–4 sentences.

## Values
- 4–7 values with one plain sentence each

## Audience
- Primary buyer (role, company type, pain)
- Secondary audiences
- What they care about before they buy
- Words they use / avoid

## Voice & tone
- Voice in 3–5 adjectives
- Tone by channel: LinkedIn / website / WhatsApp or email
- Reading level
- Point of view (we / you)

## Do
- 6–10 writing/behavior rules

## Don't
- 6–10 hard bans (words, claims, styles)

## Messaging
### Positioning
One paragraph: who we are for, what we deliver, why we’re different.

### Proof points
- 5–8 concrete proof bullets (numbers, capabilities, geography, certifications)

### Taglines / hooks
- 5 short lines we can reuse

### Elevator pitch
- 30-second version
- 10-second version

## Content pillars
- 4–6 pillars with: name, why it matters, 3 example post topics each

## Products & offers
For each main product/service:
- Name
- Who it’s for
- Outcome
- Key specs / differentiators
- Common objections + answers

## Visual identity
### Colors
- Primary / secondary / accent / background / text (hex if known, else describe + suggest hex)

### Typography
- Heading feel (e.g. industrial sans, editorial serif)
- Body feel
- Rules (weights, casing)

### Visual style
Photography, materials, composition, mood (3–6 sentences).

### Motion style
How UI/video should feel (subtle / kinetic / none).

## Competitors
- 3–5 competitors + how we differ in one line each

## LinkedIn post style
- Cadence (e.g. Mon/Wed/Fri)
- Typical length
- Hook style
- CTA style
- Hashtag policy (max 3)
- What “good” sounds like for us
### Example
Paste or invent 1 strong example post in our voice.

## Instagram post style
(Same structure as LinkedIn, shorter, more visual.)

## Brand memory notes
Anything else marketers must never forget (compliance, claims limits, founder story, geography, languages).

Company context to use (fill this before running the prompt):
- Company name:
- Website:
- What we sell:
- Who we sell to:
- Countries / cities we serve:
- Differentiators:
- Tone we want:
- Things we must never say:`;
