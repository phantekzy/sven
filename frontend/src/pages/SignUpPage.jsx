import { EyeIcon, EyeOffIcon, ShipWheelIcon, SparklesIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router";
import useSignup from "../hooks/useSignup";
import { useThemeStore } from "../store/useThemeStore";

const SignUpPage = () => {
  const { theme } = useThemeStore();
  const [showPassword, setShowPassword] = useState(false);
  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [progress, setProgress] = useState(0);

  const { isPending, error, signupMutation } = useSignup();

  useEffect(() => {
    let score = 0;
    if (signupData.fullName.length > 2) score += 33.3;
    if (signupData.email.includes("@")) score += 33.3;
    if (signupData.password.length >= 6) score += 33.4;
    setProgress(score);
  }, [signupData]);

  const handleSignup = (e) => {
    e.preventDefault();
    signupMutation(signupData);
  };

  return (
    <div
      className="relative min-h-screen bg-base-200 flex items-center justify-center p-4 sm:p-6 md:p-8 font-sans selection:bg-primary selection:text-primary-content overflow-hidden"
      data-theme={theme}
    >
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: 'radial-gradient(circle, currentColor 2px, transparent 2px)', backgroundSize: '30px 30px' }} />

        <div className="absolute top-[5%] left-[5%] text-4xl md:text-7xl font-black text-primary/20 animate-[float_6s_ease-in-out_infinite]">A</div>
        <div className="absolute top-[12%] right-[8%] text-5xl md:text-8xl font-black text-secondary/20 animate-[float_9s_ease-in-out_infinite_reverse]">文</div>
        <div className="absolute top-[45%] left-[2%] text-3xl md:text-6xl font-black text-accent/20 animate-[float_7s_ease-in-out_infinite_1s]">Б</div>
        <div className="absolute bottom-[15%] left-[8%] text-5xl md:text-9xl font-black text-primary/10 animate-[float_11s_ease-in-out_infinite_0.5s]">Ω</div>
        <div className="absolute bottom-[8%] right-[5%] text-4xl md:text-8xl font-black text-secondary/10 animate-[float_13s_ease-in-out_infinite]">ñ</div>
      </div>

      <div className="relative z-10 w-full max-w-5xl bg-base-100 rounded-[2.5rem] flex flex-col lg:flex-row shadow-[0_20px_0_0_#cbd5e1] dark:shadow-[0_20px_0_0_#1e293b] border-4 border-base-300 overflow-hidden">

        <div className="absolute top-0 left-0 w-full h-3 bg-base-300 z-20">
          <div className="h-full bg-primary transition-all duration-700 ease-out" style={{ width: `${progress}%` }} />
        </div>

        {/* LEFT SIDE: FORM */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 flex flex-col justify-center bg-base-100 relative pt-12">

          {/* LOGO */}
          <div className="mb-8 flex items-center justify-start gap-3">
            <div className="bg-primary p-2.5 rounded-2xl shadow-[0_4px_0_0_#45a001] text-white">
              <ShipWheelIcon className="size-8" strokeWidth={2.5} />
            </div>
            <span className="text-4xl font-black tracking-tighter text-primary">Sven</span>
          </div>

          {error && (
            <div className="bg-error/10 border-2 border-error text-error px-4 py-3 rounded-2xl font-bold mb-6 flex items-center gap-2 animate-shake">
              <SparklesIcon className="size-5 shrink-0" />
              <span className="text-xs">{error.response?.data?.message || "Something went wrong"}</span>
            </div>
          )}

          <div className="mb-6">
            <h2 className="text-3xl font-[1000] tracking-tight mb-2 uppercase italic text-base-content">Create Account</h2>
            <p className="font-bold text-base-content/50">Join the squad and start your mission!</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-base-content/40 uppercase tracking-[0.2em] ml-1">Full Name</label>
              <input
                type="text"
                placeholder="What should we call you?"
                className="input-field" 
                value={signupData.fullName}
                onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-base-content/40 uppercase tracking-[0.2em] ml-1">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="input-field"
                value={signupData.email}
                onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-base-content/40 uppercase tracking-[0.2em] ml-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 6 characters"
                  className="input-field pr-12"
                  value={signupData.password}
                  onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
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

            {/* Terms Checkbox */}
            <div className="pt-2">
              <label className="label cursor-pointer justify-start gap-3 group">
                <input type="checkbox" className="checkbox checkbox-primary rounded-lg border-2" required />
                <span className="text-[11px] font-bold opacity-60 leading-tight group-hover:opacity-100 transition-opacity">
                  I agree to the <span className="text-primary underline">Terms</span> & <span className="text-primary underline">Privacy Policy</span>
                </span>
              </label>
            </div>

            {/* 3D SUBMIT BUTTON */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isPending}
                className="w-full relative group h-16 outline-none"
              >
                <div className="absolute inset-0 bg-primary-focus rounded-2xl translate-y-2 group-active:translate-y-0 transition-all shadow-[0_4px_15px_rgba(88,204,2,0.3)]" />
                <div className={`relative w-full h-full bg-primary text-white font-black text-lg uppercase tracking-widest rounded-2xl flex justify-center items-center border-t-4 border-white/20 transition-all ${isPending ? 'translate-y-2' : 'group-active:translate-y-2'}`}>
                  {isPending ? <span className="loading loading-infinity loading-md"></span> : "Join Sven"}
                </div>
              </button>
            </div>

            <p className="text-center font-bold text-base-content/40 text-sm mt-4">
              Already a member?{" "}
              <Link to="/login" className="text-primary hover:underline font-black uppercase tracking-wider">Sign In</Link>
            </p>
          </form>
        </div>

        {/* RIGHT SIDE: ILLUSTRATION */}
        <div className="hidden lg:flex w-1/2 bg-primary/5 items-center justify-center p-12 border-l-4 border-base-300 relative">
          <div className="max-w-md text-center">
            <div className="relative w-80 h-80 mx-auto mb-8 group">
              <div className="absolute inset-0 bg-primary/20 rounded-[3rem] rotate-12 group-hover:rotate-45 transition-transform duration-1000" />
              <div className="absolute inset-0 bg-secondary/20 rounded-[3rem] -rotate-12 group-hover:-rotate-45 transition-transform duration-1000" />
              <img
                src="/2.jfif"
                alt="Branding"
                className="relative z-10 w-full h-full object-cover rounded-[2.5rem] border-8 border-base-100 shadow-2xl transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <h2 className="text-3xl font-black text-base-content mb-4 tracking-tighter italic">
              MASTER <span className="text-primary">TONGUES.</span>
            </h2>
            <p className="font-bold text-base-content/50 text-lg leading-snug">
              Turn every conversation into a lesson. Reach fluency faster with new friends.
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
        .input-field {
          width: 100%;
          padding: 1rem 1.25rem;
          background-color: rgba(var(--b2), 0.5);
          border: 4px solid rgba(var(--b2), 1);
          border-radius: 1rem;
          font-weight: 700;
          transition: all 0.2s;
          outline: none;
        }
        .input-field:focus {
          border-color: #58cc02;
          background-color: white;
        }
      `}} />
    </div>
  );
};

export default SignUpPage;