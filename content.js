// =========================================================
// CONTENT — case-study cards
// ---------------------------------------------------------
// Fill in your projects here. The Work cards and the
// case-study page (case-study.html) are both built from this
// list. Add or remove { … } blocks to change the number of cards.
//
// slug     short name used in the link: case-study.html?project=slug
// title    the project's name: the card's title
// company  who it was for: the card's first chip, with a briefcase
// type     1–2 words on the kind of product: the card's other chips
// color    the project's brand colour; the card gets a soft tint of it
//          (leave "" to use tint 1/2/3 instead: lilac, mint, butter)
// tags     2–3 tags for the case-study page; put your role here, e.g. "UX Designer"
// href   optional: link to a finished case-study page instead of the
//        template (e.g. "primetrack.html")
// =========================================================

window.PROJECTS = [
  {
    slug: "primetrack",
    title: "PrimeTrack",
    company: "47Billion",
    type: ["SaaS", "B2B platform"],
    outcome: "Three tools became one platform that every team now uses daily.",
    tags: ["Product design", "B2B SaaS", "Internal platform"],
    color: "#7987FF",
    image: "images/primetrack.webp",
    alt: "PrimeTrack dashboard: overview cards for organisations, licenses, tickets and invoices, ticket and invoice charts, revenue and license trends, and an organisations table.",
    href: "primetrack.html"                    // the finished case study
  },
  {
    slug: "tellora",
    title: "Tellora",
    company: "UK EdTech startup",
    type: ["EdTech", "Children's web app"],
    outcome: "Redesigning story creation for children who are still learning to read.",
    tags: ["Product design", "EdTech", "Story creation"],
    color: "",
    tint: 2,
    image: "images/tellora-student-cover-locked.webp",   // a blurred screen, so the card shows nothing private (design-briefs/tellora-cover-locked.html)
    locked: true,                              // the published page asks for a password (site-tools/publish.ps1)
    alt: "A blurred Tellora screen behind a lock, with the words Password protected.",
    href: "tellora.html"                       // the case study (placeholder text for now)
  },
  {
    slug: "tellora-teacher-portal",
    title: "Tellora Teacher Portal",
    company: "UK EdTech startup",
    type: ["EdTech", "Teacher portal"],
    outcome: "Turning children's storybooks into progress teachers can see.",
    tags: ["Product design", "EdTech", "Teacher platform"],
    color: "",
    tint: 3,
    image: "images/tellora-teacher-dashboard.webp",
    alt: "The Tellora teacher dashboard: A greeting for Ms Smith, cards for classes 4B and 4A, a Pending Review panel with 5 books to review and a Review Now button, a table of assignments, and a side column with Recent Activity, Notifications and Quick Actions.",
    href: "tellora-teacher-portal.html"        // the finished case study
  }
];
