import type { NavigateOptions } from '@tanstack/react-router';
import { cn } from '@/lib/utils';
import { useOSDetection } from '@/hooks/use-os-detection';
import { useDemoMode } from '@/hooks/use-demo-mode';

interface AutomakerLogoProps {
  sidebarOpen: boolean;
  navigate: (opts: NavigateOptions) => void;
}

function getOSAbbreviation(os: string): string {
  switch (os) {
    case 'mac':
      return 'M';
    case 'windows':
      return 'W';
    case 'linux':
      return 'L';
    default:
      return '?';
  }
}

export function AutomakerLogo({ sidebarOpen, navigate }: AutomakerLogoProps) {
  const appVersion = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '0.0.0';
  const { os } = useOSDetection();
  const appMode = import.meta.env.VITE_APP_MODE || '?';
  const versionSuffix = `${getOSAbbreviation(os)}${appMode}`;
  const demoMode = useDemoMode();

  return (
    <div
      className={cn(
        'flex items-center gap-3 titlebar-no-drag cursor-pointer group',
        !sidebarOpen && 'flex-col gap-1'
      )}
      onClick={() => navigate({ to: '/dashboard' })}
      data-testid="logo-button"
    >
      {/* Collapsed logo - only shown when sidebar is closed */}
      <div
        className={cn(
          'relative flex flex-col items-center justify-center rounded-lg gap-0.5',
          sidebarOpen ? 'hidden' : 'flex'
        )}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 256 256"
          role="img"
          aria-label="protoLabs Logo"
          className="size-8 group-hover:rotate-12 transition-transform duration-300 ease-out"
        >
          <rect x="16" y="16" width="224" height="224" rx="56" fill="#7c3aed" />
          <g
            transform="translate(224, 32) scale(-8, 8)"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 8V4H8" />
            <rect width="16" height="12" x="4" y="8" rx="2" />
            <path d="M2 14h2" />
            <path d="M20 14h2" />
            <path d="M15 13v2" />
            <path d="M9 13v2" />
          </g>
        </svg>
      </div>

      {/* Expanded logo - shown when sidebar is open */}
      {sidebarOpen && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 256 256"
              role="img"
              aria-label="protoLabs"
              className="h-8 w-8 lg:h-[36.8px] lg:w-[36.8px] shrink-0 group-hover:rotate-12 transition-transform duration-300 ease-out"
            >
              <rect x="16" y="16" width="224" height="224" rx="56" fill="#7c3aed" />
              <g
                transform="translate(224, 32) scale(-8, 8)"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 8V4H8" />
                <rect width="16" height="12" x="4" y="8" rx="2" />
                <path d="M2 14h2" />
                <path d="M20 14h2" />
                <path d="M15 13v2" />
                <path d="M9 13v2" />
              </g>
            </svg>
            <span className="font-bold text-foreground text-xl lg:text-[1.7rem] tracking-tight leading-none translate-y-[-2px]">
              proto<span className="text-brand-400">Labs</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5 ml-9 lg:ml-[38.8px]">
            <span className="text-[0.625rem] text-muted-foreground leading-none font-medium">
              v{appVersion} {versionSuffix}
            </span>
            {demoMode && (
              <span className="text-[0.5rem] font-bold uppercase tracking-wider text-brand-400 bg-brand-400/10 px-1.5 py-0.5 rounded leading-none">
                Demo
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
