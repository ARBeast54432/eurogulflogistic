export const SITE = {
  name: "Euro Gulf Logistics",
  tagline: "Heavy Equipment. Handled Right. Every Time.",
  address:
    "Sajaa industrial area, Al Sajaa st, right opposite to Niaz Ahmed building materials",
  email: "contact@eurogulfllc.com",
  phones: ["+971 52 968 8851", "+971 50 637 0557", "+971 56 709 8352"],
  whatsapp: ["+971 52 968 8851", "+971 50 637 0557", "+971 56 709 8352"],
  hours: [
    { days: "Monday – Friday", time: "06:00 – 19:00" },
    { days: "Saturday", time: "07:00 – 15:00" },
    { days: "Sunday", time: "Emergency dispatch only" },
  ],
  mapEmbed:
    "https://www.google.com/maps?q=Al+Sajaa+Industrial+Area+Sharjah+UAE&output=embed",
} as const;

export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;
export const waHref = (phone: string, message?: string) =>
  `https://wa.me/${phone.replace(/[^\d]/g, "")}${
    message ? `?text=${encodeURIComponent(message)}` : ""
  }`;

export const STATS = [
  { value: 10, suffix: "+", label: "Years Experience" },
  { value: 650, suffix: "+", label: "Projects Completed" },
  { value: 35, suffix: "+", label: "Countries Served" },
  { value: 99, suffix: "%", label: "On-Time Delivery" },
] as const;

export const SITE_TYPES = [
  "Port / Terminal",
  "Factory / Plant",
  "Construction Site",
  "Other",
] as const;

export const FAQS = [
  {
    q: "How far in advance do I need to book equipment?",
    a: "For standard trailer and crane hire, 48–72 hours is usually enough. For 300-ton-plus lifts, route surveys or permit-dependent moves, we recommend two weeks so engineering and escorts can be locked in. Emergency mobilisations are handled through our 24/7 dispatch line.",
  },
  {
    q: "Do you provide on-site inspections before a quote is issued?",
    a: "Yes. For any lift or dismantling scope we send a supervisor or rigging engineer to walk the site, confirm ground bearing, access and clearances, then issue a fixed quote against a documented method statement.",
  },
  {
    q: "Are your operators and riggers certified?",
    a: "Every operator, rigger and banksman on our roster holds current third-party certification, and all lifts run against an approved lift plan with a designated appointed person.",
  },
  {
    q: "Is insurance included in the rental rate?",
    a: "Full third-party liability and equipment coverage is included on every job. Certificates of insurance are issued with the mobilisation pack, and additional insured endorsements are available on request.",
  },
  {
    q: "Can you handle cross-border and multi-modal moves?",
    a: "Yes. We coordinate road, rail and sea legs including lashing and securing plans, customs documentation, escort vehicles and route permits across 35+ countries.",
  },
  {
    q: "What happens after I submit a quote request?",
    a: "Your request lands directly with dispatch. You get a written response within 15 minutes during business hours, including indicative pricing, equipment availability and next steps.",
  },
  {
    q: "Do you offer long-term contract hire?",
    a: "We run monthly and annual contract hire with dedicated units, on-site maintenance and priority replacement for plant, port and EPC clients.",
  },
] as const;

export const TESTIMONIALS = [
  {
    name: "Marcus Webb",
    role: "Project Director, Delta Point EPC Contractors",
    scope: "400-ton crane mobilization for refinery turnaround, 3-week engagement",
    quote:
      "We had an eleven-day turnaround window and zero margin for a late crane. Euro Gulf had the unit on site a day early with a full rigging plan already reviewed by our safety team. That kind of preparation is rare in this industry.",
  },
  {
    name: "Priya Nandakumar",
    role: "Plant Operations Manager, Coastal Steel Fabrication",
    scope: "Full production line dismantling and relocation across two facilities",
    quote:
      "Dismantling and re-assembling a production line without extending our downtime budget felt impossible until we brought Euro Gulf in. Their crew documented every connection point before disassembly, which made reinstallation almost plug-and-play.",
  },
  {
    name: "Diego Ferreira",
    role: "Port Logistics Coordinator, Bayline Container Terminal",
    scope: "Ongoing container storage and yard handling contract, ports operations",
    quote:
      "We manage tight vessel windows and can't have handling delays stack up. Euro Gulf's yard team communicates constantly, and their container tracking is the most reliable we've worked with among our third-party partners.",
  },
  {
    name: "Sarah Kowalski",
    role: "Heavy Construction Lead, Northridge Infrastructure Group",
    scope: "Multi-trailer heavy haul for bridge segment delivery, interstate route",
    quote:
      "Moving oversized bridge segments means permits, escort coordination, and route surveys all have to line up perfectly. Euro Gulf handled the entire logistics chain and every delivery hit its scheduled window.",
  },
  {
    name: "Anthony Reyes",
    role: "Site Superintendent, Ferrovia Industrial Contractors",
    scope: "Rigging and precision installation of industrial press equipment",
    quote:
      "Positioning a multi-ton press within millimeter tolerances isn't something you trust to just anyone. Euro Gulf's rigging crew treated it like their own equipment — methodical, patient, and genuinely skilled.",
  },
] as const;

