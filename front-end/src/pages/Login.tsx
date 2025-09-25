import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { useLogin } from "@/hooks/auth";
import { useToast } from "@/components/ui/toast";
import { useNavigate } from "react-router-dom";

type LoginFormState = {
  email: string;
  password: string;
  remember: boolean;
};

const Login: React.FC = () => {
  const [form, setForm] = useState<LoginFormState>({
    email: "admin@smartclass.ai",
    password: "password",
    remember: true,
  });
  const navigate = useNavigate();
  const loginMutation = useLogin();
  const { addToast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      await loginMutation.mutateAsync({ email: form.email, password: form.password });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error(err);
      addToast({ title: 'Login failed', description: 'Please check your credentials.', variant: 'error' });
    }
  };

  const onChange =
    (key: keyof LoginFormState) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : e.target.value;
      setForm((prev) => ({ ...prev, [key]: value as never }));
    };

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-slate-100 via-indigo-100 to-blue-50 flex items-center justify-center p-4">
      {/* Animated background orbs */}
      <div aria-hidden className="bg-orbs">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      <Card className="relative w-full max-w-md border border-white/20 shadow-2xl bg-white/90 backdrop-blur">
        <CardHeader className="text-center space-y-3 pt-8">
          <div className="flex items-center justify-center gap-3">
            <img src="/brand-mark.svg" alt="SmartClass AI" className="h-10 w-10" />
            <span className="text-2xl font-semibold tracking-tight">SmartClass AI</span>
          </div>
          <p className="text-sm text-gray-500">Welcome back. Please sign in to continue.</p>
        </CardHeader>

        <CardContent className="pt-2">
          <form className="space-y-4" onSubmit={handleLogin}>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={onChange("email")}
                placeholder="you@example.com"
                className="block w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={form.password}
                onChange={onChange("password")}
                placeholder="••••••••"
                className="block w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                required
                autoComplete="current-password"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.remember}
                  onChange={onChange("remember")}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Remember me
              </label>

              <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline">
                Forgot password?
              </a>
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? "Signing in..." : "Sign in"}
            </Button>

            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-xs uppercase tracking-wider text-gray-500">or</span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full border-gray-200"
              onClick={() => {
                // eslint-disable-next-line no-console
                console.log("Login with Google");
              }}
            >
              <span className="mr-2 inline-flex h-5 w-5" aria-hidden>
                <svg viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 10.2v3.9h5.4C17 16.9 14.8 18.3 12 18.3c-3.5 0-6.3-2.9-6.3-6.3S8.5 5.7 12 5.7c1.7 0 3.2.6 4.3 1.7l2.9-2.9C17.3 2.7 14.8 1.8 12 1.8 6.5 1.8 2 6.3 2 11.9s4.5 10.1 10 10.1c8.5 0 10.4-7.5 9.7-11.8H12z"
                  />
                </svg>
              </span>
              Continue with Google
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center pb-8">
          <p className="text-sm text-gray-600">
            Don’t have an account? {" "}
            <a href="#" className="font-medium text-blue-600 hover:text-blue-700 hover:underline">
              Sign up
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;


