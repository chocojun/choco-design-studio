export type Work = {
  title: string;
  year: string;
  medium: string;
  description: string;
  code: string;
};

export const works: Work[] = [
  {
    title: "Index of Synthetic Garments",
    year: "2026",
    medium: "AI fashion study, still image sequence",
    description:
      "A restrained archive of generated garments, treated as research notes rather than campaign imagery.",
    code: "W-001",
  },
  {
    title: "Face / Fabric / Error",
    year: "2025",
    medium: "Video loop, browser demo",
    description:
      "A study of identity transfer, garment memory, and the quiet artifacts left by machine vision systems.",
    code: "W-002",
  },
  {
    title: "White Room Fitting",
    year: "2025",
    medium: "Interactive prototype",
    description:
      "A minimal try-on interface where the UI is reduced to the tension between body, surface, and choice.",
    code: "W-003",
  },
  {
    title: "Lookbook for Absent Models",
    year: "2024",
    medium: "Digital lookbook",
    description:
      "Garments presented as evidence: flat, catalogued, and suspended between fashion image and dataset.",
    code: "W-004",
  },
];
