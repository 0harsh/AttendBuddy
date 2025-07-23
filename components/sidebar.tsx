type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
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
      <div
        className={`fixed z-20 top-0 left-0 h-full w-64 bg-white shadow-lg p-6 space-y-4 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div
          className="text-gray-800 font-semibold cursor-pointer mb-4"
          onClick={onClose}
        >
          ✕ Close
        </div>

        <div className="cursor-pointer hover:text-blue-600">✅ Log Attendance</div>
        <div className="cursor-pointer hover:text-blue-600">🔍 Search Attendance</div>
        <div className="cursor-pointer hover:text-blue-600">🌙 Dark Mode</div>
        <div className="cursor-pointer hover:text-blue-600">ℹ️ About Us</div>
      </div>
    </>
  );
}
