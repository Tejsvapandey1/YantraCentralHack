import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default  async function LandingPage() {
  const { userId } =await auth();

  if (userId) {
    redirect("/choose-role");
  }
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* ---------- NAVBAR ---------- */}
      <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="text-xl font-bold text-blue-400">❤️ Voltics</div>

          <div className="flex items-center gap-4">
            <SignedOut>
              <SignInButton>
                <button className="px-4 py-2 bg-blue-600 rounded-lg">
                  Sign In
                </button>
              </SignInButton>

              <SignUpButton>
                <button className="px-4 py-2 border border-slate-600 rounded-lg">
                  Sign Up
                </button>
              </SignUpButton>
            </SignedOut>

            <SignedIn>
              <Link href="/choose-role">
                <button className="px-4 py-2 bg-blue-600 rounded-lg">
                  Go to Dashboard
                </button>
              </Link>

              <UserButton />
            </SignedIn>
          </div>
        </div>
      </nav>

      {/* ---------- HERO ---------- */}
      <section className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-5xl font-bold leading-tight mb-6">
            Safety Without Surveillance <br />
            <span className="text-blue-400">Care Without Cost</span>
          </h1>

          <p className="text-slate-400 text-lg mb-8">
            Decentralized assistive devices designed to protect lives while
            preserving dignity. Smart shoes, intelligent sticks, and medical
            bands — one ecosystem.
          </p>

          <div className="flex gap-4">
            <SignedOut>
              <SignUpButton mode="modal">
                <button className="px-6 py-3 bg-blue-600 rounded-lg font-semibold hover:bg-blue-700">
                  Get Started
                </button>
              </SignUpButton>
            </SignedOut>

            <SignedIn>
              <Link href="/choose-role">
                <button className="px-6 py-3 bg-blue-600 rounded-lg font-semibold">
                  Enter App
                </button>
              </Link>
            </SignedIn>
          </div>
        </div>

        {/* STATS CARD */}
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl space-y-6">
          <h3 className="text-xl font-semibold border-b border-slate-800 pb-2">
            The Market Gap
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <Stat
              label="Avg Competitor Cost"
              value="$400+"
              color="text-red-400"
            />
            <Stat
              label="Voltics Manufacturing"
              value="$45"
              color="text-green-400"
            />
            <Stat
              label="Competitor Charging"
              value="Daily"
              color="text-yellow-400"
            />
            <Stat
              label="Voltics Shoe Battery"
              value="Zero"
              color="text-blue-400"
            />
          </div>
        </div>
      </section>

      {/* ---------- FEATURES ---------- */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <h2 className="text-3xl font-bold text-center mb-12">Our Ecosystem</h2>

        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            title="Piezo Smart Shoe"
            desc="Self-powered fall detection powered by walking energy."
          />

          <FeatureCard
            title="Guardian Smart Stick"
            desc="Vitals monitoring with OLED display and obstacle alert."
          />

          <FeatureCard
            title="Care Safety Band"
            desc="Medical grade monitoring for patients and workers."
          />
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="bg-slate-900 border-t border-slate-800 py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">
          Ready to experience smarter safety?
        </h2>

        <SignedOut>
          <SignUpButton mode="modal">
            <button className="px-8 py-3 bg-blue-600 rounded-lg text-lg font-semibold">
              Create Account
            </button>
          </SignUpButton>
        </SignedOut>

        <SignedIn>
          <Link href="/choose-role">
            <button className="px-8 py-3 bg-blue-600 rounded-lg text-lg font-semibold">
              Open Dashboard
            </button>
          </Link>
        </SignedIn>
      </section>
    </div>
  );
}

/* ---------- SMALL COMPONENTS ---------- */

function Stat({ label, value, color }) {
  return (
    <div className="bg-slate-800 p-4 rounded-lg">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-sm text-slate-400">{label}</div>
    </div>
  );
}

function FeatureCard({ title, desc }) {
  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl hover:border-blue-500 transition">
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-slate-400">{desc}</p>
    </div>
  );
}
