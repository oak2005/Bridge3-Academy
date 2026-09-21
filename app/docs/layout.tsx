import { DocsSidebar } from "@/components/docs/DocsSidebar";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto flex max-w-7xl flex-col md:flex-row">
        {/* Responsive Sticky Sidebar */}
        <DocsSidebar />

        {/* Main Content Area */}
        <div className="flex-1 min-w-0 px-4 py-8 sm:px-8 sm:py-12 lg:px-12">
          {children}
        </div>
      </div>
    </div>
  );
}
