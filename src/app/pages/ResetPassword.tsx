import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Lock, ShieldCheck, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export const ResetPassword: React.FC = () => {
  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validationMessage = useMemo(() => {
    if (!password) {
      return null;
    }

    if (password.length < 8) {
      return 'Password must be at least 8 characters.';
    }

    if (confirmPassword && password !== confirmPassword) {
      return 'Passwords do not match.';
    }

    return null;
  }, [password, confirmPassword]);

  const canSubmit =
    password.length >= 8 && confirmPassword.length >= 8 && password === confirmPassword && !isSubmitting;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit) {
      if (validationMessage) {
        toast.error(validationMessage);
      }
      return;
    }

    try {
      setIsSubmitting(true);
      await updatePassword(password);
      toast.success('Password updated successfully. You can now sign in.');
      navigate('/login', { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update password';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative w-full max-w-md"
      >
        <div className="p-6 sm:p-8 rounded-3xl bg-card/40 backdrop-blur-xl border border-border shadow-2xl space-y-6">
          <div className="space-y-2 text-center">
            <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl">Set a New Password</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Enter a new password for your account.
            </p>
          </div>

          <form className="space-y-3" onSubmit={handleSubmit}>
            <Input
              type="password"
              placeholder="New password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="h-11"
            />
            <Input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              className="h-11"
            />

            {validationMessage && <p className="text-sm text-destructive">{validationMessage}</p>}

            <Button type="submit" className="w-full h-11" disabled={!canSubmit}>
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Lock className="w-4 h-4 animate-pulse" />
                  Updating password...
                </span>
              ) : (
                'Update password'
              )}
            </Button>
          </form>

          <div className="text-center">
            <Link to="/login" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
              <ArrowLeft className="w-4 h-4" />
              Back to sign in
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
