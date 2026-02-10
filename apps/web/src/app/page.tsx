export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            Welcome to <span className="text-indigo-600">SaaS Booking</span>
          </h1>
          <p className="text-xl text-gray-700 mb-8">
            A modern monorepo with Next.js frontend and .NET 9 backend
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 mt-12">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Frontend</h2>
              <ul className="text-left space-y-2 text-gray-600">
                <li>✓ Next.js 15</li>
                <li>✓ React 19</li>
                <li>✓ TypeScript</li>
                <li>✓ Tailwind CSS</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Backend</h2>
              <ul className="text-left space-y-2 text-gray-600">
                <li>✓ .NET 9</li>
                <li>✓ ASP.NET Core</li>
                <li>✓ Web API</li>
                <li>✓ RESTful endpoints</li>
              </ul>
            </div>
          </div>

          <div className="mt-12">
            <a
              href="/api/health"
              className="inline-block bg-indigo-600 text-white font-semibold px-8 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Check API Status
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
