import MainLayout from "layouts/MainLayout";
import PublicLayout from "layouts/PublicLayout";

// Default layout used in LayoutComponent when a layout is not specified
const defaultLayout = MainLayout;

// Dev Note: Types in TypeScript are weird and must be directly exported. Otherwise, the compiler gets confused
/** This interface exists to register the layouts to the LayoutComponent without having to constantly modify framework code */
export type ProjectLayouts = typeof MainLayout | typeof PublicLayout;
export { defaultLayout };