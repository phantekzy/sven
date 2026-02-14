import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, useMemo, useRef } from "react";
import { toast } from "sonner";
import {
  getOutgoingFriendReqs,
  getRecommendedUsers,
  getUserFriends,
  sendFriendRequest,
  getFriendsRequests,
  acceptFriendRequest,
  rejectFriendRequest,
} from "../lib/api";
import { Link, useNavigate } from "react-router";
import {
  MapPinIcon,
  ShipWheelIcon,
  UserIcon,
  SearchIcon,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  SearchX,
  Search,
  Bell,
  MessageCircle,
  Filter
} from "lucide-react";
import FriendCard, { getLanguageFlag } from "../components/FriendCard";
import NoFriendsFound from "../components/NoFriendsFound";

const HomePage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const prevIncomingCount = useRef(null);

  const [outgoingRequestsids, setOutgoingRequestsIds] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [friendSearchQuery, setFriendSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("All");

  const { data: friends = [], isLoading: loadingFriends } = useQuery({ queryKey: ["friends"], queryFn: getUserFriends });
  const { data: recommendedUsers = [], isLoading: loadingUsers } = useQuery({ queryKey: ["users"], queryFn: getRecommendedUsers });
  const { data: outgoingFriendReqs } = useQuery({ queryKey: ["outgoingFriendReqs"], queryFn: getOutgoingFriendReqs });
  const { data: friendRequests } = useQuery({ queryKey: ["friendRequests"], queryFn: getFriendsRequests });

  const pendingCount = friendRequests?.incomingReqs?.length || 0;

  // MUTATIONS WITH STYLIZED TOASTS 
  const { mutate: sendRequestMutation, isPending } = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] });
      const targetUser = recommendedUsers.find(u => u._id === variables);
      toast.custom((t) => (
        <div className="relative group animate-in slide-in-from-right-5 w-[90vw] md:w-auto mx-auto">
          <div className="absolute inset-0 bg-info rounded-2xl translate-y-1.5 translate-x-1" />
          <div className="relative bg-base-100 border-2 border-info p-4 rounded-2xl flex items-center gap-4 min-w-[300px]">
            <div className="size-12 rounded-xl bg-base-200 border-b-4 border-base-300 overflow-hidden"
              dangerouslySetInnerHTML={{ __html: targetUser?.profilePic }} />
            <div className="flex-1 text-left">
              <p className="font-black text-info uppercase text-[10px] tracking-widest">Invitation Sent</p>
              <p className="font-bold text-sm">Request sent to {targetUser?.fullName}</p>
            </div>
            <button onClick={() => toast.dismiss(t)} className="btn btn-ghost btn-xs btn-circle"><X size={14} /></button>
          </div>
        </div>
      ));
    },
  });

  const { mutate: acceptRequestMutation } = useMutation({
    mutationFn: acceptFriendRequest,
    onMutate: async (variables) => {
      const request = friendRequests?.incomingReqs?.find(r => r._id === variables);
      return { senderName: request?.sender?.fullName };
    },
    onSuccess: (data, variables, context) => {
      toast.dismiss();
      queryClient.invalidateQueries({ queryKey: ["friendRequests"], queryKey: ["friends"], queryKey: ["users"] });
      toast.custom((t) => (
        <div className="relative animate-in zoom-in-95 w-[90vw] md:w-auto mx-auto">
          <div className="absolute inset-0 bg-success rounded-2xl translate-y-1.5 translate-x-1" />
          <div className="relative bg-base-100 border-2 border-success p-4 rounded-2xl flex items-center gap-4 min-w-[300px]">
            <div className="size-10 bg-success rounded-full flex items-center justify-center text-white shrink-0">
              <Check size={20} strokeWidth={4} />
            </div>
            <div className="flex-1 text-left">
              <p className="font-black text-success uppercase text-[10px] tracking-widest leading-none mb-1">Squad Updated!</p>
              <p className="font-bold text-sm">You're now friends with {context?.senderName}!</p>
            </div>
          </div>
        </div>
      ), { duration: 3000 });
    }
  });

  const { mutate: declineRequestMutation } = useMutation({
    mutationFn: rejectFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      toast.dismiss();
    }
  });

  //  INCOMING REQUEST TOAST 
  useEffect(() => {
    const incoming = friendRequests?.incomingReqs || [];
    if (prevIncomingCount.current !== null && incoming.length > prevIncomingCount.current) {
      const newReq = incoming[0];
      toast.custom((t) => (
        <div className="relative group animate-in slide-in-from-top-5 w-[95vw] md:w-auto mx-auto">
          <div className="absolute inset-0 bg-primary rounded-2xl translate-y-2 translate-x-1" />
          <div className="relative bg-base-100 border-2 border-primary p-5 rounded-2xl flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="size-14 rounded-2xl bg-base-200 border-b-4 border-base-300 overflow-hidden"
                dangerouslySetInnerHTML={{ __html: newReq.sender.profilePic }} />
              <div className="flex-1 text-left">
                <p className="font-black text-primary uppercase text-[10px] tracking-widest mb-1">New Invite!</p>
                <p className="font-bold text-lg leading-tight">{newReq.sender.fullName}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { declineRequestMutation(newReq._id); toast.dismiss(t); }} className="flex-1 py-2.5 rounded-xl font-black uppercase text-[10px] border-2 border-base-300">Later</button>
              <button onClick={() => { acceptRequestMutation(newReq._id); toast.dismiss(t); }} className="flex-1 py-2.5 rounded-xl font-black uppercase text-[10px] bg-primary text-primary-content shadow-[0_4px_0_0_#4aab02]">Accept</button>
            </div>
          </div>
        </div>
      ), { duration: Infinity });
    }
    prevIncomingCount.current = incoming.length;
  }, [friendRequests]);

  //  LOGIC 
  const filteredFriends = useMemo(() => friends.filter(f => f.fullName.toLowerCase().includes(friendSearchQuery.toLowerCase())), [friends, friendSearchQuery]);
  const filteredUsers = useMemo(() => recommendedUsers.filter((u) => {
    const matchSearch = u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || u.bio?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchLang = selectedLanguage === "All" || u.nativeLanguage === selectedLanguage;
    return matchSearch && matchLang;
  }), [recommendedUsers, searchQuery, selectedLanguage]);

  const availableLanguages = useMemo(() => ["All", ...Array.from(new Set(recommendedUsers.map(u => u.nativeLanguage)))], [recommendedUsers]);

  const incomingRequestMap = useMemo(() => {
    const map = new Map();
    friendRequests?.incomingReqs?.forEach((req) => map.set(req.sender._id, req._id));
    return map;
  }, [friendRequests]);

  useEffect(() => {
    if (outgoingFriendReqs) setOutgoingRequestsIds(new Set(outgoingFriendReqs.map(r => r.recipient._id)));
  }, [outgoingFriendReqs]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - (clientWidth * 0.8) : scrollLeft + (clientWidth * 0.8);
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen bg-base-100 max-w-[100vw] overflow-x-hidden pb-32">

      {/* DESKTOP FLOATING BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden hidden md:block">
        <div className="absolute top-20 left-[5%] animate-[float_8s_infinite] text-primary/20 font-black text-9xl select-none">A</div>
        <div className="absolute top-[40%] left-[85%] animate-[float_12s_infinite] text-secondary/20 font-black text-[12rem] select-none opacity-30">文</div>
      </div>

      {/* MOBILE HEADER */}
      <div className="md:hidden sticky top-0 z-50 bg-base-100/90 backdrop-blur-md px-4 py-4 border-b border-base-200 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-base-200 rounded-full"><ChevronLeft size={24} /></button>
        <h1 className="flex-1 text-xl font-black italic text-primary tracking-tighter">STUDYSQUAD</h1>
        <Link to="/notifications" className="relative p-2 bg-base-200 rounded-full">
          <Bell size={20} />
          {pendingCount > 0 && <span className="absolute -top-1 -right-1 size-5 bg-primary rounded-full border-2 border-base-100 text-[10px] flex items-center justify-center font-bold">{pendingCount}</span>}
        </Link>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-10">

        {/* DESKTOP HEADER */}
        <header className="hidden md:flex flex-col md:flex-row items-center justify-between gap-8 py-10 text-center md:text-left">
          <div className="space-y-2">
            <h1 className="text-6xl font-[1000] tracking-tighter text-base-content leading-none">
              STUDY <span className="text-primary italic drop-shadow-sm">SQUAD</span>
            </h1>
          </div>
          <Link to="/notifications" className="relative group active:translate-y-1 transition-all">
            <div className="absolute inset-0 bg-base-300 rounded-full translate-y-2" />
            <div className="relative bg-base-200 border-2 border-base-300 px-10 py-4 rounded-full font-black uppercase tracking-widest text-sm flex items-center gap-3">
              <UserIcon className="size-4" />
              Requests {pendingCount > 0 && <span className="badge badge-primary">{pendingCount}</span>}
            </div>
          </Link>
        </header>

        {/* FRIENDS SECTION */}
        <section className="mt-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-1">
            <div className="space-y-4">
              <h2 className="text-lg md:text-2xl font-black flex items-center gap-3">
                <div className="size-3 md:size-4 bg-success rounded-full animate-pulse" />
                Your Friends
              </h2>
              <div className="relative w-full md:w-72 group">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 opacity-30" />
                <input
                  type="text" placeholder="Search friends..." value={friendSearchQuery}
                  onChange={(e) => setFriendSearchQuery(e.target.value)}
                  className="input input-sm w-full pl-9 bg-base-200 border-2 border-base-300 md:border-none rounded-xl font-bold"
                />
              </div>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <button onClick={() => scroll('left')} className="btn btn-circle btn-sm bg-base-200 border-base-300"><ChevronLeft size={16} /></button>
              <button onClick={() => scroll('right')} className="btn btn-circle btn-sm bg-base-200 border-base-300"><ChevronRight size={16} /></button>
            </div>
          </div>

          <div ref={scrollRef} className="flex gap-4 md:gap-8 overflow-x-auto pb-4 scrollbar-hide snap-x mask-fade-edges">
            {loadingFriends ? <div className="loading loading-sm" /> :
              filteredFriends.length === 0 ? <div className="py-4 opacity-40 text-sm font-bold w-full text-center flex items-center justify-center">No friends found</div> : (
                filteredFriends.map((f) => (
                  <div key={f._id} className="snap-start shrink-0 cursor-pointer" onClick={() => navigate(`/chat/${f._id}`)}>
                    {/* MOBILE CIRCLE VIEW */}
                    <div className="md:hidden flex flex-col items-center gap-1 w-20">
                      <div className="size-16 rounded-2xl bg-success/10 border-2 border-success/20 p-1 overflow-hidden" dangerouslySetInnerHTML={{ __html: f.profilePic }} />
                      <span className="text-[10px] font-bold truncate w-full text-center uppercase">{f.fullName.split(' ')[0]}</span>
                    </div>
                    {/* DESKTOP CARD VIEW */}
                    <div className="hidden md:block w-80 hover:rotate-1 transition-transform">
                      <FriendCard friend={f} />
                    </div>
                  </div>
                ))
              )}
          </div>
        </section>

        {/* DISCOVERY SECTION */}
        <section className="mt-10 md:mt-24 space-y-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <h2 className="text-2xl md:text-4xl font-black uppercase italic tracking-tight">Expand Your World</h2>
            <div className="flex gap-2 w-full md:max-w-xl">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 md:size-5 opacity-20" />
                <input
                  type="text" placeholder="Search new learners..." value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input input-bordered w-full pl-10 md:pl-12 bg-base-200 border-2 border-base-300 rounded-2xl font-bold h-12 md:h-14 focus:border-primary focus:outline-none"
                />
              </div>
              <div className="dropdown dropdown-end">
                <button tabIndex={0} className="btn h-12 md:h-14 bg-base-200 border-2 border-base-300 rounded-2xl px-4">
                  <Filter size={18} className={selectedLanguage !== "All" ? "text-primary" : "opacity-30"} />
                </button>
                <ul tabIndex={0} className="dropdown-content z-[20] menu p-2 shadow-2xl bg-base-100 border-2 border-base-300 rounded-2xl w-52 mt-2">
                  {availableLanguages.map(lang => (
                    <li key={lang}><button onClick={() => setSelectedLanguage(lang)} className={selectedLanguage === lang ? "bg-primary text-white" : "font-bold"}>{lang}</button></li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-16">
            {loadingUsers ? <div className="col-span-full text-center py-20"><span className="loading loading-spinner loading-lg"></span></div> :
              filteredUsers.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in-95 duration-500">
                  <div className="size-24 bg-base-200 rounded-[2rem] flex items-center justify-center mb-6 border-b-8 border-base-300">
                    <SearchX size={40} className="opacity-20" />
                  </div>
                  <h3 className="text-2xl font-black opacity-40 uppercase tracking-tighter">No Users Found</h3>
                  <p className="text-sm font-bold opacity-20 mt-2">Try adjusting your search or filters!</p>
                </div>
              ) : (
                filteredUsers.map((user, index) => {
                  const hasSent = outgoingRequestsids.has(user._id);
                  const incomingId = incomingRequestMap.get(user._id);
                  return (
                    <div key={user._id} className="relative group">

                      {/* MOBILE LIST ITEM  */}
                      <div className="flex flex-col bg-base-200/50 rounded-[2rem] p-5 border border-base-200 md:hidden">
                        <div className="flex items-center gap-4">
                          <div className="size-16 rounded-2xl overflow-hidden bg-base-100 shrink-0 border-b-4 border-base-300" dangerouslySetInnerHTML={{ __html: user.profilePic }} />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-black text-lg truncate">{user.fullName}</h3>
                            <p className="text-[10px] font-bold opacity-50 flex items-center gap-1 uppercase tracking-widest"><MapPinIcon size={10} /> {user.location || "Online"}</p>
                          </div>
                          {incomingId ? (
                            <button onClick={() => acceptRequestMutation(incomingId)} className="btn btn-circle btn-primary btn-sm"><Check size={16} /></button>
                          ) : (
                            <button disabled={hasSent || isPending} onClick={() => sendRequestMutation(user._id)} className={`btn btn-circle btn-sm ${hasSent ? 'bg-base-300' : 'btn-primary'}`}>
                              {hasSent ? <Check size={16} /> : <UserIcon size={18} />}
                            </button>
                          )}
                        </div>
                        <p className="mt-3 text-xs opacity-70 line-clamp-2 leading-relaxed italic">{user.bio || "No bio yet..."}</p>
                      </div>

                      {/* DESKTOP LARGE CARD */}
                      <div className="hidden md:block h-full transition-all" style={{ animation: `cardFloat 5s ease-in-out infinite`, animationDelay: `${index * 0.3}s` }}>
                        <div className="absolute inset-0 bg-base-300 rounded-[3rem] translate-y-3" />
                        <div className="relative h-full bg-base-100 border-2 border-base-300 rounded-[3rem] p-8 flex flex-col space-y-6 overflow-hidden">
                          <div className="flex flex-col items-center gap-4">
                            <div className="size-28 rounded-[2.2rem] bg-base-200 p-1 border-b-8 border-base-300 overflow-hidden" dangerouslySetInnerHTML={{ __html: user.profilePic }} />
                            <div className="text-center space-y-1">
                              <h3 className="text-2xl font-black">{user.fullName}</h3>
                              <span className="text-[10px] font-bold opacity-30 flex items-center justify-center gap-1 uppercase tracking-widest"><MapPinIcon className="size-3" /> {user.location || "Online"}</span>
                            </div>
                          </div>

                          <p className="text-sm font-medium opacity-60 italic text-center line-clamp-2 min-h-[2.5rem]">{user.bio || "Hi! Let's study."}</p>

                          <div className="flex items-center justify-between p-4 bg-base-200/50 rounded-3xl border-2 border-dashed border-base-300">
                            <div className="text-center"><span className="text-[8px] font-black opacity-30 block">NATIVE</span>{getLanguageFlag(user.nativeLanguage)}</div>
                            <ShipWheelIcon className="size-6 text-primary animate-spin-slow" />
                            <div className="text-center"><span className="text-[8px] font-black text-primary/60 block">LEARNING</span>{getLanguageFlag(user.learningLanguage)}</div>
                          </div>

                          <div className="w-full">
                            {incomingId ? (
                              <div className="flex gap-2">
                                <button onClick={() => declineRequestMutation(incomingId)} className="flex-1 py-3 font-black text-xs opacity-40 hover:opacity-100">Later</button>
                                <button onClick={() => acceptRequestMutation(incomingId)} className="flex-1 relative active:translate-y-1 transition-all">
                                  <div className="absolute inset-0 bg-primary-focus rounded-2xl translate-y-1" />
                                  <div className="relative bg-primary text-primary-content rounded-2xl py-4 font-black uppercase text-xs text-center">Accept</div>
                                </button>
                              </div>
                            ) : (
                              <button disabled={hasSent || isPending} onClick={() => sendRequestMutation(user._id)} className={`relative w-full transition-all active:translate-y-2`}>
                                {!hasSent && <div className="absolute inset-0 bg-primary-focus rounded-[1.5rem] translate-y-2" />}
                                <div className={`relative w-full py-5 rounded-[1.5rem] font-black uppercase text-xs tracking-[0.2em] border-t border-white/10 flex items-center justify-center ${hasSent ? "bg-base-200 text-base-content/20" : "bg-primary text-primary-content"}`}>
                                  {hasSent ? "Sent ✨" : "Add Friend"}
                                </div>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )
            }
          </div>
        </section>
      </div>

      {/* MOBILE NAV BAR */}
      <div className="md:hidden fixed bottom-6 left-4 right-4 z-50">
        <div className="bg-neutral text-neutral-content rounded-2xl p-2 flex justify-around items-center shadow-2xl border border-white/10 backdrop-blur-md">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="p-3 bg-white/10 rounded-xl"><Search size={22} /></button>
          <button onClick={() => navigate('/chat')} className="p-3"><MessageCircle size={22} /></button>
          <button onClick={() => navigate('/friends')} className="p-3"><UserIcon size={22} /></button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .mask-fade-edges { mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent); }
        @keyframes float { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-30px) rotate(5deg); } }
        @keyframes cardFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
      `}} />
    </div>
  );
};

export default HomePage;
//dasad