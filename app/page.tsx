export default function HomePage() {
  return (
    <>
    <header className="bg-white shadow-sm">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <h1 className="text-xl font-bold">
              <a href="/">TrackAttendance</a>
            </h1>
            <nav className="space-x-4">
              <a
                href="/login"
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                Login
              </a>
              <a
                href="/signup"
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                Signup
              </a>
            </nav>
          </div>
        </header>
    <div className="text-center">
      <h1 className="text-3xl font-bold mb-4">Welcome to TrackAttendance</h1>
      <p className="text-gray-600 mb-6">
        Manage your courses and track attendance effortlessly.
      </p>
      <div className="space-x-4">
        <a
          href="/dashboard"
          className="inline-block bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Get Started
        </a>
        <a
          href="/login"
          className="inline-block bg-gray-100 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Login
        </a>
      </div>
    </div>
    </>
  );
}
