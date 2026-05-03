import { Button } from '@/components/ui/button';

export function ExportButton() {
  return (
    <Button asChild type="button" variant="secondary" size="md">
      <a href="/api/export" download>
        Exportar progresso (JSON)
      </a>
    </Button>
  );
}
