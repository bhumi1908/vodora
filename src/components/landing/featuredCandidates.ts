export const featuredCandidates = [
  {
    id: "1",
    name: "Sarah Johnson",
    title: "Senior Software Engineer",
    location: "San Francisco, CA",
    company: "Tech Corp",
    avatar: "SJ",
    references: 8,
  },
  {
    id: "2",
    name: "Michael Chen",
    title: "Product Manager",
    location: "New York, NY",
    company: "Innovation Labs",
    avatar: "MC",
    references: 12,
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    title: "UX Designer",
    location: "Austin, TX",
    company: "Design Studio",
    avatar: "ER",
    references: 6,
  },
  {
    id: "4",
    name: "David Kim",
    title: "Data Scientist",
    location: "Seattle, WA",
    company: "Analytics Pro",
    avatar: "DK",
    references: 10,
  },
] as const;

export type FeaturedCandidate = (typeof featuredCandidates)[number];
