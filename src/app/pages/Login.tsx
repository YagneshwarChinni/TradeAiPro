import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Chrome, TrendingUp, Shield, Zap, CheckCircle, Mail } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export const Login: React.FC = () => {
  const {
    user,
    isLoading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    resetPassword,
    resendVerificationEmail,
  } = useAuth();
  const navigate = useNavigate();
  const [oauthLoading, setOauthLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const emailConfirmationRequired = import.meta.env.VITE_EMAIL_CONFIRMATION_REQUIRED === 'true';

  useEffect(() => {
    if (user && !isLoading) {
      navigate('/dashboard');
    }
  }, [user, isLoading, navigate]);

  const handleGoogleSignIn = async () => {
    try {
      setOauthLoading(true);
      await signInWithGoogle();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Google sign-in failed';
      toast.error(message);
      setOauthLoading(false);
    }
  };

  const handleEmailSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setEmailLoading(true);
      await signInWithEmail(email.trim(), password);
      toast.success('Signed in successfully', { duration: 2000 });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign-in failed';
      toast.error(message);
    } finally {
      setEmailLoading(false);
    }
  };

  const handleEmailSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (signUpPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    if (signUpPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setSignupLoading(true);
      const result = await signUpWithEmail(signUpEmail.trim(), signUpPassword, fullName.trim() || undefined);
      if (emailConfirmationRequired && result.requiresEmailVerification) {
        setPendingVerificationEmail(signUpEmail.trim());
        toast.success('Account created. Check your inbox to verify your email.');
      } else {
        setPendingVerificationEmail('');
        toast.success('Account created and signed in successfully.');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign-up failed';
      toast.error(message);
    } finally {
      setSignupLoading(false);
    }
  };

  const handleForgotPassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setForgotLoading(true);
      await resetPassword(forgotEmail.trim());
      toast.success('Password reset link sent. Please check your inbox.');
      setShowForgotPassword(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send reset email';
      toast.error(message);
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      setResendLoading(true);
      await resendVerificationEmail(pendingVerificationEmail);
      toast.success('Verification email resent successfully.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to resend verification email';
      toast.error(message);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50" />
      
      <div className="relative w-full max-w-6xl grid md:grid-cols-2 gap-12 items-center">
        {/* Left side - Branding */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden md:block space-y-8"
        >
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-primary text-sm">AI-Powered Trading</span>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
              Welcome to
              <br />
              TradeAI Pro
            </h1>
            <p className="text-xl text-muted-foreground">
              Professional trading platform with real-time analytics and AI insights
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: Shield, text: 'Secure & encrypted authentication' },
              { icon: Zap, text: 'Real-time market data & analytics' },
              { icon: CheckCircle, text: 'AI-powered trading signals' },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-muted-foreground">{feature.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right side - Login form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full"
        >
          <div className="p-8 md:p-12 rounded-3xl bg-card/40 backdrop-blur-xl border border-border shadow-2xl">
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-3xl">Sign In</h2>
                <p className="text-muted-foreground">
                  Access your trading dashboard
                </p>
              </div>

              <Tabs defaultValue="signin" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2 h-11">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value="signin" className="space-y-4">
                  <form className="space-y-3" onSubmit={handleEmailSignIn}>
                    <Input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                      className="h-11"
                    />
                    <Input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                      className="h-11"
                    />
                    <Button type="submit" disabled={isLoading || emailLoading} className="w-full h-11">
                      {emailLoading ? 'Signing in...' : 'Sign in with Email'}
                    </Button>
                  </form>

                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword((value) => !value);
                      setForgotEmail(email);
                    }}
                    className="w-full text-sm text-primary hover:underline"
                  >
                    {showForgotPassword ? 'Hide password reset' : 'Forgot password?'}
                  </button>

                  {showForgotPassword && (
                    <form className="space-y-3 rounded-lg border border-border p-3" onSubmit={handleForgotPassword}>
                      <Input
                        type="email"
                        placeholder="Enter your account email"
                        value={forgotEmail}
                        onChange={(event) => setForgotEmail(event.target.value)}
                        required
                      />
                      <Button type="submit" variant="outline" disabled={forgotLoading} className="w-full">
                        {forgotLoading ? 'Sending reset link...' : 'Send reset link'}
                      </Button>
                    </form>
                  )}
                </TabsContent>

                <TabsContent value="signup" className="space-y-4">
                  {!emailConfirmationRequired && (
                    <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">
                      Development mode: email verification is disabled. New accounts sign in immediately after signup.
                    </div>
                  )}

                  <form className="space-y-3" onSubmit={handleEmailSignUp}>
                    <Input
                      type="text"
                      placeholder="Full name (optional)"
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      className="h-11"
                    />
                    <Input
                      type="email"
                      placeholder="Email"
                      value={signUpEmail}
                      onChange={(event) => setSignUpEmail(event.target.value)}
                      required
                      className="h-11"
                    />
                    <Input
                      type="password"
                      placeholder="Password"
                      value={signUpPassword}
                      onChange={(event) => setSignUpPassword(event.target.value)}
                      required
                      className="h-11"
                    />
                    <Input
                      type="password"
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      required
                      className="h-11"
                    />
                    <Button type="submit" disabled={isLoading || signupLoading} className="w-full h-11">
                      {signupLoading ? 'Creating account...' : 'Create account'}
                    </Button>
                  </form>

                  {emailConfirmationRequired && pendingVerificationEmail && (
                    <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-3">
                      <p className="text-sm text-muted-foreground">
                        Verification email sent to <span className="text-foreground font-medium">{pendingVerificationEmail}</span>.
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={handleResendVerification}
                        disabled={resendLoading}
                      >
                        {resendLoading ? 'Resending...' : 'Resend verification email'}
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-card text-muted-foreground">or continue with</span>
                </div>
              </div>

              <Button
                onClick={handleGoogleSignIn}
                disabled={isLoading || oauthLoading}
                className="w-full h-12 text-base bg-white hover:bg-gray-100 text-gray-900 border border-gray-300 shadow-sm relative overflow-hidden group"
                variant="outline"
              >
                {oauthLoading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    <span>Redirecting...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Chrome className="w-5 h-5 text-[#4285F4]" />
                    <span>Continue with Google</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </Button>

              <div className="pt-6 border-t border-border">
                <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <Mail className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground mb-1">Auth Setup</p>
                    <p>
                      Configure Email and Google providers in your Supabase project settings to enable sign-up and social login.
                    </p>
                    <p className="mt-2 text-xs">
                      To require email verification again, set <span className="text-foreground font-medium">VITE_EMAIL_CONFIRMATION_REQUIRED=true</span> and turn on Confirm email in Supabase.
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-center text-sm text-muted-foreground">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
