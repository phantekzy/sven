import { Link } from "react-router";
import { LANGUAGE_TO_FLAG } from "../constants";
import { MapPinIcon, MessageSquareIcon } from "lucide-react";

const FriendCard = ({ friend }) => {
  return (
    <div className="card bg-base-200 border border-base-300 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
      <div className="card-body p-6 space-y-5">
        <div className="flex items-center gap-4">
          <div className="avatar">
            <div className="size-16 rounded-full ring-2 ring-primary/10 ring-offset-base-100 ring-offset-2 shadow-inner">
              <div className="w-full h-full bg-base-300" dangerouslySetInnerHTML={{ __html: friend.profilePic }} />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-primary truncate">{friend.fullName}</h3>
            {friend.location && (
              <div className="flex items-center text-xs font-medium text-secondary/80 mt-1">
                <MapPinIcon className="size-3.5 mr-1" /> {friend.location}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="badge h-auto py-1.5 px-3 bg-secondary/10 border-secondary/20 text-secondary gap-2 rounded-lg">
            <span className="text-base">{getLanguageFlag(friend.nativeLanguage)}</span>
            <span className="text-[10px] font-bold uppercase tracking-tight">Native: {friend.nativeLanguage}</span>
          </div>
          <div className="badge h-auto py-1.5 px-3 bg-primary/10 border-primary/20 text-primary gap-2 rounded-lg">
            <span className="text-base">{getLanguageFlag(friend.learningLanguage)}</span>
            <span className="text-[10px] font-bold uppercase tracking-tight">Learning: {friend.learningLanguage}</span>
          </div>
        </div>

        <Link to={`/chat/${friend._id}`} className="btn btn-primary w-full mt-2">
          <MessageSquareIcon className="size-4 mr-2" />
          Message
        </Link>
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
        className="w-5 h-auto object-contain"
      />
    );
  }
  return null;
}