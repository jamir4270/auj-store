import { ForgotPasswordForm } from "@/components/forgot-password-form";
import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Toaster } from "sonner";

export default function ForgotPasswordPage() {
  return (
    <div>
      <Toaster position="top-right" />
      <div className="grid min-h-svh lg:grid-cols-2">
        <div className="relative hidden lg:flex flex-col p-10 text-white dark:border-r bg-[#0A58A3] overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-b from-transparent to-black/40" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl pointer-events-none" />

          <Link href="/">
            <div className="relative z-20 flex items-center text-lg font-medium gap-2">
              <span className="tracking-tight font-semibold">
                AUJ Store Management
              </span>
            </div>
          </Link>

          <div className="relative z-20 flex-1 flex flex-col justify-center items-start gap-8">
            <div className="space-y-2">
              <h2 className="text-5xl font-extrabold tracking-tight text-white/90">
                Inventory.
              </h2>
              <h2 className="text-5xl font-extrabold tracking-tight text-white/70">
                Sales.
              </h2>
              <h2 className="text-5xl font-extrabold tracking-tight text-white/40">
                Analytics.
              </h2>
            </div>

            <div className="h-1 w-20 bg-emerald-400 rounded-full" />

            <p className="max-w-sm text-lg text-blue-100 font-light leading-relaxed">
              Streamlining operations for school supplies, goods, and print
              services through accurate recording and auditing.
            </p>
          </div>

          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-2">
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <ShieldCheck
                    key={i}
                    className="w-5 h-5 text-emerald-400 fill-emerald-400/20"
                  />
                ))}
              </div>
              <p className="text-lg font-medium leading-relaxed text-blue-50">
                &ldquo;Efficiency is the heartbeat of our store. This system
                ensures every item sold and every document printed is accounted
                for with precision.&rdquo;
              </p>
              <footer className="text-sm text-blue-200 mt-4">
                — AUJ Store Administration
              </footer>
            </blockquote>
          </div>
        </div>

        <div className="flex flex-col gap-4 p-6 md:p-10">
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-xs space-y-6">
              <div className="lg:hidden flex flex-col items-center text-center gap-2 mb-8">
                <div className="h-12 w-12 bg-blue-50 text-[#0A58A3] rounded-xl flex items-center justify-center mb-2">
                  <p className="font-bold">AUJ</p>
                </div>
                <h1 className="text-xl font-bold">Account Recovery</h1>
                <p className="text-sm text-muted-foreground">
                  Restore access to your inventory dashboard
                </p>
              </div>

              <ForgotPasswordForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
