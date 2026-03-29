export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  category: string;
  readingTime: number;
  content: string;
}

const posts: BlogPost[] = [
  {
    slug: "dhl-vs-fedex-vs-ups-comparison",
    title: "DHL vs. FedEx vs. UPS: Which Carrier Is Cheapest for International Shipping?",
    description:
      "DHL, FedEx, and UPS each dominate different regions and weight classes. Learn where each carrier wins on price, speed, and reliability — and how to choose the right one for your shipment.",
    publishedAt: "2024-10-10",
    updatedAt: "2025-01-15",
    category: "Carrier Comparison",
    readingTime: 7,
    content: `
<h2>The Big Three: Different Strengths for Different Routes</h2>
<p>DHL, FedEx, and UPS are the dominant players in international express shipping, but they are not interchangeable. Each carrier has built its network with different geographic strengths, and the cheapest option depends heavily on where you're shipping, how much it weighs, and how fast you need it there.</p>

<h2>DHL: The International Specialist</h2>
<p>DHL Express has the largest international footprint of the three, serving 220+ countries with direct operations (rather than agent partnerships) in most major markets. DHL is typically the <strong>strongest choice for shipments to Europe and Asia-Pacific</strong>.</p>
<ul>
  <li><strong>Europe</strong>: DHL's extensive European network often produces lower rates and faster transit times than FedEx or UPS</li>
  <li><strong>Asia-Pacific</strong>: Strong hub operations in Hong Kong, Singapore, and Seoul</li>
  <li><strong>Emerging markets</strong>: DHL has deeper operational presence in Africa, Middle East, and Southeast Asia</li>
  <li><strong>Document and small package</strong>: DHL's rates are highly competitive for packages under 10kg international</li>
</ul>
<p>DHL's dimensional weight divisor for international shipments is 5,000 cm³/kg (metric). Tracking is excellent, with granular milestone updates even in remote destinations.</p>

<h2>FedEx: Strong in Latin America and E-Commerce</h2>
<p>FedEx is the preferred carrier for <strong>US-Latin America routes</strong> (Mexico, Brazil, Colombia) and has invested heavily in e-commerce logistics infrastructure. Key strengths:</p>
<ul>
  <li><strong>Latin America</strong>: FedEx's hub in Memphis and Miami gives it strong reach into LATAM</li>
  <li><strong>TNT integration</strong>: FedEx's acquisition of TNT strengthened its European ground network</li>
  <li><strong>Large packages</strong>: FedEx One Rate and custom crating options handle oversized shipments well</li>
  <li><strong>Healthcare and cold chain</strong>: FedEx Custom Critical is a leader in temperature-sensitive freight</li>
</ul>

<h2>UPS: Dominant for US-Canada and US-Mexico</h2>
<p>UPS built its empire on ground delivery and remains the strongest carrier for <strong>US-Canada and US-Mexico cross-border shipments</strong>. USMCA trade flows play to UPS's strengths:</p>
<ul>
  <li><strong>Canada</strong>: UPS has the densest delivery network in Canadian markets</li>
  <li><strong>Mexico</strong>: UPS brokerage expertise handles IMMEX/maquiladora shipments well</li>
  <li><strong>Heavier freight</strong>: UPS Freight (now Freight via TForce) handles LTL and freight classes</li>
  <li><strong>B2B reliability</strong>: UPS consistently ranks high for on-time performance for commercial shipments</li>
</ul>

<h2>Transit Time Comparison (Sample Routes)</h2>
<table>
  <thead>
    <tr><th>Route</th><th>DHL Express</th><th>FedEx International Priority</th><th>UPS Worldwide Express</th></tr>
  </thead>
  <tbody>
    <tr><td>US → Germany</td><td>1–2 days</td><td>2–3 days</td><td>2–3 days</td></tr>
    <tr><td>US → Japan</td><td>1–2 days</td><td>2–3 days</td><td>2–3 days</td></tr>
    <tr><td>US → Brazil</td><td>2–3 days</td><td>2–3 days</td><td>3–4 days</td></tr>
    <tr><td>US → Canada</td><td>1–2 days</td><td>1–2 days</td><td>1 day (UPS Express)</td></tr>
  </tbody>
</table>

<h2>Dimensional Weight Policies</h2>
<p>All three carriers apply dimensional (DIM) weight pricing on international shipments. Light but bulky packages are charged based on volume, not actual weight. The formula is: <strong>L × W × H ÷ 5,000</strong> (cm, result in kg) for international shipments. Compare this to actual weight and you pay whichever is higher.</p>

<h2>Fuel Surcharges</h2>
<p>All carriers apply fuel surcharges that fluctuate weekly. These can add 15–30% to base rates in high oil-price environments. Always factor surcharges into cost comparisons — the published base rate is rarely the total rate. Use our <a href="/calculator/">shipping cost calculator</a> to get all-in estimates including current surcharges.</p>
`,
  },
  {
    slug: "dimensional-weight-explained",
    title: "Dimensional Weight: Why Your Package Costs More Than You Think",
    description:
      "Light but bulky packages are charged by volume, not actual weight. Learn the DIM weight formula, when it applies, and how to optimize your packaging to save significantly on shipping.",
    publishedAt: "2024-10-24",
    category: "Shipping Basics",
    readingTime: 5,
    content: `
<h2>What Is Dimensional Weight?</h2>
<p><strong>Dimensional weight</strong> (also called DIM weight or volumetric weight) is a pricing technique that accounts for the space a package occupies in a delivery vehicle — not just how heavy it is. Carriers introduced DIM weight because a large, light box takes up the same cargo space as a small, heavy one, but under actual-weight-only pricing, the light box would be far cheaper to ship.</p>
<p>The result: if you ship something like a bag of foam peanuts, a large empty frame, or a lightweight shoe box, you are almost certainly paying for more weight than your scale shows.</p>

<h2>The DIM Weight Formula</h2>
<p>The formula is straightforward:</p>
<p><strong>DIM Weight = (Length × Width × Height) ÷ DIM Divisor</strong></p>
<p>Dimensions are measured in inches (for US carriers using imperial) or centimeters (for international shipments). The divisor is set by each carrier:</p>
<table>
  <thead>
    <tr><th>Carrier</th><th>Domestic Divisor (inches)</th><th>International Divisor</th></tr>
  </thead>
  <tbody>
    <tr><td>UPS</td><td>139</td><td>139</td></tr>
    <tr><td>FedEx</td><td>139</td><td>139</td></tr>
    <tr><td>DHL (US domestic)</td><td>139</td><td>5,000 (cm³/kg)</td></tr>
    <tr><td>USPS Priority Mail</td><td>166</td><td>166</td></tr>
  </tbody>
</table>
<p>For UPS/FedEx domestic: DIM weight (lbs) = (L" × W" × H") ÷ 139</p>

<h2>When Does DIM Weight Apply?</h2>
<p>For UPS and FedEx, <strong>DIM weight always applies</strong> to all packages — the carrier charges whichever is greater: actual weight or DIM weight. There is no minimum size threshold.</p>
<p>For USPS, DIM weight only applies to Priority Mail and Priority Mail Express packages larger than 1 cubic foot (1,728 cubic inches).</p>

<h2>A Real Example</h2>
<p>You ship a package of lightweight holiday decorations:</p>
<ul>
  <li>Actual weight: <strong>3 lbs</strong></li>
  <li>Dimensions: 18" × 14" × 12"</li>
  <li>DIM weight: (18 × 14 × 12) ÷ 139 = 3,024 ÷ 139 = <strong>21.8 lbs → billed as 22 lbs</strong></li>
</ul>
<p>You're paying for 22 lbs instead of 3 lbs — more than 7× the rate you might have expected. On a UPS Ground rate, that difference could be $15–$40 more per package.</p>

<h2>How to Optimize Your Packaging</h2>
<p>Reducing box size is the single most effective way to cut DIM weight charges:</p>
<ol>
  <li><strong>Use the smallest appropriate box</strong> — leave just enough room for padding, nothing more</li>
  <li><strong>Use lightweight void fill</strong> — air pillows instead of foam peanuts save actual weight too</li>
  <li><strong>Custom packaging</strong> — if you ship high volumes of the same product, a custom box cut to exact dimensions can reduce DIM weight significantly</li>
  <li><strong>Flat-rate options</strong> — for heavy-for-size items, USPS Priority Mail Flat Rate boxes charge a flat fee regardless of weight (up to 70 lbs), potentially reversing the DIM weight penalty</li>
</ol>
<p>Even reducing a box from 18×14×12 to 16×12×10 drops DIM weight from 22 lbs to 14 lbs — an 8-lb savings per shipment that adds up quickly at volume. Use our <a href="/calculator/">shipping calculator</a> to compare rates for different package dimensions.</p>
`,
  },
  {
    slug: "international-shipping-incoterms",
    title: "Incoterms 2020 Explained: Who Pays for What in International Trade",
    description:
      "Incoterms define who pays for shipping, insurance, and customs at each stage of an international trade transaction. Learn the most common terms and how to choose the right one.",
    publishedAt: "2024-11-08",
    category: "Trade Terms",
    readingTime: 7,
    content: `
<h2>What Are Incoterms?</h2>
<p><strong>Incoterms</strong> (International Commercial Terms) are a set of 11 standardized trade terms published by the International Chamber of Commerce (ICC). They define the responsibilities of buyers and sellers for:</p>
<ul>
  <li>Who arranges and pays for transportation at each stage</li>
  <li>Who arranges and pays for insurance</li>
  <li>Who handles export and import customs clearance</li>
  <li>Where risk transfers from seller to buyer</li>
</ul>
<p>The current version, <strong>Incoterms 2020</strong>, was published in 2019 and took effect January 1, 2020. When you see "FOB Shanghai" or "DDP New York" in a trade contract, you're seeing Incoterms in use.</p>

<h2>The Most Commonly Used Incoterms</h2>

<h3>EXW — Ex Works (seller's premises)</h3>
<p>The buyer takes maximum responsibility. The seller makes the goods available at their facility and the buyer arranges everything: local pickup, export customs, freight, insurance, import customs, and last-mile delivery. <strong>EXW = maximum buyer responsibility.</strong></p>
<p>Used when: Buyer has a freight forwarder and wants full control over the shipment. Risky for inexperienced buyers because they're responsible for export clearance in the seller's country.</p>

<h3>FOB — Free On Board (named port of shipment)</h3>
<p>The seller delivers the goods at the named port of origin, cleared for export and loaded aboard the vessel. Risk transfers to the buyer once goods are on board the ship. The buyer pays ocean freight, insurance, import duties, and last-mile delivery.</p>
<p><strong>FOB is the most common Incoterm for ocean freight from Asia.</strong> Most factory invoices are quoted FOB because it clearly separates seller cost (get it to the port) from buyer cost (everything after).</p>

<h3>CIF — Cost, Insurance and Freight (named port of destination)</h3>
<p>The seller pays ocean freight and insurance to the destination port, but risk transfers at the origin port (same as FOB). The buyer handles import customs and delivery. This is a common "seller-friendly" term when buyers are less experienced, but note: <strong>the insurance the seller buys is minimum coverage</strong> (often just 110% of invoice value under Institute Cargo Clauses C).</p>

<h3>DDP — Delivered Duty Paid (named destination)</h3>
<p>The seller bears all costs and risks to deliver goods to the named destination, <strong>including import duties and taxes</strong>. The buyer just receives the goods. <strong>DDP = maximum seller responsibility.</strong></p>
<p><strong>DDP is increasingly required for e-commerce</strong>. Amazon's FBA (Fulfillment by Amazon) program requires DDP delivery to their warehouses. Many DTC brands selling internationally use DDP to give consumers a seamless experience without surprise customs bills at delivery.</p>

<h2>Incoterms 2020 — All 11 Terms at a Glance</h2>
<table>
  <thead>
    <tr><th>Term</th><th>Risk Transfer Point</th><th>Seller Pays</th><th>Buyer Pays</th></tr>
  </thead>
  <tbody>
    <tr><td>EXW</td><td>Seller's premises</td><td>Nothing after ready</td><td>Everything</td></tr>
    <tr><td>FCA</td><td>Named place, after export clearance</td><td>Export clearance</td><td>Main carriage + import</td></tr>
    <tr><td>CPT</td><td>First carrier</td><td>Export + main carriage</td><td>Insurance + import</td></tr>
    <tr><td>CIP</td><td>First carrier</td><td>Export + carriage + insurance</td><td>Import duties</td></tr>
    <tr><td>DAP</td><td>Destination (unloaded)</td><td>Export + carriage + insurance</td><td>Import duties + unloading</td></tr>
    <tr><td>DPU</td><td>Destination (after unloading)</td><td>Export + carriage + unloading</td><td>Import duties</td></tr>
    <tr><td>DDP</td><td>Destination (cleared)</td><td>Everything including import duties</td><td>Nothing</td></tr>
    <tr><td>FAS</td><td>Alongside vessel (origin port)</td><td>Export clearance</td><td>Loading + main carriage + import</td></tr>
    <tr><td>FOB</td><td>On board vessel (origin port)</td><td>Export clearance + loading</td><td>Main carriage + import</td></tr>
    <tr><td>CFR</td><td>On board vessel (origin port)</td><td>Export + main carriage</td><td>Insurance + import</td></tr>
    <tr><td>CIF</td><td>On board vessel (origin port)</td><td>Export + carriage + min insurance</td><td>Import duties + delivery</td></tr>
  </tbody>
</table>

<h2>Choosing the Right Incoterm</h2>
<p>The right Incoterm depends on your relationship with the counterparty, your logistics capabilities, and your risk tolerance. As a general rule: if you're an experienced importer with your own freight forwarder, FOB gives you cost control. If you want simplicity and are selling to consumers, DDP provides the best buyer experience.</p>
<p>Use our <a href="/calculator/">shipping cost calculator</a> to estimate freight costs under different Incoterm scenarios and <a href="/compare/">compare carriers</a> for your route.</p>
`,
  },
  {
    slug: "customs-clearance-guide",
    title: "International Customs Clearance: How to Avoid Delays and Extra Costs",
    description:
      "Customs delays can add days or weeks to shipping times and unexpected fees. Learn what causes holds, how to prepare documents correctly, and how customs works in major destination countries.",
    publishedAt: "2024-11-22",
    updatedAt: "2025-02-10",
    category: "Import/Export",
    readingTime: 7,
    content: `
<h2>What Customs Clearance Actually Involves</h2>
<p>When your package crosses an international border, it must be presented to the destination country's customs authority for review. The customs agency determines:</p>
<ul>
  <li>What the goods are (classification)</li>
  <li>Where they came from (country of origin)</li>
  <li>What they're worth (customs valuation)</li>
  <li>Whether they're permitted to enter (restricted/prohibited items)</li>
  <li>How much duty and tax is owed</li>
</ul>
<p>For most commercial shipments moving through established carriers (DHL, FedEx, UPS), clearance happens quickly — often within hours. Problems arise when documentation is incorrect, items are on restricted lists, or customs officers choose to examine the goods physically.</p>

<h2>What Customs Brokers Do and What They Cost</h2>
<p>A <strong>customs broker</strong> is a licensed professional who files import documentation on your behalf, pays duties, communicates with customs officers, and ensures compliance. Their fees vary by market and complexity:</p>
<ul>
  <li>US customs entry: $100–$200 per shipment</li>
  <li>EU import customs: €50–€150 per shipment</li>
  <li>Complex or high-value entries: $200–$500+</li>
</ul>
<p>For express small parcel shipments, DHL/FedEx/UPS typically handle customs brokerage automatically (for a fee, often 2–3% of shipment value). For larger freight shipments, you'll engage your own broker.</p>

<h2>Documentation That Must Be Correct</h2>
<p>The most common cause of customs delays is incorrect or inconsistent documentation. Key documents and what they must show:</p>
<h3>Commercial Invoice</h3>
<ul>
  <li>Full names and addresses of exporter and importer</li>
  <li>Accurate description of goods (not vague terms like "merchandise")</li>
  <li>HTS/HS codes where required</li>
  <li>Quantity and unit price</li>
  <li>Total value and currency</li>
  <li>Country of origin</li>
  <li>Terms of sale (Incoterm)</li>
</ul>
<p><strong>The commercial invoice and packing list must agree exactly.</strong> If the invoice says 100 units and the packing list says 98, customs will flag it for physical examination.</p>

<h2>De Minimis Thresholds by Country</h2>
<p>Most countries have a "de minimis" threshold below which shipments enter duty-free:</p>
<table>
  <thead>
    <tr><th>Country</th><th>De Minimis Threshold</th><th>Notes</th></tr>
  </thead>
  <tbody>
    <tr><td>United States</td><td>$800 USD</td><td>No duties on most goods; some Section 301 exclusions apply</td></tr>
    <tr><td>European Union</td><td>€150</td><td>VAT still applies below this threshold since July 2021</td></tr>
    <tr><td>United Kingdom</td><td>£135</td><td>VAT applies to all goods; duties only above £135</td></tr>
    <tr><td>Canada</td><td>CAD $20 (goods) / $60 (gifts)</td><td>Very low threshold; most commercial shipments pay duty</td></tr>
    <tr><td>Australia</td><td>AUD $1,000</td><td>GST applies on all imported goods since 2018</td></tr>
    <tr><td>Japan</td><td>¥10,000 (~$65)</td><td>Low threshold; most commercial goods pay customs duty</td></tr>
    <tr><td>Brazil</td><td>$50 USD (gifts only)</td><td>Very restrictive; most imports pay 60% import tax</td></tr>
  </tbody>
</table>

<h2>Common Reasons for Delays</h2>
<ul>
  <li><strong>Undervalued goods</strong>: Declaring $10 for goods clearly worth $200 triggers valuation disputes</li>
  <li><strong>Vague descriptions</strong>: "Parts" or "accessories" don't tell customs what the items actually are</li>
  <li><strong>Restricted items</strong>: Food, plants, electronics with encryption, and many other categories have import restrictions</li>
  <li><strong>Missing certificates</strong>: CE marking (EU), FDA prior notice (US food), safety certificates</li>
  <li><strong>Value inconsistency</strong>: Invoice value doesn't match declared value on the air waybill</li>
  <li><strong>Random physical examination</strong>: CBP examines roughly 3–5% of US imports physically; no way to prevent this</li>
</ul>

<h2>How to Calculate Duties at Destination</h2>
<p>For most countries: <strong>Total landed cost = CIF value × (1 + duty rate) × (1 + VAT rate)</strong>. For example, shipping $500 of goods to Germany (EU):</p>
<ul>
  <li>CIF value: $500</li>
  <li>EU customs duty (example, electronics): 0%</li>
  <li>German VAT: 19%</li>
  <li>Total: $500 × 1.0 × 1.19 = $595 — recipient pays €95 VAT on delivery</li>
</ul>
<p>Use our <a href="/compare/">carrier comparison</a> and <a href="/calculator/">shipping calculator</a> to estimate total cross-border costs before shipping.</p>
`,
  },
  {
    slug: "cheapest-ways-ship-large-items",
    title: "Cheapest Ways to Ship Large or Heavy Items",
    description:
      "Shipping large or heavy items by express carrier can be shockingly expensive. Learn when to use LTL freight, ocean shipping, and freight brokers to cut costs dramatically.",
    publishedAt: "2024-12-05",
    category: "Shipping Tips",
    readingTime: 6,
    content: `
<h2>When Express Carriers Become Prohibitively Expensive</h2>
<p>Standard express carriers (UPS, FedEx, DHL) are optimized for packages under 150 lbs. Once you exceed that weight — or have packages with high dimensional weight — costs escalate sharply. A 200 lb pallet shipped cross-country via FedEx Express can cost $500–$1,000+. The same pallet via LTL freight might cost $100–$200.</p>
<p>Knowing when to switch from parcel to freight is one of the most impactful cost decisions in shipping.</p>

<h2>LTL Freight: The Sweet Spot for 150–10,000 lbs</h2>
<p><strong>LTL (Less-Than-Truckload)</strong> freight is used when your shipment is too large for parcel carriers but not large enough to fill an entire truck. Your goods share trailer space with other shippers' freight, and you pay only for the space you use.</p>
<h3>How LTL Pricing Works</h3>
<p>LTL pricing is based on:</p>
<ul>
  <li><strong>Freight class</strong> (NMFC class): A standardized classification system (classes 50–500) based on density, stowability, handling ease, and liability. Denser, durable goods (class 50–70) are cheapest. Light, fragile, or hazardous goods (class 100+) are more expensive.</li>
  <li><strong>Weight</strong>: Heavier within a class is cheaper per pound</li>
  <li><strong>Distance (lanes)</strong>: Short haul vs. long haul pricing</li>
  <li><strong>Accessorial charges</strong>: Liftgate pickup/delivery, residential delivery, limited access — these add up fast</li>
</ul>

<h3>Getting LTL Quotes</h3>
<p>Use freight broker platforms to get quotes from multiple carriers simultaneously:</p>
<ul>
  <li><strong>FreightQuote</strong> (by C.H. Robinson) — strong carrier network for US domestic</li>
  <li><strong>uShip</strong> — marketplace for freight and oversized loads, good for non-standard items</li>
  <li><strong>Freightos</strong> — international air and ocean freight with instant quoting</li>
  <li><strong>Echo Global Logistics, Coyote</strong> — broker platforms with volume discounts</li>
</ul>
<p>Always get 3+ quotes. LTL rates vary enormously between carriers for the same lane.</p>

<h2>Palletizing Your Shipment</h2>
<p>LTL shipments should be palletized (stacked on a 48"×40" standard pallet and shrink-wrapped) for protection and handling efficiency. Carriers charge more for loose pieces. Proper palletizing also reduces damage claims.</p>
<p>A single pallet can typically hold 1,000–2,500 lbs depending on the freight class and stacking height. Pallets can be stacked in some cases — consult your carrier.</p>

<h2>International Shipping: FCL vs. LCL vs. Air</h2>
<p>For international shipments, the choice of mode has massive cost implications:</p>
<table>
  <thead>
    <tr><th>Mode</th><th>Best For</th><th>Transit Time (Asia→US)</th><th>Relative Cost</th></tr>
  </thead>
  <tbody>
    <tr><td>Air express (DHL/FedEx/UPS)</td><td>Up to 50 kg, urgent</td><td>1–3 days</td><td>Very High ($7–$15/kg)</td></tr>
    <tr><td>Air freight (general cargo)</td><td>50–200 kg, semi-urgent</td><td>3–5 days</td><td>High ($3–$7/kg)</td></tr>
    <tr><td>LCL ocean (Less than Container)</td><td>0.5–10 CBM</td><td>25–45 days</td><td>Low ($100–$200/CBM)</td></tr>
    <tr><td>FCL ocean (Full Container)</td><td>10+ CBM, 20'–40' container</td><td>20–40 days</td><td>Very Low (per container)</td></tr>
  </tbody>
</table>
<p><strong>The general rule of thumb: once your shipment exceeds 200 kg (440 lbs) or 1 CBM (35 cubic feet), ocean freight usually beats air freight on cost</strong> — sometimes by 80–90% for the same goods.</p>

<h2>LCL vs. FCL: Which Is Right?</h2>
<p><strong>LCL (Less than Container Load)</strong> works like LTL — your goods share container space with other shippers'. You pay for the cubic meters (CBM) you use. LCL adds consolidation and deconsolidation handling time (5–10 days each end) but costs much less than FCL for small loads.</p>
<p><strong>FCL (Full Container Load)</strong> becomes cost-effective typically above 10–15 CBM. You get an entire 20' container (about 25 CBM, 20,000 kg limit) or 40' container (about 60 CBM). A 20' FCL from Shanghai to Los Angeles typically costs $1,500–$3,500 depending on the market — a fraction of what air freight would cost for the same volume.</p>
<p>Use our <a href="/calculator/">shipping cost calculator</a> to compare express, air freight, and ocean freight costs for your shipment dimensions and destination.</p>
`,
  },
];

export function getAllPosts(): BlogPost[] {
  return posts;
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}

export function getAllCategories(): string[] {
  return [...new Set(posts.map((p) => p.category))];
}
