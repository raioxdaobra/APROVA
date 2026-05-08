import { AuthShell } from '@/components/auth/auth-shell';
import { ForgotPasswordForm } from './forgot-password-form';

export const metadata = {
  title: 'Recuperar senha — APROVA',
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Recuperar senha"
      description="Informe seu email e enviaremos um link para definir uma nova senha."
      footer={<p>Feito em Fortaleza · 1.000+ questões oficiais Unifor</p>}
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
