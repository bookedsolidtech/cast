import { useState, useEffect } from 'react';
import { Label } from '@protolabsai/ui/atoms';
import { Input } from '@protolabsai/ui/atoms';
import { Button } from '@protolabsai/ui/atoms';
import { Library } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProjectSettings } from '@/hooks/queries/use-settings';
import { useUpdateProjectSettings } from '@/hooks/mutations/use-settings-mutations';
import type { Project } from '@/lib/electron';

interface ProjectDocsSectionProps {
  project: Project;
}

export function ProjectDocsSection({ project }: ProjectDocsSectionProps) {
  const { data: settings } = useProjectSettings(project.path);
  const updateSettings = useUpdateProjectSettings();
  const [docsPath, setDocsPath] = useState('');

  const isDisabled = settings?.docsPath === null;

  useEffect(() => {
    if (settings?.docsPath !== undefined) {
      setDocsPath(settings.docsPath ?? '');
    }
  }, [settings?.docsPath]);

  function handleSave() {
    updateSettings.mutate({
      projectPath: project.path,
      settings: { docsPath: docsPath || 'docs' },
    });
  }

  function handleDisable() {
    updateSettings.mutate({
      projectPath: project.path,
      settings: { docsPath: null },
    });
  }

  function handleEnable() {
    updateSettings.mutate({
      projectPath: project.path,
      settings: { docsPath: docsPath || 'docs' },
    });
  }

  return (
    <div
      className={cn(
        'rounded-xl overflow-hidden',
        'border border-border/50',
        'bg-gradient-to-br from-card/90 via-card/70 to-card/80 backdrop-blur-xl',
        'shadow-sm shadow-black/5'
      )}
    >
      <div className="p-6 border-b border-border/50 bg-gradient-to-r from-transparent via-accent/5 to-transparent">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-500/20 to-brand-600/10 flex items-center justify-center border border-brand-500/20">
            <Library className="w-5 h-5 text-brand-500" />
          </div>
          <h2 className="text-lg font-semibold text-foreground tracking-tight">Docs Viewer</h2>
        </div>
        <p className="text-sm text-muted-foreground/80 ml-12">
          Configure the documentation viewer for this project.
        </p>
      </div>
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="docs-path">Documentation Path</Label>
          <p className="text-xs text-muted-foreground">
            Path to the folder containing markdown files. Relative to the project root or an
            absolute path.
          </p>
          <Input
            id="docs-path"
            value={docsPath}
            onChange={(e) => setDocsPath(e.target.value)}
            placeholder="docs/"
            disabled={isDisabled}
          />
        </div>
        <div className="flex items-center gap-2">
          {isDisabled ? (
            <Button onClick={handleEnable} size="sm" disabled={updateSettings.isPending}>
              {updateSettings.isPending ? 'Saving...' : 'Enable'}
            </Button>
          ) : (
            <>
              <Button onClick={handleSave} size="sm" disabled={updateSettings.isPending}>
                {updateSettings.isPending ? 'Saving...' : 'Save'}
              </Button>
              <Button
                onClick={handleDisable}
                variant="outline"
                size="sm"
                disabled={updateSettings.isPending}
              >
                Disable
              </Button>
            </>
          )}
        </div>
        {isDisabled && (
          <p className="text-xs text-muted-foreground">
            The docs viewer is disabled for this project. Click Enable to turn it on.
          </p>
        )}
      </div>
    </div>
  );
}
