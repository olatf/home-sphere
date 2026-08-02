'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, Lock, Mail, Undo2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { login } from '@/actions/auth';
import AnimatedWrapper from '@/components/common/AnimatedWrapper';
import { BrandButton } from '@/components/common/BrandButton';
import { BrandInput } from '@/components/common/BrandInput';
import { Card } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { getErrorMessage } from '@/helpers/error.helpers';
import { type LoginFormValues, loginSchema } from '@/lib/schemas/auth';
import { SignProvidersButtons } from './SignProviderButtons';

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
      <div className="relative flex w-full items-center justify-center rounded-lg border px-1 shadow md:mx-auto md:w-[90%] md:px-6 lg:border-none lg:shadow-none">
        <Card className="w-full border-none px-3 py-9 shadow-none md:max-w-md md:px-0">
          <div className="mx-auto flex justify-center">
            <Link
              href="/"
              className="absolute top-5 left-3 flex cursor-pointer items-center rounded-full bg-white/90 px-4 py-2 text-center font-primary font-semibold text-sm italic shadow hover:text-brand lg:hidden"
            >
              <Undo2 className="mr-2 size-4" />
              HomeSphere
            </Link>
            <h1 className="mt-15 mb-1 text-center font-bold font-secondary text-3xl md:mt-10">
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
                required
                leftElement={<Mail className="size-4" />}
              />

              <div className="relative">
                <BrandInput
                  name="password"
                  label="Your Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="*******"
                  formRef={form}
                  required
                  leftElement={<Lock className="size-4" />}
                />
                <div className="relative float-right">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute -top-4 right-3 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end">
                <Link
                  href="/forgot-password"
                  className="font-secondary text-primary text-sm hover:text-brand-dark"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="flex flex-col items-center justify-center gap-3">
                <BrandButton
                  type="submit"
                  className="mx-auto w-[70%]"
                  disabled={isLoggingIn}
                  leftIcon={
                    isLoggingIn ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null
                  }
                >
                  {isLoggingIn ? <>Logging in...</> : 'Login'}
                </BrandButton>
              </div>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Instant Login
                  </span>
                </div>
              </div>
              <SignProvidersButtons />

              <p className="mt-6 text-center text-muted-foreground text-sm">
                Don&apos;t have an account?{' '}
                <Link
                  href="/sign-up"
                  className="font-secondary font-semibold text-brand-dark hover:underline"
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
