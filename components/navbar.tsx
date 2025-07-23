type NavbarProps = {
  onHamburgerClick: () => void;
  onAddCourseClick: () => void; // 👈 New prop
};

export default function Navbar({
  onHamburgerClick,
  onAddCourseClick,
}: NavbarProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white shadow">
      {/* Hamburger */}
      <div
        className="cursor-pointer text-2xl"
        onClick={onHamburgerClick}
      >
        ☰
      </div>

      {/* App Name */}
      <h1 className="text-xl font-bold">TrackAttendance</h1>

      {/* Actions */}
      <div className="flex items-center space-x-4">
        <div
          className="bg-blue-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-600 transition"
          onClick={onAddCourseClick} // 👈 Trigger modal
        >
          Add Course
        </div>
        <div className="bg-red-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-red-600 transition">
          Logout
        </div>
      </div>
    </div>
  );
}
