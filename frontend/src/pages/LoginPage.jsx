import { useState, useEffect } from "react";
import useLogin from "../hooks/useLogin.js";
import { ShipWheelIcon, EyeIcon, EyeOffIcon, SparklesIcon } from "lucide-react";
import { Link } from "react-router";
import { useThemeStore } from "../store/useThemeStore.js";

const LoginPage = () => {
  const { theme } = useThemeStore();
  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [progress, setProgress] = useState(0);
  const { isPending, error, loginMutation } = useLogin();

  // Completion Progress
  useEffect(() => {
    let p = 0;
    if (loginData.email.length > 5) p += 50;
    if (loginData.password.length > 5) p += 50;
    setProgress(p);
  }, [loginData]);

  const handleLogin = (e) => {
    e.preventDefault();
    loginMutation(loginData);
  };

  return (
    <div
      className="relative min-h-screen bg-base-200 flex items-center justify-center p-4 sm:p-6 md:p-8 font-sans selection:bg-primary selection:text-primary-content overflow-hidden"
      data-theme={theme}
    >
      {/* FLOATING ELEMENTS */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: 'radial-gradient(circle, currentColor 2px, transparent 2px)', backgroundSize: '30px 30px' }} />

        {/* Responsive Characters */}
        <div className="absolute top-[5%] left-[5%] text-4xl md:text-7xl font-black text-primary/20 animate-[float_6s_ease-in-out_infinite]">A</div>
        <div className="absolute top-[15%] right-[8%] text-5xl md:text-8xl font-black text-secondary/20 animate-[float_9s_ease-in-out_infinite_reverse]">文</div>
        <div className="absolute top-[40%] left-[2%] text-3xl md:text-6xl font-black text-accent/20 animate-[float_7s_ease-in-out_infinite_1s]">Б</div>
        <div className="absolute bottom-[20%] left-[10%] text-5xl md:text-9xl font-black text-primary/10 animate-[float_11s_ease-in-out_infinite_0.5s]">Ω</div>
        <div className="absolute bottom-[10%] right-[5%] text-4xl md:text-8xl font-black text-secondary/10 animate-[float_13s_ease-in-out_infinite]">ñ</div>
        <div className="absolute top-[50%] right-[2%] text-3xl md:text-5xl font-black text-accent/10 animate-[float_8s_ease-in-out_infinite_2s]">あ</div>
      </div>

      {/* MAIN LOGIN CARD */}
      <div className="relative z-10 w-full max-w-5xl bg-base-100 rounded-[2.5rem] flex flex-col lg:flex-row shadow-[0_20px_0_0_#cbd5e1] dark:shadow-[0_20px_0_0_#1e293b] border-4 border-base-300 overflow-hidden transition-all duration-500">

        {/* TOP PROGRESS BAR */}
        <div className="absolute top-0 left-0 w-full h-3 bg-base-300 z-20">
          <div className="h-full bg-primary transition-all duration-1000 ease-out" style={{ width: `${progress}%` }} />
        </div>

        {/* LEFT: FORM SECTION */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 md:p-16 flex flex-col justify-center bg-base-100 relative pt-12">

          <div className="mb-10 flex items-center justify-start gap-3">
            <div className="bg-primary p-3 rounded-2xl shadow-[0_4px_0_0_#45a001] text-white">
              <ShipWheelIcon className="size-8" strokeWidth={2.5} />
            </div>
            <span className="text-4xl font-black tracking-tighter text-primary">Sven</span>
          </div>

          {error && (
            <div className="bg-error/10 border-2 border-error text-error px-4 py-3 rounded-2xl font-bold mb-6 flex items-center gap-2">
              <SparklesIcon className="size-5 shrink-0" />
              <span className="text-sm">{error.response?.data?.message || "Invalid credentials, try again!"}</span>
            </div>
          )}

          <div className="mb-8">
            <h2 className="text-3xl font-[1000] tracking-tight mb-2 text-base-content uppercase italic">
              Welcome Back!
            </h2>
            <p className="font-bold text-base-content/50">Log in to keep your streak alive.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Input Groups */}
            <div className="space-y-2">
              <label className="text-[11px] font-black text-base-content/40 uppercase tracking-[0.2em] ml-1">Email</label>
              <input
                type="email"
                placeholder="ferchouch@gmail.com"
                className="w-full px-5 py-4 bg-base-200/50 border-4 border-base-200 rounded-2xl font-bold focus:border-primary focus:bg-base-100 focus:outline-none transition-all placeholder:opacity-30"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-base-content/40 uppercase tracking-[0.2em] ml-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full px-5 py-4 bg-base-200/50 border-4 border-base-200 rounded-2xl font-bold focus:border-primary focus:bg-base-100 focus:outline-none transition-all pr-12"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-base-content/30 hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOffIcon size={22} /> : <EyeIcon size={22} />}
                </button>
              </div>
            </div>

            {/* THE TACTILE 3D BUTTON */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isPending}
                className="w-full relative group h-16 outline-none"
              >
                <div className="absolute inset-0 bg-primary-focus rounded-2xl translate-y-2 transition-all group-active:translate-y-0 shadow-[0_4px_15px_rgba(88,204,2,0.4)]" />
                <div className={`relative w-full h-full bg-primary text-white font-black text-lg uppercase tracking-widest rounded-2xl flex justify-center items-center border-t-4 border-white/20 transition-all ${isPending ? 'translate-y-2' : 'group-active:translate-y-2'}`}>
                  {isPending ? <span className="loading loading-infinity loading-md"></span> : "Log In"}
                </div>
              </button>
            </div>

            <div className="text-center mt-6">
              <p className="font-bold text-base-content/40 text-sm">
                New to the squad?{" "}
                <Link to="/signup" className="text-primary hover:underline font-black uppercase tracking-wider">Join Sven</Link>
              </p>
            </div>
          </form>
        </div>

        {/* RIGHT: DESKTOP DECORATION */}
        <div className="hidden lg:flex w-1/2 bg-primary/5 items-center justify-center p-12 border-l-4 border-base-300 relative">
          <div className="max-w-md text-center">
            <div className="relative w-80 h-80 mx-auto mb-10 group">
              {/* Animated decorative shapes behind image */}
              <div className="absolute inset-0 bg-primary/20 rounded-[3rem] rotate-12 group-hover:rotate-45 transition-transform duration-1000" />
              <div className="absolute inset-0 bg-secondary/20 rounded-[3rem] -rotate-12 group-hover:-rotate-45 transition-transform duration-1000" />

              <img
                src="/3.jfif"
                alt="Branding"
                className="relative z-10 w-full h-full object-cover rounded-[2.5rem] border-8 border-base-100 shadow-2xl transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            <h2 className="text-4xl font-black text-base-content mb-4 tracking-tighter italic">
              LEARN <span className="text-primary">LOUD.</span>
            </h2>
            <p className="font-bold text-base-content/50 text-xl leading-snug">
              Connect with real people and master new languages through conversation.
            </p>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(15deg); }
        }
      `}} />
    </div>
  );
};

export default LoginPage;