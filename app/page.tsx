export default function HomePage() {
  return (
    <>
      <header className="bg-white/95 backdrop-blur-sm shadow-modern sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            <a href="/">AttendBuddy</a>
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
      
      <section className="flex flex-col items-center justify-center min-h-[70vh] gradient-bg rounded-xl shadow-modern mt-8 mx-auto max-w-4xl p-8 animate-fade-in">
        <div className="text-6xl mb-6">🎓</div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 text-center drop-shadow-lg">
          Welcome to AttendBuddy
        </h1>
        <p className="text-lg text-white/90 mb-8 text-center max-w-2xl">
          Your attendance buddy - Track and manage your academic progress with a beautiful, intuitive dashboard. Stay organized and never miss a class again!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <a
            href="/signup"
            className="btn-primary px-8 py-3 text-lg font-semibold text-center"
          >
            Get Started
          </a>
          <a
            href="/login"
            className="btn-secondary px-8 py-3 text-lg font-semibold text-center"
          >
            Login
          </a>
        </div>
      </section>
    </>
  );
}
