import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { checkPassword, setAuthenticated } from '@/lib/auth';

const Login = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [password, setPassword] = useState('');
  const next = params.get('next') || '/';

  useEffect(() => {
    // If already logged, skip
    // Navigation happens client-side only
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (checkPassword(password)) {
      setAuthenticated();
      toast.success('Acesso liberado');
      navigate(next);
    } else {
      toast.error('Senha incorreta');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-accent/20 p-4">
      <Card className="w-full max-w-sm p-6">
        <h1 className="text-xl font-semibold text-foreground mb-4">Proteção da Dashboard</h1>
        <p className="text-sm text-muted-foreground mb-6">Informe a senha para acessar.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" className="w-full">Entrar</Button>
        </form>
      </Card>
    </div>
  );
};

export default Login;

