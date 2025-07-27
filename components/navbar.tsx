import { useRouter } from "next/navigation";

type NavbarProps = {
  onHamburgerClick: () => void;
  onAddCourseClick: () => void;
};

export default function Navbar({
  onHamburgerClick,
  onAddCourseClick,
}: NavbarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        // Redirect to login page
        router.push("/");
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white/95 backdrop-blur-sm shadow-modern border-b border-gray-100">
      {/* Hamburger */}
      <div
        className="cursor-pointer text-2xl hover:scale-110 transition-transform duration-200 p-2 rounded-lg hover:bg-gray-100"
        onClick={onHamburgerClick}
      >
        ☰
      </div>

      {/* App Name */}
      <div className="flex items-center gap-3">
        <div className="text-2xl">🎓</div>
        <h1 className="text-2xl font-bold text-gradient">
          AttendBuddy
        </h1>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-3">
        <button
          className="btn-primary px-4 py-2 text-sm"
          onClick={onAddCourseClick}
        >
          ➕ Add Course
        </button>
        <button 
          onClick={handleLogout}
          className="btn-danger px-4 py-2 text-sm"
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
}
