import { useRouter } from "next/navigation";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

const navItems = [
  { label: "Dashboard", icon: "🏠", href: "/dashboard", type: "link" },
  { label: "Quick Attendance", icon: "✅", href: "/dashboard/QuickAttendance", type: "quick" },
  { label: "Search Attendance", icon: "🔍", href: "/dashboard/searchAttendance", type: "search" },
  { label: "Dark Mode", icon: "🌙", href: "#" },
  { label: "About Us", icon: "ℹ️", href: "#" },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const router = useRouter();
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-10"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed z-20 left-0 top-0 h-screen w-64 bg-white shadow-xl border-r border-gray-200 flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo/App Name */}
        <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100">
          <span className="text-2xl">🌐</span>
          <span className="text-xl font-bold text-blue-700 tracking-tight">TrackAttendance</span>
          <button
            className="ml-auto text-gray-400 hover:text-red-500 text-lg focus:outline-none"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navItems.map((item) =>
            item.type === "quick" || item.type === "search" ? (
              <button
                key={item.label}
                className="flex w-full items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-blue-100 hover:text-blue-700 font-medium transition group"
                onClick={() => {
                  router.push(item.href);
                  onClose();
                }}
                tabIndex={0}
                type="button"
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ) : (
              <a
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-blue-100 hover:text-blue-700 font-medium transition group"
                tabIndex={0}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </a>
            )
          )}
        </nav>

        {/* Divider */}
        <div className="border-t border-gray-100 my-2"></div>

        {/* Logout at bottom */}
        <div className="px-6 py-4">
          <button className="w-full flex items-center justify-center gap-2 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition font-semibold shadow">
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>
    </>
  );
}
