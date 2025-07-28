export default function AboutPage() {
  return (
    <div className="min-h-screen gradient-bg py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="text-6xl mb-6">🎓</div>
          <h1 className="text-5xl font-bold text-white drop-shadow-lg mb-4">
            About AttendBuddy
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Your trusted companion for academic success. We're here to help you stay organized, 
            track your progress, and never miss another class.
          </p>
        </div>

        {/* Mission Section */}
        <div className="card-modern p-8 mb-12 animate-slide-up">
          <div className="text-center mb-8">
            <div className="text-4xl mb-4">🎯</div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">Our Mission</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              To simplify attendance tracking and help students maintain perfect attendance records 
              through an intuitive, beautiful, and reliable platform.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="card-modern p-6 text-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Smart Tracking</h3>
            <p className="text-gray-600">
              Effortlessly mark your attendance with our intuitive calendar interface. 
              Track present, absent, and get detailed insights.
            </p>
          </div>

          <div className="card-modern p-6 text-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="text-4xl mb-4">🔔</div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Smart Reminders</h3>
            <p className="text-gray-600">
              Set reminders for upcoming classes and never miss an important lecture. 
              Stay ahead with our notification system.
            </p>
          </div>

          <div className="card-modern p-6 text-center animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="text-4xl mb-4">📈</div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Progress Analytics</h3>
            <p className="text-gray-600">
              View detailed attendance reports and analytics to understand your 
              attendance patterns and improve your academic performance.
            </p>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="card-modern p-8 mb-12 animate-slide-up">
          <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-8">Why Choose AttendBuddy?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="text-2xl">✨</div>
                <div>
                  <h4 className="font-semibold text-gray-800">User-Friendly Design</h4>
                  <p className="text-gray-600 text-sm">Beautiful, intuitive interface that makes attendance tracking a breeze.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="text-2xl">🔒</div>
                <div>
                  <h4 className="font-semibold text-gray-800">Secure & Private</h4>
                  <p className="text-gray-600 text-sm">Your data is protected with industry-standard security measures.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="text-2xl">📱</div>
                <div>
                  <h4 className="font-semibold text-gray-800">Cross-Platform</h4>
                  <p className="text-gray-600 text-sm">Access your attendance data from any device, anywhere, anytime.</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="text-2xl">⚡</div>
                <div>
                  <h4 className="font-semibold text-gray-800">Lightning Fast</h4>
                  <p className="text-gray-600 text-sm">Quick and responsive interface for seamless user experience.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="text-2xl">🎨</div>
                <div>
                  <h4 className="font-semibold text-gray-800">Modern UI</h4>
                  <p className="text-gray-600 text-sm">Contemporary design with smooth animations and beautiful gradients.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="text-2xl">🔄</div>
                <div>
                  <h4 className="font-semibold text-gray-800">Real-time Sync</h4>
                  <p className="text-gray-600 text-sm">Your data syncs instantly across all your devices.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="card-modern p-8 animate-slide-up">
          <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-8">Get in Touch</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">📧</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Email Us</h3>
              <p className="text-gray-600">hello@attendbuddy.com</p>
              <p className="text-gray-500 text-sm mt-2">We'd love to hear from you!</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Support</h3>
              <p className="text-gray-600">support@attendbuddy.com</p>
              <p className="text-gray-500 text-sm mt-2">Need help? We're here for you!</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 animate-fade-in">
          <p className="text-white/80 text-sm">
            © 2024 AttendBuddy. Made with ❤️ for students everywhere.
          </p>
        </div>
      </div>
    </div>
  );
} 