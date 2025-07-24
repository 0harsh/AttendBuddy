export default function HomePage() {
  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-extrabold tracking-tight text-blue-700">
            <a href="/">TrackAttendance</a>
          </h1>
          <nav className="space-x-4">
            <a
              href="/login"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Login
            </a>
            <a
              href="/signup"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Signup
            </a>
          </nav>
        </div>
      </header>
      <section className="flex flex-col items-center justify-center min-h-[70vh] bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-inner mt-8 mx-auto max-w-3xl p-8">
        <img src="/globe.svg" alt="Attendance" className="w-24 h-24 mb-6 opacity-90" />
        <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-800 mb-4 text-center drop-shadow">Welcome to TrackAttendance</h1>
        <p className="text-lg text-gray-700 mb-8 text-center max-w-xl">
          Effortlessly manage your courses and track attendance with a beautiful, intuitive dashboard. Stay organized and never miss a class again!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <a
            href="/dashboard"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold shadow hover:bg-blue-700 transition-colors text-center"
          >
            Get Started
          </a>
          <a
            href="/login"
            className="inline-block bg-white border border-blue-600 text-blue-700 px-8 py-3 rounded-lg text-lg font-semibold shadow hover:bg-blue-50 transition-colors text-center"
          >
            Login
          </a>
        </div>
      </section>
    </>
  );
}
