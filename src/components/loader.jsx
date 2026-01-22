export default function HexLoader({
}) {
  const symbols = ["?", "!", ".",];

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center gap-6">
      <div className="flex items-end gap-2 text-5xl font-mono text-gray-700">
        {symbols.map((s, i) => (
          <span
            key={i}
            className="symbol-loader"
            style={{ animationDelay: `${i * 0.12}s` }}
          >
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}
