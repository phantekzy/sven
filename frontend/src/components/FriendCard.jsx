import { Link } from "react-router";
import { LANGUAGE_TO_FLAG } from "../constants";
import { MapPinIcon, MessageSquareIcon, Sparkles, Languages } from "lucide-react";

const FriendCard = ({ friend }) => {
  return (
    <div className="group relative bg-base-200 rounded-[2rem] border border-base-300 p-3 transition-all duration-500 hover:bg-base-100 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:-translate-y-2 overflow-hidden">

      <div className="absolute -top-10 -right-10 size-32 bg-primary/10 blur-3xl group-hover:bg-primary/20 transition-colors" />

      <div className="relative space-y-4">
        {/* Profile Section */}
        <div className="relative p-4 flex flex-col items-center">
          <div className="relative">
            <div className="size-24 rounded-[1.75rem] rotate-3 group-hover:rotate-0 transition-transform duration-500 bg-gradient-to-tr from-primary to-secondary p-[2px]">
              <div className="w-full h-full rounded-[1.65rem] bg-base-200 overflow-hidden flex items-center justify-center">
                <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: friend.profilePic }} />
              </div>
            </div>
            {/* Status Indicator */}
            <div className="absolute -bottom-1 -right-1 size-5 bg-base-100 rounded-full flex items-center justify-center shadow-sm">
              <div className="size-3 bg-success rounded-full animate-pulse" />
            </div>
          </div>

          <div className="mt-4 text-center">
            <h3 className="text-xl font-black text-base-content tracking-tight group-hover:text-primary transition-colors">
              {friend.fullName}
            </h3>
            {friend.location && (
              <div className="flex items-center justify-center gap-1 mt-1 opacity-60">
                <MapPinIcon className="size-3" />
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  {friend.location}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Language Section  */}
        <div className="mx-2 p-4 rounded-[1.5rem] bg-base-300/30 backdrop-blur-md border border-white/5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black uppercase tracking-widest opacity-40 flex items-center gap-1">
              <Languages className="size-3" /> Languages
            </span>
            <Sparkles className="size-3 text-secondary animate-bounce" />
          </div>

          <div className="space-y-3">
            {/* Native Row */}
            <div className="flex items-center justify-between group/row">
              <span className="text-[10px] font-bold opacity-60">Native</span>
              <div className="flex items-center gap-2 bg-base-100 px-3 py-1.5 rounded-xl border border-base-300 shadow-sm transition-all group-hover/row:border-secondary/50">
                {getLanguageFlag(friend.nativeLanguage)}
                <span className="text-xs font-black uppercase">{friend.nativeLanguage}</span>
              </div>
            </div>

            {/* Learning Row */}
            <div className="flex items-center justify-between group/row">
              <span className="text-[10px] font-bold opacity-60">Target</span>
              <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/20 transition-all group-hover/row:scale-105">
                {getLanguageFlag(friend.learningLanguage)}
                <span className="text-xs font-black uppercase text-primary">{friend.learningLanguage}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button  */}
        <div className="p-2">
          <Link
            to={`/chat/${friend._id}`}
            className="relative flex items-center justify-center gap-3 w-full py-4 bg-base-content text-base-100 rounded-[1.5rem] font-black uppercase text-xs tracking-[0.2em] transition-all duration-300 hover:bg-primary hover:shadow-[0_10px_20px_rgba(var(--p),0.3)] group-hover:scale-[1.02]"
          >
            <MessageSquareIcon className="size-4" />
            Connect
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FriendCard;

export function getLanguageFlag(language) {
  if (!language) return null;
  const langLower = language.toLowerCase();
  const countryCode = LANGUAGE_TO_FLAG[langLower];
  if (countryCode) {
    return (
      <img
        src={`https://flagcdn.com/24x18/${countryCode}.png`}
        alt={`${langLower} flag`}
        className="w-5 h-auto object-contain rounded-[3px] grayscale-[0.2] group-hover:grayscale-0 transition-all"
      />
    );
  }
  return null;
}