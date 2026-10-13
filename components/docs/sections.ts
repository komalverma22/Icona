export interface DocSection {
  id: string;
  title: string;
  group: string;
}

/** Order here is the order on the page, and the order of the flight rail. */
export const DOC_SECTIONS: readonly DocSection[] = [
  { id: "introduction", title: "Introduction", group: "Getting started" },
  { id: "quick-start", title: "Quick start", group: "Getting started" },
  { id: "installation", title: "Installation", group: "Getting started" },
  { id: "usage", title: "Using an icon", group: "Using icons" },
  { id: "animations", title: "Animations", group: "Using icons" },
  { id: "customize", title: "Customize", group: "Using icons" },
  { id: "exports", title: "Export formats", group: "Exporting" },
  { id: "pixel-art", title: "Pixel art", group: "Exporting" },
  { id: "accessibility", title: "Accessibility", group: "Reference" },
  { id: "limits", title: "Good to know", group: "Reference" },
];
