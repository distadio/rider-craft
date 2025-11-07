import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '@/store/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface AdminLoginProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AdminLogin = ({ open, onOpenChange }: AdminLoginProps) => {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const setIsAdmin = useStore(state => state.setIsAdmin);

  // ATENÇÃO: Em produção, use autenticação real com backend
  const ADMIN_PASSWORD = 'admin123';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      localStorage.setItem('isAdmin', 'true');
      onOpenChange(false);
      toast.success(t('admin.loginSuccess'));
      setPassword('');
    } else {
      toast.error(t('admin.invalidPassword'));
      setPassword('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('admin.adminLogin')}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label htmlFor="admin-password">{t('admin.password')}</Label>
            <Input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              {t('admin.login')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              {t('common.cancel')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
