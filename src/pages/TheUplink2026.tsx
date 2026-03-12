import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    gsap?: any;
  }
}

const GSAP_CDN =
  "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js";

const loadGsapFromCdn = async () => {
  if (typeof window === "undefined") return undefined;
  if (window.gsap) return window.gsap;

  await new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src='${GSAP_CDN}']`
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("gsap failed to load")), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.src = GSAP_CDN;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("gsap failed to load"));
    document.head.appendChild(script);
  });

  return window.gsap;
};

const TheUplink2026 = () => {
  const mainRef = useRef<HTMLDivElement>(null);
  const nebulaRef = useRef<HTMLDivElement>(null);
  const mapSectionRef = useRef<HTMLDivElement>(null);
  const downButtonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showButton, setShowButton] = useState(true);
  
  // Form states
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    let mounted = true;
    let cleanup: (() => void) | undefined;

    loadGsapFromCdn()
      .then((gsap) => {
        if (!mounted || !gsap || !mainRef.current) return;

        const revealEls = mainRef.current.querySelectorAll(".uplink-reveal");
        const tl = gsap.timeline({ defaults: { ease: "power2.out", duration: 0.9 } });
        tl.from(revealEls, {
          y: 24,
          opacity: 0,
          filter: "blur(8px)",
          stagger: 0.12,
        });

        const handleMouseMove = (e: MouseEvent) => {
          const x = (e.clientX / window.innerWidth - 0.5) * 6;
          const y = (e.clientY / window.innerHeight - 0.5) * 6;
          gsap.to(mainRef.current, {
            duration: 0.6,
            x: x * 1.2,
            y: y * 1.2,
            ease: "power2.out",
          });
          if (nebulaRef.current) {
            gsap.to(nebulaRef.current, {
              duration: 2.2,
              x: -x * 2,
              y: -y * 2,
              ease: "power2.out",
            });
          }
        };

        window.addEventListener("mousemove", handleMouseMove);
        cleanup = () => {
          window.removeEventListener("mousemove", handleMouseMove);
          tl.kill();
        };

        // Bounce animation on down button
        if (downButtonRef.current) {
          const bounceTimeline = gsap.timeline({ repeat: -1, yoyo: true });
          bounceTimeline.to(downButtonRef.current, {
            y: 8,
            duration: 0.6,
            ease: "power2.inOut",
          });
        }
      })
      .catch(() => {
        // Graceful degradation if GSAP CDN fails.
      });

    return () => {
      mounted = false;
      cleanup?.();
    };
  }, []);

  const scrollToMap = () => {
    mapSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleInviteSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setMessage({ type: "error", text: "Please enter an email address" });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5050";
      const response = await fetch(`${apiUrl}/uplink/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: "✓ Welcome to The Uplink 2026! Check your inbox." });
        setEmail("");
      } else if (response.status === 409) {
        setMessage({ type: "error", text: "This email is already on the waitlist." });
      } else {
        setMessage({ type: "error", text: data.error || "Failed to join waitlist. Please try again." });
      }
    } catch (error) {
      console.error("Error submitting invite:", error);
      setMessage({ type: "error", text: "Connection error. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  // Hide button when scrolled down
  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const scrollTop = containerRef.current.scrollTop;
        setShowButton(scrollTop < 200); // Show button only in top 200px
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full bg-[#050507] text-white overflow-y-scroll"
      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', sans-serif", scrollbarWidth: "none", msOverflowStyle: "none", height: "100vh" }}
    >
      {/* Background layers - covers entire page */}
      <div ref={nebulaRef} className="uplink-nebula fixed inset-0 pointer-events-none" aria-hidden style={{ zIndex: 0 }} />
      <div className="uplink-stars fixed inset-0 pointer-events-none" aria-hidden style={{ zIndex: 1 }} />
      
      {/* Content wrapper */}
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-16">
          {/* Network overlay */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <svg className="uplink-network w-full h-full" viewBox="0 0 1200 900" preserveAspectRatio="xMidYMid slice">
            {/* nodes */}
            <circle cx="180" cy="140" r="2.8" />
            <circle cx="320" cy="260" r="2.2" />
            <circle cx="520" cy="160" r="2.5" />
            <circle cx="720" cy="220" r="2.8" />
            <circle cx="940" cy="160" r="3" />
            <circle cx="1080" cy="320" r="2.4" />
            <circle cx="260" cy="460" r="2.6" />
            <circle cx="520" cy="480" r="3" />
            <circle cx="760" cy="420" r="2.5" />
            <circle cx="980" cy="520" r="2.2" />
            <circle cx="420" cy="660" r="2.4" />
            <circle cx="650" cy="640" r="2.8" />
            <circle cx="900" cy="700" r="2.6" />
            <circle cx="240" cy="720" r="2.3" />
            <circle cx="1100" cy="620" r="2.5" />

            {/* connections */}
            <line x1="180" y1="140" x2="320" y2="260" />
            <line x1="320" y1="260" x2="520" y2="160" />
            <line x1="520" y1="160" x2="720" y2="220" />
            <line x1="720" y1="220" x2="940" y2="160" />
            <line x1="940" y1="160" x2="1080" y2="320" />
            <line x1="260" y1="460" x2="520" y2="480" />
            <line x1="520" y1="480" x2="760" y2="420" />
            <line x1="760" y1="420" x2="980" y2="520" />
            <line x1="260" y1="460" x2="320" y2="260" />
            <line x1="520" y1="160" x2="520" y2="480" />
            <line x1="720" y1="220" x2="760" y2="420" />
            <line x1="940" y1="160" x2="980" y2="520" />
            <line x1="420" y1="660" x2="520" y2="480" />
            <line x1="650" y1="640" x2="760" y2="420" />
            <line x1="900" y1="700" x2="980" y2="520" />
            <line x1="240" y1="720" x2="420" y2="660" />
            <line x1="650" y1="640" x2="900" y2="700" />
            <line x1="900" y1="700" x2="1100" y2="620" />
            <line x1="1100" y1="620" x2="980" y2="520" />
            <line x1="240" y1="720" x2="260" y2="460" />
          </svg>
        </div>
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            background:
              "radial-gradient(circle at 50% 30%, rgba(255,255,255,0.05), transparent 50%)",
          }}
        />

        {/* Content */}
        <main
          ref={mainRef}
          className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center gap-10 text-center"
        >
          <section className="space-y-4">


            <h1 className="uplink-reveal text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-[-0.04em] leading-tight">
              The Uplink 2026
            </h1>
            <p className="uplink-reveal text-lg sm:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
              Connecting BC’s Brightest Youth Innovators
            </p>
            <div className="uplink-reveal mt-4 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-8">
              <div className="text-2xl sm:text-3xl font-semibold tracking-tight text-white drop-shadow-md">
                June 6th
              </div>
              <span className="hidden text-sm text-white/30 sm:block">—</span>
              <div className="text-base sm:text-lg text-white/60">H.R. MacMillan Space Centre</div>
            </div>
          </section>

          <section className="uplink-reveal w-full max-w-xl">
            <form
              className="uplink-input-shell transition-all duration-300"
              onSubmit={handleInviteSubmit}
            >
              <div className="flex flex-col gap-2 p-2 sm:flex-row sm:gap-3 sm:p-3">
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="w-full bg-transparent px-3 py-2 text-base text-white placeholder-white/35 outline-none sm:text-lg disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-white px-4 py-2 text-sm font-semibold tracking-tight text-[#050507] transition-all duration-300 hover:shadow-[0_0_40px_rgba(255,255,255,0.15)] disabled:opacity-50 disabled:cursor-not-allowed sm:px-5 sm:py-3 sm:text-base"
                >
                  <span className="relative z-10">{isLoading ? "Sending..." : "Invite"}</span>
                  <span className="relative z-10 text-lg">{isLoading ? "⏳" : "↗"}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white to-white/80 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </button>
              </div>
              {message && (
                <div className={`mt-3 px-3 py-2 rounded-lg text-sm transition-all duration-300 ${
                  message.type === "success" 
                    ? "bg-green-500/20 text-green-300" 
                    : "bg-red-500/20 text-red-300"
                }`}>
                  {message.text}
                </div>
              )}
            </form>
          </section>

          <footer className="text-xs tracking-wide text-white/40">
            Backed by BC Science Fairs
          </footer>

        </main>
        </div>

        {/* Map Section - Scrollable Below */}
        <div
          ref={mapSectionRef}
          className="relative w-full flex items-center justify-center py-32 px-32"
        >
        <section className="uplink-reveal w-full">
          <div className="rounded-2xl overflow-hidden border border-white/10 shadow-lg" style={{ height: "700px" }}>
            <iframe
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2609.198445678029!2d-123.14444300000001!3d49.2762240!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5486723337dfe05f%3A0xb7e56c9897d9a2ef!2sH.R.%20MacMillan%20Space%20Centre!5e0!3m2!1sen!2sca!4v1705699200000"
            />
          </div>
        </section>
      </div>
      </div>

      {/* Down Arrow Button - Fixed at Bottom */}
      <button
        ref={downButtonRef}
        onClick={scrollToMap}
        className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 flex items-center justify-center w-14 h-14 rounded-full bg-white shadow-lg transition-all duration-300 hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] hover:scale-110 ${showButton ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        aria-label="Scroll to map"
        style={{ zIndex: 9999 }}
      >
        <span className="text-2xl text-[#050507] font-bold">↓</span>
      </button>
    </div>
  );
};

export default TheUplink2026;
