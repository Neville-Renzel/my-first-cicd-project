export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-blue-600 mb-8">
          Hello World! 🌍 Updated!!!!
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          This is my first CI/CD project with GitHub Actions!
        </p>
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          ✅ Successfully deployed with automation!
        </div>
      </div>
    </main>
  );
}
