import { useState, useEffect } from "react";
import useAuthUser from "../hooks/useAuthUser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { completeOnboarding } from "../lib/api";
import toast from "react-hot-toast";
import { CameraIcon, MapPinIcon, ShuffleIcon, SparklesIcon } from "lucide-react";
import { LANGUAGES } from "../constants/index.js";
import multiavatar from "@multiavatar/multiavatar";

const OnboardingPage = () => {
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();
  const [formState, setFormState] = useState({
    fullName: authUser?.fullName || "",
    bio: authUser?.bio || "",
    nativeLanguage: authUser?.nativeLanguage || "",
    learningLanguage: authUser?.learningLanguage || "",
    location: authUser?.location || "",
    profilePic: authUser?.profilePic || "",
  });

  const [visualProgress, setVisualProgress] = useState(0);
  useEffect(() => {
    const fields = ['fullName', 'bio', 'nativeLanguage', 'learningLanguage', 'location', 'profilePic'];
    const filled = fields.filter(f => formState[f]?.length > 0).length;
    setVisualProgress((filled / fields.length) * 100);
  }, [formState]);

  const { mutate: OnboardingMutation, isPending } = useMutation({
    mutationFn: completeOnboarding,
    onSuccess: () => {
      toast.success("Profile updated successfully !");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (error) => {
      toast.error(error.response.data.message);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    OnboardingMutation(formState);
  };

  const handleRandomAvatar = () => {
    const index = Math.floor(Math.random() * 100) + 1;
    const avatarSVG = multiavatar(index.toString());

    setFormState({ ...formState, profilePic: avatarSVG });
    const messages = [
      "Looking sharp!", "Ooh, I like this one!", "That's a total vibe!",
      "Fresh and clean!", "Looking good today!", "Suiting you perfectly!",
      "Absolute legend status!", "10/10. No notes.", "New look, who's this?",
      "Is it getting hot in here?", "Stop, you're making the other users jealous.",
      "Fashion icon alert!", "Look out world, here you come!", "This one just clicked!",
      "Style updated!", "Looking futuristic!", "Clean as a whistle.",
      "Minimalist and classy.", "Bold choice. I love it.",
      "That one really brings out your eyes!", "A perfect fit for your new journey.",
      "You wear it well!", "Looking ready to learn!",
      "The community is going to love this look.", "Stunning! Let's save that.",
    ];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    toast.dismiss();
    toast.success(randomMessage);
  };

  return (
    <div className="relative min-h-screen bg-base-200 flex items-center justify-center p-4 sm:p-6 md:p-8 font-sans overflow-hidden">

      {/*  BACKGROUND DECORATION  */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: 'radial-gradient(circle, currentColor 2px, transparent 2px)', backgroundSize: '30px 30px' }} />
      </div>

      {/* MAIN CARD */}
      <div className="relative z-10 w-full max-w-3xl bg-base-100 rounded-[2.5rem] shadow-[0_20px_0_0_#cbd5e1] dark:shadow-[0_20px_0_0_#1e293b] border-4 border-base-300 overflow-hidden transition-all duration-500">

        {/* TOP PROGRESS BAR */}
        <div className="absolute top-0 left-0 w-full h-3 bg-base-300 z-20">
          <div className="h-full bg-primary transition-all duration-700 ease-out" style={{ width: `${visualProgress}%` }} />
        </div>

        <div className="p-6 sm:p-10 md:p-12 pt-10">
          <header className="mb-10 text-center">
            <h1 className="text-3xl md:text-4xl font-[1000] tracking-tight text-base-content uppercase italic">
              Introduce Yourself
            </h1>
            <p className="font-bold text-base-content/50">Let the world know who you are!</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-8">

            {/* AVATAR SECTION */}
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="size-32 rounded-full bg-base-200 border-4 border-base-300 overflow-hidden flex items-center justify-center relative shadow-inner">
                {formState.profilePic ? (
                  <div
                    className="w-full h-full"
                    dangerouslySetInnerHTML={{ __html: formState.profilePic }}
                  />
                ) : (
                  <CameraIcon className="size-12 text-base-content opacity-20" />
                )}
              </div>

              <button
                type="button"
                onClick={handleRandomAvatar}
                className="group relative h-12 px-6 outline-none"
              >
                <div className="absolute inset-0 bg-accent rounded-xl translate-y-1 group-active:translate-y-0 transition-all shadow-[0_4px_0_0_#0000001a]" />
                <div className="relative w-full h-full bg-accent text-accent-content font-black uppercase text-xs tracking-widest rounded-xl flex justify-center items-center border-t-2 border-white/20 transition-all group-active:translate-y-1">
                  <ShuffleIcon className="size-4 mr-2" />
                  Generate Avatar
                </div>
              </button>
            </div>

            {/* FORM GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-[11px] font-black text-base-content/40 uppercase tracking-[0.2em] ml-1">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formState.fullName}
                  onChange={(e) => setFormState({ ...formState, fullName: e.target.value })}
                  className="w-full px-5 py-4 bg-base-200/50 border-4 border-base-200 rounded-2xl font-bold focus:border-primary focus:bg-base-100 focus:outline-none transition-all"
                  placeholder="Full Name"
                />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="text-[11px] font-black text-base-content/40 uppercase tracking-[0.2em] ml-1">Location</label>
                <div className="relative">
                  <MapPinIcon className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-primary" />
                  <input
                    type="text"
                    name="location"
                    value={formState.location}
                    onChange={(e) => setFormState({ ...formState, location: e.target.value })}
                    className="w-full px-5 py-4 pl-12 bg-base-200/50 border-4 border-base-200 rounded-2xl font-bold focus:border-primary focus:bg-base-100 focus:outline-none transition-all"
                    placeholder="City, Country"
                  />
                </div>
              </div>

              {/* Native Language */}
              <div className="space-y-2">
                <label className="text-[11px] font-black text-base-content/40 uppercase tracking-[0.2em] ml-1">Native Language</label>
                <select
                  name="nativeLanguage"
                  value={formState.nativeLanguage}
                  onChange={(e) => setFormState({ ...formState, nativeLanguage: e.target.value })}
                  className="w-full px-5 py-4 bg-base-200/50 border-4 border-base-200 rounded-2xl font-bold focus:border-primary focus:bg-base-100 focus:outline-none transition-all appearance-none"
                >
                  <option value="">Select languages you speak</option>
                  {LANGUAGES.map((lang) => (
                    <option key={`native-${lang}`} value={lang.toLowerCase()}>{lang}</option>
                  ))}
                </select>
              </div>

              {/* Learning Language */}
              <div className="space-y-2">
                <label className="text-[11px] font-black text-base-content/40 uppercase tracking-[0.2em] ml-1">Learning Language</label>
                <select
                  name="learningLanguage"
                  value={formState.learningLanguage}
                  onChange={(e) => setFormState({ ...formState, learningLanguage: e.target.value })}
                  className="w-full px-5 py-4 bg-base-200/50 border-4 border-base-200 rounded-2xl font-bold focus:border-primary focus:bg-base-100 focus:outline-none transition-all appearance-none"
                >
                  <option value="">What language are you practicing?</option>
                  {LANGUAGES.map((lang) => (
                    <option key={`learning-${lang}`} value={lang.toLowerCase()}>{lang}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <label className="text-[11px] font-black text-base-content/40 uppercase tracking-[0.2em] ml-1">Bio</label>
              <textarea
                name="bio"
                value={formState.bio}
                onChange={(e) => setFormState({ ...formState, bio: e.target.value })}
                className="w-full px-5 py-4 bg-base-200/50 border-4 border-base-200 rounded-2xl font-bold focus:border-primary focus:bg-base-100 focus:outline-none transition-all h-32 resize-none"
                placeholder="Tell the community about yourself..."
              />
            </div>

            {/* SUBMIT BUTTON */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isPending}
                className="w-full relative group h-16 outline-none"
              >
                <div className="absolute inset-0 bg-primary-focus rounded-2xl translate-y-2 group-active:translate-y-0 transition-all" />
                <div className={`relative w-full h-full bg-primary text-white font-black text-lg uppercase tracking-widest rounded-2xl flex justify-center items-center border-t-4 border-white/20 transition-all ${isPending ? 'translate-y-2' : 'group-active:translate-y-2'}`}>
                  {isPending ? (
                    <span className="loading loading-infinity loading-md"></span>
                  ) : (
                    "Complete My Profile"
                  )}
                </div>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;