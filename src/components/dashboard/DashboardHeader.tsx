"use client";

export default function Navbar() {
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        cache: "no-store",
      });

      window.location.href = "/login";
    } catch (error) {
      console.error(error);
      window.location.href = "/login";
    }
  };

  return (
    <header className="flex justify-between p-4 bg-white shadow">
      <h1>تطبيق التوصيل</h1>

      <button
        onClick={handleLogout}
        className="text-red-500 font-medium"
      >
        تسجيل الخروج
      </button>
    </header>
  );
}