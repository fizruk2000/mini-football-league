export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-8 mt-auto">
      <div className="container mx-auto px-4 max-w-7xl text-center">
        <p className="text-sm">
          © {new Date().getFullYear()} Гимназическая мини-футбольная лига
        </p>
        <p className="text-xs mt-2 text-slate-500">
          Сайт создан для внутреннего использования гимназии
        </p>
      </div>
    </footer>
  );
}
