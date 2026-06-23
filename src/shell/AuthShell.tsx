import { Outlet } from 'react-router-dom';

export function AuthShell() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-canvas px-4 py-8">
      {/* Ambient radial gradient */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 30% 20%, rgba(94,106,210,0.22), transparent 50%), radial-gradient(circle at 80% 80%, rgba(130,80,255,0.15), transparent 55%)',
        }}
      />
      <div className="relative w-full max-w-sm">
        <Outlet />
      </div>
    </div>
  );
}
