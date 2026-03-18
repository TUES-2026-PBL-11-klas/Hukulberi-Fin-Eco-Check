export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-semibold text-black dark:text-zinc-50 mb-8">
          Admin Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Feature Toggles Section */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow">
            <h2 className="text-xl font-medium text-black dark:text-zinc-50 mb-4">
              Feature Toggles
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              Manage application features here.
            </p>
            {/* Placeholder for toggles */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <span>Feature 1</span>
                <input type="checkbox" />
              </div>
              <div className="flex items-center justify-between">
                <span>Feature 2</span>
                <input type="checkbox" />
              </div>
            </div>
          </div>

          {/* Settings Section */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow">
            <h2 className="text-xl font-medium text-black dark:text-zinc-50 mb-4">
              Settings
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              Configure application settings.
            </p>
            {/* Placeholder for settings */}
            <div className="mt-4 space-y-2">
              <div>
                <label className="block text-sm font-medium">Setting 1</label>
                <input type="text" className="mt-1 block w-full border border-zinc-300 rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium">Setting 2</label>
                <input type="text" className="mt-1 block w-full border border-zinc-300 rounded px-3 py-2" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}