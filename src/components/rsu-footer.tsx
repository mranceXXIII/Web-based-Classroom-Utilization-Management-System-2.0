/* RSU footer — ported from footer.php: deep green bar (#2E7A6C), white
 * "Serving with Honor and Excellence!", gold (#EDC94F) "The Green University"
 * tag. Mounted once in the root layout so every page carries it, exactly like
 * the PHP include. Server component. */
export function RsuFooter() {
  return (
    <footer className="bg-rsu-deep text-white">
      <div className="mx-auto max-w-6xl px-4 py-3 text-center sm:px-6">
        <p className="text-sm font-medium">Serving with Honor and Excellence!</p>
        <span className="mt-0.5 block text-xs font-semibold tracking-widest text-rsu-gold">
          The Green University
        </span>
      </div>
    </footer>
  );
}