export const IMAGES = {
  hero: "https://lh3.googleusercontent.com/aida-public/AB6AXuCsLQtEUPs9RrvNwMl9x6Zn3jywPzmbSmkg7Iul8dAFq4oH400rtDBIw7p5C8JllciGvsC2TRmUTi7uvVDIfV_6Y30Pd3-fv7lQsd5znHbUGkTCpnYxa7U9t9TXa1t11LW9PfMvkjC6fiVm-FqP08dDFMXk7OfNGPUixapQG-7pRBxqGER4kb09523K6IDJTOgEF3JlIyhlUXqKW2lWvYG_EOPwxZH6vKR9dGS5D8KxpFKOV8Kp_Z0yTQ",
  haulage:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuApM9pzWfEbo1kl4yo621wrLNTwq9LgA3ARQwbzMvpCnuNxayZd6-TC515G5t8Gc8TQwTp0InCAHQ-0Gtq6W8INLaTr-cOUhCtyhd04qfB_hE_lHKisqU1Tmtum3TAlzE7n1q9hARRE3nXJNC2sOy9aaHebfsSOkhxB-_j6MoHJJBp3muVK3AFYtT07DI6hpiXjnJWS8ttvJ7MXBRwP5r1sWlZJAwhjdkoNQdihOTsqfijRS4Jb3krH3Q",
  yard: "https://lh3.googleusercontent.com/aida-public/AB6AXuBB1BOASEUlLlMAdnXW6waJIeYKkehfZfUJr-6vR3GRvAFPqc536fDk4SDHC-dLn5muaZroFETX1PNansIyDr2ovSoS6y6fo_9AvJ-D9Da8SViCjD73uj9yHegghzb04VTyKNhRbBDLJxqkKO5XYabFAaTT-Ki3VtjEq-8fbRgxlUH_Fr_yoe9yzLq8SB6BkCZS8iAsxCR76KDA6ROV2Qml1J_OyBInkdD5eor-EssCPTuuqSP047g1XA",
  rigging:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBjTCIK_eA4ZEd5GMPC7kYpIZvQ-brKmMuR3CDQgXxKF-H3wnJg6dKrDwYdGOEBkBzmIxGAY--BZWyHYQsVjWdv4P7oBs2bQ_eLJkTOrK7HbLD8KvMyO3OOWhLaUAiJdWcuEXqek_6k4ROu4SvptYvTQk4aaFxq1UqHc5CHNUPMeGmIN9PEIPsIbRfBaXymAzSw5q0dQoVG6c7DkZUdeT_G9VWC3hHL51Ggtblpvb8oVVh9q8NDzdaITg",
  assembly:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuA7awRAEvEXn_Q60qeuSDI8oJfa4AlLTOFn8uAfYKZQkETRaEws5m3WAla6atiBTmYXxfTtSquf33saOcN5xuNcMyIidFz5_3nWnn3RvhPwsd9VF-Z8gYdlR5wHhH2S27RPxIpq4kAl97R7ijb3VnjzjXSlzJq12N-sPlecazRTYINRO4uqgbNPx2fJI-QyDQT3jwrJOqXc_M0uIhKHtZ8W3XefUvis8h8gUL_sZkOVQViuaNrCHc0o0g",
  dismantling:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBXjtqExIWks3K8qBRy2AJE25rqNgwB-7W-h7SG6g35pi8E-vX9jUcJmlaM01MW3n_pDF_gUfBuuKwkmdtzmmJAicXGvI2uaQIseyb6pGPoTlcm5U32DLQPRBifeSAl3cEQuPuKL3NExA76QkLcypUnLruLrFYFHaFVxTIEQqdKjxD7P5fOfmAXCZ4w7ymVnw1ggd9ySf-61WB1ANBNGJnIsutKR9IOSCfAGfOmNMUwvmfpgrkqSyrqSw",
  fleet:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCW56mNltQ_zsYcO-XEOGaZ1JTgWKxMiJBFAhUC5psSiALUKdXl6HjziOy4gzxRJ4hxv6I2LDMowyDZsZPtwAhJoxsXIr9-GV5Y23c8hBs440YUBzkJyanXrlMnOLHyebXeanUKFG5o5j1e4D6-_Q7nELwGOln8MfnOJX5Yq_sG7qwkABAmWljYgiPJFi4iYiEZcqw2lV4DCS6LtHmm-lNezXOgrG0tLJL1XH7slbrHWpy4rV7ytIiqdw",
} as const;

export const LOCAL_BUSINESS_JSONLD = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: SITE.name,
  image: IMAGES.hero,
  url: "https://www.eurogulflogistics.com",
  telephone: SITE.phones[0],
  priceRange: "$$$",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Sajaa industrial area, Al Sajaa st",
    addressLocality: "Sharjah",
    addressRegion: "Sharjah",
    addressCountry: "AE",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "06:00",
      closes: "19:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Saturday"],
      opens: "07:00",
      closes: "15:00",
    },
  ],
  areaServed: "Worldwide",
  makesOffer: [
    "Truck & Trailer Rental",
    "Heavy Equipment & Crane Rental",
    "Container Storage & Handling",
    "Heavy Machinery Dismantling",
    "Machinery Assembling & Installation",
    "Industrial Lashing, Rigging & Loading",
    "Site Safety Services",
    "Space / Yard Rental",
    "Denting & Painting",
  ].map((name) => ({
    "@type": "Offer",
    itemOffered: { "@type": "Service", name },
  })),
};
