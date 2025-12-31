import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 md:p-12">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
              ?? Ticket System
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              A modern ticket management system with commenting functionality, similar to Jira and Redmine
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
              <div className="text-3xl mb-3">??</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Ticket Management
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Create, track, and manage tickets with different types, priorities, and statuses
              </p>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
              <div className="text-3xl mb-3">??</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Real-time Comments
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Collaborate with team members through threaded comments and discussions
              </p>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6">
              <div className="text-3xl mb-3">??</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Team Collaboration
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Assign tickets, track progress, and maintain team communication
              </p>
            </div>
          </div>

          {/* Sample Stats */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">5</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Active Tickets</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">7</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Comments</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">4</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Team Members</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">2</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Resolved</div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="space-y-4">
            <Link
              href="/tickets"
              className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
            >
              View All Tickets
              <span className="ml-2">?</span>
            </Link>
            
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Built with Next.js 16, TypeScript, and Tailwind CSS
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
