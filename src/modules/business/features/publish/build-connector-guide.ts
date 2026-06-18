export interface ConnectorGuideInput {
  tenantName: string;
  tenantSlug: string;
  apiBase: string;
  embedOrigin: string;
}

export function buildConnectorGuide({
  tenantName,
  tenantSlug,
  apiBase,
  embedOrigin,
}: ConnectorGuideInput): string {
  const snapshotUrl = `${apiBase}/public/tenants/${tenantSlug}/snapshot`;
  const availabilityUrl = `${apiBase}/public/tenants/${tenantSlug}/availability?date=YYYY-MM-DD`;
  const bookingsUrl = `${apiBase}/public/tenants/${tenantSlug}/bookings`;
  const embedScript = `<script src="${embedOrigin}/embed.js" data-slug="${tenantSlug}" data-api="${apiBase}"></script>`;

  return `# ${tenantName} — Business Manager Website Connection

Give this file to your website developer. It documents **every public data type** Business Manager exposes for **${tenantName}**.

> **No Firebase. No API keys. No secrets.** Only the values below.

---

## Quick reference

| Variable | Value |
|----------|-------|
| Tenant slug | \`${tenantSlug}\` |
| API base URL | \`${apiBase}\` |
| Snapshot URL | \`${snapshotUrl}\` |

\`\`\`env
VITE_CRM_API_BASE_URL=${apiBase}
VITE_CRM_TENANT_SLUG=${tenantSlug}
\`\`\`

**Next.js:** use \`NEXT_PUBLIC_CRM_API_BASE_URL\` and \`NEXT_PUBLIC_CRM_TENANT_SLUG\`.

---

## Public API endpoints

| Method | URL | Purpose |
|--------|-----|---------|
| GET | \`${snapshotUrl}\` | All published content (menu, locations, reviews, business info) |
| GET | \`${availabilityUrl}\` | Booked time slots for a date |
| POST | \`${bookingsUrl}\` | Create a table reservation |

---

## Data provided (snapshot overview)

One \`GET /snapshot\` call returns **seven top-level sections**:

| Section | Use on your website |
|---------|---------------------|
| \`tenant\` | Brand name, slug, currency for prices |
| \`business\` | Company profile, hours, booking rules, logo, map fallback coords |
| \`products\` | Full menu / catalog (name, price, description, photos, category) |
| \`locations\` | Store branches for maps (address, GPS, phone, photos per branch) |
| \`testimonials\` | Customer reviews (author, quote, rating, optional photo) |
| \`content\` | Custom named groups (prices, FAQs, etc.) — keyed by API key |
| \`meta\` | Version, last update time, live vs publish source |

Only items with status **Published** in the CRM appear on the public API. **Draft** items require **Publish** in Business Manager first.

---

## Full snapshot example

\`\`\`json
{
  "tenant": {
    "name": "${tenantName}",
    "slug": "${tenantSlug}",
    "currency": "CAD"
  },
  "business": {
    "legalName": "Café Example",
    "tagline": "Neighbourhood bistro",
    "description": "Long description (French or primary language from CRM)",
    "email": "info@example.com",
    "phone": "(514) 555-0100",
    "websiteUrl": "https://example.com",
    "logoUrl": "https://storage.googleapis.com/.../logo.jpg",
    "address": {
      "street": "123 Main St",
      "city": "Montreal",
      "state": "QC",
      "postalCode": "H2X 1Y4",
      "country": "CA"
    },
    "social": {
      "facebook": "https://facebook.com/...",
      "instagram": "https://instagram.com/...",
      "linkedin": "",
      "twitter": ""
    },
    "hours": [
      { "day": "monday", "open": "09:00", "close": "17:00" },
      { "day": "tuesday", "open": null, "close": null }
    ],
    "bookingSettings": {
      "enabled": true,
      "slotMinutes": 30,
      "daysAhead": 28,
      "maxGuests": 30
    },
    "publicExtras": {
      "rating": 4.5,
      "reviewCount": 120,
      "priceRange": "$20–30",
      "coordinates": { "latitude": 45.5, "longitude": -73.6 },
      "amenities": ["outdoor", "vegetarian", "wifi"],
      "typeEn": "Breakfast restaurant",
      "typeFr": "Restaurant déjeuner",
      "descriptionEn": "English description override"
    }
  },
  "products": [
    {
      "id": "prod_abc123",
      "name": "Cappuccino",
      "description": "Espresso with steamed milk",
      "sku": "",
      "price": 5.5,
      "currency": "CAD",
      "category": "coffee",
      "sortOrder": 0,
      "status": "published",
      "images": [
        { "url": "https://storage.googleapis.com/.../photo.jpg", "alt": "", "order": 0 }
      ]
    }
  ],
  "locations": [
    {
      "id": "loc_xyz789",
      "name": "Downtown",
      "slug": "downtown",
      "address": {
        "street": "123 Main St",
        "city": "Montreal",
        "state": "QC",
        "postalCode": "H2X 1Y4",
        "country": "CA"
      },
      "coordinates": { "latitude": 45.5017, "longitude": -73.5673 },
      "phone": "(514) 555-0100",
      "hours": [],
      "images": [
        { "url": "https://storage.googleapis.com/.../terrace.jpg", "alt": "", "order": 0 }
      ],
      "primary": true,
      "sortOrder": 0,
      "status": "published"
    }
  ],
  "testimonials": [
    {
      "id": "test_def456",
      "author": "Marie L.",
      "quote": "Excellent brunch and friendly service.",
      "rating": 5,
      "photoUrl": "",
      "sortOrder": 0,
      "status": "published"
    }
  ],
  "content": {
    "prices": {
      "key": "prices",
      "label": "Price ranges",
      "description": "Optional collection description",
      "items": [
        {
          "id": "item_abc123",
          "title": "Brunch",
          "value": "$20–30",
          "description": "Weekend brunch menu",
          "imageUrl": "",
          "sortOrder": 0
        }
      ]
    }
  },
  "meta": {
    "source": "live",
    "version": 2,
    "publishedAt": "2026-06-09T12:00:00.000Z",
    "liveAt": "2026-06-09T12:05:00.000Z"
  }
}
\`\`\`

---

## Field reference — \`tenant\`

| Field | Type | Description |
|-------|------|-------------|
| \`name\` | string | Display name of the business |
| \`slug\` | string | URL-safe identifier (\`${tenantSlug}\`) |
| \`currency\` | string | ISO currency for all product prices (e.g. \`CAD\`, \`USD\`) |

---

## Field reference — \`business\`

| Field | Type | Description |
|-------|------|-------------|
| \`legalName\` | string | Official business name |
| \`tagline\` | string | Short subtitle / category line |
| \`description\` | string | Long description (primary language) |
| \`email\` | string | Contact email |
| \`phone\` | string | Main phone number |
| \`websiteUrl\` | string | Public website URL |
| \`logoUrl\` | string | Logo image URL (Firebase Storage / GCS) |
| \`address\` | object | Primary address (see below) |
| \`social\` | object | \`facebook\`, \`instagram\`, \`linkedin\`, \`twitter\` URLs |
| \`hours\` | array | Opening hours per weekday |
| \`bookingSettings\` | object | Online reservation configuration |
| \`publicExtras\` | object | Optional public metadata (ratings, amenities, i18n) |

**\`business.address\`**

| Field | Type |
|-------|------|
| \`street\` | string |
| \`city\` | string |
| \`state\` | string (province / state code) |
| \`postalCode\` | string |
| \`country\` | string (e.g. \`CA\`) |

**\`business.hours[]\`**

| Field | Type | Description |
|-------|------|-------------|
| \`day\` | string | \`monday\` … \`sunday\` |
| \`open\` | string \\| null | \`HH:mm\` (24h) or \`null\` if closed |
| \`close\` | string \\| null | \`HH:mm\` (24h) or \`null\` if closed |

**\`business.bookingSettings\`**

| Field | Type | Description |
|-------|------|-------------|
| \`enabled\` | boolean | Whether online booking is active |
| \`slotMinutes\` | number | Length of each reservation slot (e.g. 30) |
| \`daysAhead\` | number | How many days ahead guests can book |
| \`maxGuests\` | number | Maximum party size per booking |

**\`business.publicExtras\`** (custom keys — common examples)

| Field | Type | Description |
|-------|------|-------------|
| \`rating\` | number | Average rating (e.g. 4.2) |
| \`reviewCount\` | number | Total review count |
| \`priceRange\` | string | e.g. \`$20–30\` |
| \`coordinates\` | object | \`latitude\`, \`longitude\` for single-location map fallback |
| \`amenities\` | string[] | e.g. \`outdoor\`, \`vegetarian\`, \`wifi\` |
| \`typeEn\` / \`typeFr\` | string | Business type in English / French |
| \`descriptionEn\` | string | English description override |

---

## Field reference — \`products[]\`

Menu items, services, or catalog entries. Sorted by \`sortOrder\` in the CRM.

| Field | Type | Description |
|-------|------|-------------|
| \`id\` | string | Stable ID (e.g. \`prod_abc123\`) |
| \`name\` | string | Product name |
| \`description\` | string | Long description |
| \`sku\` | string | Optional SKU |
| \`price\` | number | Price in \`tenant.currency\` |
| \`currency\` | string | Usually matches tenant currency |
| \`category\` | string | Grouping key — e.g. \`coffee\`, \`savory\`, \`sweet\` |
| \`sortOrder\` | number | Display order within category |
| \`status\` | string | Always \`published\` on public API |
| \`images\` | array | Product photos (see below) |

**\`products[].images[]\`**

| Field | Type | Description |
|-------|------|-------------|
| \`url\` | string | Public HTTPS image URL |
| \`alt\` | string | Alt text (may be empty) |
| \`order\` | number | Sort order (0 = first) |

**Typical website usage:** group by \`category\`, sort by \`sortOrder\`, show \`images[0].url\` as the menu photo.

---

## Field reference — \`locations[]\`

Physical branches for maps, store finders, and location-specific galleries (e.g. different photos per city).

| Field | Type | Description |
|-------|------|-------------|
| \`id\` | string | Stable ID (e.g. \`loc_xyz789\`) |
| \`name\` | string | Branch name (e.g. "Outremont", "Downtown") |
| \`slug\` | string | URL slug for deep links |
| \`address\` | object | Same shape as \`business.address\` |
| \`coordinates\` | object | \`latitude\`, \`longitude\` for map pins |
| \`phone\` | string | Branch phone (may differ from main) |
| \`hours\` | array | Optional per-location hours (same shape as \`business.hours\`) |
| \`images\` | array | Venue photos (terrace, interior, hero) — same shape as product images |
| \`primary\` | boolean | \`true\` for the main / default location |
| \`sortOrder\` | number | Display order in location lists |
| \`status\` | string | Always \`published\` on public API |

**Map example:**

\`\`\`typescript
const { locations } = await fetchSnapshot();
const primary = locations.find((l) => l.primary) ?? locations[0];

locations.forEach((loc) => {
  addMarker(loc.coordinates.latitude, loc.coordinates.longitude, {
    title: loc.name,
    address: loc.address,
    images: loc.images,
  });
});
\`\`\`

Products are **chain-wide** (same menu at all branches). Location \`images\` are **branch-specific**.

---

## Field reference — \`testimonials[]\`

Customer reviews and quotes.

| Field | Type | Description |
|-------|------|-------------|
| \`id\` | string | Stable ID (e.g. \`test_def456\`) |
| \`author\` | string | Reviewer name |
| \`quote\` | string | Review text |
| \`rating\` | number | 1–5 star rating |
| \`photoUrl\` | string | Optional avatar URL (empty string if none) |
| \`sortOrder\` | number | Display order |
| \`status\` | string | Always \`published\` on public API |

---

## Field reference — \`content\`

Flexible **named collections** created in CRM under **Custom content**. The snapshot exposes them as an object keyed by \`key\` (e.g. \`prices\`, \`faqs\`, \`team\`).

**Access on your website:**

\`\`\`typescript
const { content } = await fetchSnapshot();
const prices = content.prices?.items ?? [];
prices.forEach((entry) => {
  console.log(entry.title, entry.value, entry.description, entry.imageUrl);
});
\`\`\`

**\`content.{key}\` collection**

| Field | Type | Description |
|-------|------|-------------|
| \`key\` | string | API key (same as object property name) |
| \`label\` | string | Display name in CRM |
| \`description\` | string | Optional collection description |
| \`items\` | array | Entries in this group (see below) |

**\`content.{key}.items[]\`**

| Field | Type | Description |
|-------|------|-------------|
| \`id\` | string | Stable item ID |
| \`title\` | string | Entry title / label |
| \`value\` | string | Short value (price, stat, badge text, etc.) |
| \`description\` | string | Longer text |
| \`imageUrl\` | string | Optional image URL |
| \`sortOrder\` | number | Display order |

---

## Field reference — \`meta\`

| Field | Type | Description |
|-------|------|-------------|
| \`source\` | string | \`live\` (reads current published Firestore) or \`publish\` (frozen snapshot) |
| \`version\` | number | Increments each time **Publish** is clicked in CRM |
| \`publishedAt\` | string | ISO timestamp of latest content update |
| \`liveAt\` | string | ISO timestamp when this response was built (live mode only) |

Use \`publishedAt\` or \`liveAt\` to detect changes and refresh your UI. Prefer \`cache: "no-store"\` on fetch.

---

## Availability API

**GET** \`${availabilityUrl}\`

Replace \`YYYY-MM-DD\` with the reservation date.

**Response:**

\`\`\`json
{
  "date": "2026-06-20",
  "bookedTimes": ["09:00", "10:30", "11:00"]
}
\`\`\`

| Field | Type | Description |
|-------|------|-------------|
| \`date\` | string | Requested date |
| \`bookedTimes\` | string[] | Already booked slots (\`HH:mm\`) — hide these from your picker |

Combine with \`business.bookingSettings\` (\`slotMinutes\`, \`daysAhead\`, \`maxGuests\`, \`enabled\`) to build a reservation UI.

---

## Bookings API

**POST** \`${bookingsUrl}\`

**Request body:**

\`\`\`json
{
  "customerName": "Alex",
  "customerPhone": "514-555-0199",
  "partySize": 4,
  "notes": "Window seat if possible",
  "date": "2026-06-20",
  "time": "11:00"
}
\`\`\`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| \`customerName\` | string | yes | Guest name |
| \`customerPhone\` | string | yes | Phone number |
| \`partySize\` | number | yes | 1–30 guests |
| \`notes\` | string | no | Special requests |
| \`date\` | string | yes | \`YYYY-MM-DD\` |
| \`time\` | string | yes | \`HH:mm\` (24h) |

**Response:** \`{ "id": "booking_..." }\` on success.

---

## Option 1 — Embed script (HTML / any site)

Paste before \`</body>\`:

\`\`\`html
${embedScript}
\`\`\`

\`\`\`javascript
const snapshot = await window.BusinessManager.fetchSnapshot();
// snapshot.tenant, .business, .products, .locations, .testimonials, .content, .meta

const availability = await window.BusinessManager.getAvailability("2026-06-15");

await window.BusinessManager.createBooking({
  customerName: "Guest name",
  customerPhone: "514-555-0100",
  partySize: 2,
  notes: "",
  date: "2026-06-15",
  time: "10:00",
});
\`\`\`

---

## Option 2 — REST API (React / Next.js / Vite)

\`\`\`typescript
const API_BASE = "${apiBase}";
const SLUG = "${tenantSlug}";

export async function fetchSnapshot() {
  const res = await fetch(
    \`\${API_BASE}/public/tenants/\${SLUG}/snapshot?_=\${Date.now()}\`,
    { cache: "no-store" },
  );
  if (!res.ok) throw new Error(\`Snapshot failed (\${res.status})\`);
  return res.json();
}
\`\`\`

---

## CORS (browser websites)

Register every origin where the site runs. In the CRM: **Business → Website domains (CORS)**, one per line:

\`\`\`
https://your-production-domain.com
http://localhost:5173
http://localhost:3000
\`\`\`

The **Website URL** on the business profile is also allowed automatically. Changes apply within about one minute.

---

## Publish vs live updates

| CRM action | Appears on website |
|------------|-------------------|
| Edit a **Published** product / location / testimonial / business | On next snapshot fetch (live mode) |
| Create or edit a **Draft** item | After clicking **Publish** in CRM |
| Upload product or location image | Immediately in \`images[]\` once published |
| Add **Custom content** collection | Appears at \`content.{key}\` once published |

---

## Verify connection

\`\`\`bash
curl "${snapshotUrl}"
\`\`\`

- \`404\` — nothing published yet; click **Publish** in CRM.
- Check \`products[].images\`, \`locations[]\`, and \`meta.publishedAt\` in the JSON.

**Browser check:** DevTools → Network → filter \`snapshot\` or your API host. On success, \`<html data-crm="loaded">\` (if your site sets it).

---

*Generated from Business Manager for tenant \`${tenantSlug}\`.*
`;
}
