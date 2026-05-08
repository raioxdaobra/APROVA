import { AuthShell } from '@/components/auth/auth-shell';
import { ResetForm } from './reset-form';

export const metadata = {
  title: 'Definir nova senha — APROVA',
};

// O fluxo de recovery do Supabase entrega o token via fragment (#access_token=...
// &type=recovery), que só é visível no client. Por isso o ResetForm é Client.
export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Definir nova senha"
      description="Crie uma senha nova pra continuar usando o APROVA."
      footer={<p>Feito em Fortaleza · 1.000+ questões oficiais Unifor</p>}
    >
      <ResetForm />
    </AuthShell>
  );
}
