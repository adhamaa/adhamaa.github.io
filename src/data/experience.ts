export type Role = {
  id: string;
  title: string;
  company: string;
  location: string;
  period: string;
  /** One line on what the job actually was. */
  summary: string;
  points: string[];
  stack: string[];
  current?: boolean;
};

export const experience: Role[] = [
  {
    id: "01",
    title: "Application Engineer / Full-Stack Engineer",
    company: "Shinkels Technik Sdn Bhd",
    location: "Johor Bahru, Malaysia",
    period: "Jul 2022 — Aug 2026",
    summary:
      "Led frontend architecture and wrote the services behind it, across several client-facing web applications.",
    points: [
      "Architected reusable React component libraries shared across multiple projects, cutting the time to stand up a new screen from days to hours.",
      "Designed and shipped backend services in Node.js and Express — REST and GraphQL endpoints covering authentication, authorization and integration with both SQL and NoSQL stores.",
      "Built Python Flask APIs for services better suited to the Python ecosystem, and kept their contracts consistent with the Node side.",
      "Owned application state strategy (Redux, Context API, React Router) for maintainable single-page apps that stayed fast as they grew.",
      "Translated UX wireframes into responsive, cross-browser interfaces that behaved consistently on desktop and mobile.",
      "Ran CI/CD and release operations (Git, PM2, Docker, Linux) so deployments were routine rather than events.",
      "Adopted AI pair-programming into the daily workflow without leaning on it — generated code was a first draft I read line by line, corrected to our standards and optimised before it ever reached review.",
      "Set coding standards, led code reviews and mentored junior developers.",
    ],
    stack: [
      "React",
      "TypeScript",
      "Next.js",
      "Node.js",
      "Express",
      "GraphQL",
      "Python",
      "Flask",
      "PostgreSQL",
      "MongoDB",
      "Docker",
    ],
  },
  {
    id: "02",
    title: "Software Developer",
    company: "Rhingle Sdn Bhd",
    location: "Kuala Lumpur, Malaysia",
    period: "Jul 2021 — Jul 2022",
    summary:
      "Feature and maintenance work on production web applications inside a cross-functional team.",
    points: [
      "Diagnosed and fixed defects before release, reducing the number that reached production.",
      "Refactored slow and brittle code paths, improving both runtime performance and the team's ability to change them.",
      "Delivered features against tight deadlines alongside design and QA.",
    ],
    stack: ["JavaScript", "React", "Node.js", "SQL", "Git"],
  },
  {
    id: "03",
    title: "Freelance Web Developer",
    company: "Self-employed",
    location: "Batu Pahat, Malaysia",
    period: "Sep 2019 — Dec 2021",
    summary:
      "Direct client work: design through build through launch, mostly for small businesses.",
    points: [
      "Designed and shipped marketing sites and storefronts end to end, from Figma and Adobe XD mockups to a live domain.",
      "Built static sites with Gatsby and Jekyll, and content-managed sites on headless CMSs including Strapi, Netlify CMS and headless WordPress.",
      "Set up e-commerce on Shopify and EasyStore, including theme work in Liquid.",
      "Designed and built the original certificate issuing system for a training programme in Excel — logo, certificate template and the issuing logic — which I later rebuilt as the QHP web registry.",
      "Handled the client relationship directly — scope, expectations, revisions and handover.",
    ],
    stack: ["React", "Gatsby", "JavaScript", "HTML", "CSS", "Shopify", "Strapi"],
  },
];

export const education = [
  {
    title: "JavaScript Algorithms & Data Structures",
    org: "freeCodeCamp",
    year: "2020",
  },
  {
    title: "Responsive Web Design",
    org: "freeCodeCamp",
    year: "2019",
  },
  {
    title: "Degree, Islamic Studies with Management",
    org: "Open University Malaysia",
    year: "2017",
  },
  {
    title: "Diploma, Quran wal Qiraat",
    org: "Kolej Universiti Islam Johor Sultan Ibrahim",
    year: "2013",
  },
];

export const languages = ["English", "Malay"];
