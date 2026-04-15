import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
      <h2 className="text-2xl font-bold mb-2">Page Not Found</h2>
      <p className="text-muted mb-8">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex gap-3 justify-center">
        <Link
          href="/"
          className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:opacity-90"
        >
          Go Home
        </Link>
        <Link
          href="/categories"
          className="border border-border px-6 py-3 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          Browse Products
        </Link>
      </div>
    </div>
  );
}
