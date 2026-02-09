'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, Undo2 } from 'lucide-react';
import { SignProvidersButtons } from './SignProviderButtons';
import { loginSchema, type LoginFormValues } from '@/lib/schemas/auth';
import { Card } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { getErrorMessage } from '@/helpers/error.helpers';
import { toast } from 'sonner';
import { login } from '@/actions/auth';
import { useRouter } from 'next/navigation';
import { BrandButton } from '@/components/common/BrandButton';
import { BrandInput } from '@/components/common/BrandInput';
import AnimatedWrapper from '@/components/common/AnimatedWrapper';

export const SignInForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, startLoggingIn] = useTransition();
  const router = useRouter();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    startLoggingIn(async () => {
      try {
        const res = await login({
          email: values.email,
          password: values.password,
        });

        if (res.error) {
          const errorMessage = getErrorMessage(res.error);
          toast.error(errorMessage);
          return;
        }

        toast.success('Welcome back!');
        router.push(`/dashboard`);
      } catch (err) {
        const errorMessage = getErrorMessage(err);
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }
    });
  };

  return (
    <AnimatedWrapper type="slideInRight">
      <div className="relative mx-auto flex w-full items-center justify-center px-1 md:w-[90%] md:px-6">
        <Card className="w-full max-w-md border shadow md:border-none md:shadow-none">
          <div className="mx-auto flex justify-center">
            <Link
              href="/"
              className="font-primary hover:text-brand absolute -top-10 left-0 flex cursor-pointer items-center rounded-full bg-white/90 px-4 py-2 text-center text-sm font-semibold italic shadow lg:hidden"
            >
              <Undo2 className="mr-2 size-4" />
              HomeSphere
            </Link>
            <h1 className="font-secondary mb-1 text-center text-3xl font-bold">
              Welcome Back to HomeSphere!
            </h1>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="mt-1 space-y-3 md:mt-7 md:space-y-5"
            >
              <BrandInput
                name="email"
                label="Your Email"
                type="email"
                placeholder="you@example.com"
                formRef={form}
              />

              <div className="relative">
                <BrandInput
                  name="password"
                  label="Your Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="*******"
                  formRef={form}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="flex items-center justify-end">
                <Link
                  href="/forgot-password"
                  className="text-primary font-secondary hover:text-brand-dark text-sm"
                >
                  Forgot password?
                </Link>
              </div>

              <BrandButton type="submit" className="mx-auto w-[70%]">
                {isLoggingIn ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  'Login'
                )}
              </BrandButton>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background text-muted-foreground px-2">
                    Instant Login
                  </span>
                </div>
              </div>
              <SignProvidersButtons />

              <p className="text-muted-foreground mt-6 text-center text-sm">
                Don&apos;t have an account?{' '}
                <Link
                  href="/sign-up"
                  className="text-brand-dark font-secondary font-semibold hover:underline"
                >
                  Register
                </Link>
              </p>
            </form>
          </Form>
        </Card>
      </div>
    </AnimatedWrapper>
  );
};
