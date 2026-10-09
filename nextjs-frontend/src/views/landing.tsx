import { Button } from "@/components/ui/button";
// import Sidebar from "@/components/layout/Sidebar";

export default function Landing() {
  return (
    <main className="overflow-x-hidden min-h-screen min-w-full max-w-screen">
      {/* Background image */}
      <div
        className="flex-row flex min-h-screen min-w-full max-w-screen gap-6 overflow-hidden opacity-70 bg-cover bg-center"
        style={{
          backgroundImage: "url('/images/pets-background.jpg')",
        }}
      >
        {/* overlay */}
        <div className="absolute inset-0 bg-background opacity-65 z-1 min-h-screen w-full"></div>
        {/* content */}
        <div className="relative z-10 flex flex-row w-full min-h-screen">
          <section className="flex max-w-screen flex-1 flex-col items-center justify-center gap-6 text-center z-2 text-popover-foreground">
            <h1 className="text-5xl font-bold text-foreground">
              Find Your Perfect Companion
            </h1>

            <p className="max-w-xl text-accent-foreground">
              PawMatch helps you discover pets that match your lifestyle,
              preferences, and home.
            </p>

            <div className="flex gap-4">
              <Button>Find Your Match</Button>
              <Button variant="outline">Browse Pets</Button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
