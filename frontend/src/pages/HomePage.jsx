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
  UserIcon,
  SearchIcon,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Filter,
  Languages
} from "lucide-react";
import FriendCard, { getLanguageFlag } from "../components/FriendCard";

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

  // MUTATIONS
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

  // INCOMING TOAST
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

  // DATA LOGIC
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
    <div className="relative min-h-screen bg-base-100 max-w-[100vw] overflow-x-hidden pb-10">

      {/* MOBILE HEADER */}
      <div className="md:hidden px-4 py-6 border-b border-base-200 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-base-200 rounded-full"><ChevronLeft size={24} /></button>
        <h1 className="text-xl font-black italic text-primary tracking-tighter">STUDYSQUAD</h1>
        <div className="w-10" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-10">

        {/* DESKTOP HEADER */}
        <header className="hidden md:flex items-center justify-between py-10">
          <h1 className="text-6xl font-[1000] tracking-tighter text-base-content leading-none">
            STUDY <span className="text-primary italic">SQUAD</span>
          </h1>
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
            <div className="flex items-center justify-between w-full">
              <h2 className="text-lg md:text-2xl font-black flex items-center gap-3 italic opacity-80">/your-squad</h2>

              {/* SLIDER CONTROLS - POSITIONED RIGHT */}
              <div className="flex gap-2">
                <button
                  onClick={() => scroll('left')}
                  className="btn btn-circle btn-xs bg-base-200 border-none hover:bg-primary hover:text-white transition-all active:scale-90"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={() => scroll('right')}
                  className="btn btn-circle btn-xs bg-base-200 border-none hover:bg-primary hover:text-white transition-all active:scale-90"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            <div className="relative w-full md:w-72">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 opacity-30" />
              <input
                type="text" placeholder="Filter squad..." value={friendSearchQuery}
                onChange={(e) => setFriendSearchQuery(e.target.value)}
                className="input input-sm w-full pl-9 bg-base-200 border-none rounded-xl font-bold"
              />
            </div>
          </div>

          <div ref={scrollRef} className="flex gap-4 md:gap-8 overflow-x-auto pb-4 scrollbar-hide snap-x mask-fade-edges">
            {loadingFriends ? <div className="loading loading-sm" /> :
              filteredFriends.length === 0 ? <div className="py-4 opacity-20 text-xs font-black uppercase w-full text-center">No friends online</div> : (
                filteredFriends.map((f) => (
                  <div key={f._id} className="snap-start shrink-0 cursor-pointer" onClick={() => navigate(`/chat/${f._id}`)}>
                    <div className="md:hidden flex flex-col items-center gap-1 w-20">
                      <div className="size-16 rounded-2xl bg-base-200 border-b-4 border-base-300 p-1 overflow-hidden" dangerouslySetInnerHTML={{ __html: f.profilePic }} />
                      <span className="text-[10px] font-black truncate w-full text-center uppercase opacity-60">{f.fullName.split(' ')[0]}</span>
                    </div>
                    <div className="hidden md:block w-80 hover:-translate-y-1 transition-transform">
                      <FriendCard friend={f} />
                    </div>
                  </div>
                ))
              )}
          </div>
        </section>

        {/* DISCOVERY SECTION */}
        <section className="mt-10 md:mt-20 space-y-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <h2 className="text-3xl md:text-5xl font-[1000] uppercase italic tracking-tighter">Explore <span className="text-primary">New</span></h2>
            <div className="flex gap-2 w-full md:max-w-xl">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 size-5 opacity-20" />
                <input
                  type="text" placeholder="Search by name or bio..." value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input w-full pl-12 bg-base-200 border-none rounded-3xl font-bold h-14"
                />
              </div>
              <div className="dropdown dropdown-end">
                <button tabIndex={0} className="btn h-14 bg-base-200 border-none rounded-3xl px-5">
                  <Filter size={20} className={selectedLanguage !== "All" ? "text-primary" : "opacity-30"} />
                </button>
                <ul tabIndex={0} className="dropdown-content z-[20] menu p-2 shadow-2xl bg-base-100 border-2 border-base-300 rounded-2xl w-52 mt-2 font-black uppercase text-xs">
                  {availableLanguages.map(lang => (
                    <li key={lang}><button onClick={() => setSelectedLanguage(lang)} className={selectedLanguage === lang ? "bg-primary text-white" : ""}>{lang}</button></li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {loadingUsers ? <div className="col-span-full text-center py-20"><span className="loading loading-spinner loading-lg text-primary"></span></div> :
              filteredUsers.length === 0 ? (
                <div className="col-span-full text-center py-20 opacity-20 font-black text-3xl italic">NO LEARNERS FOUND</div>
              ) : (
                filteredUsers.map((user, index) => {
                  const hasSent = outgoingRequestsids.has(user._id);
                  const incomingId = incomingRequestMap.get(user._id);
                  return (
                    <div key={user._id} className="relative group flex flex-col h-full">
                      <div className="absolute inset-0 bg-base-200 rounded-[2.5rem] translate-y-2 group-hover:translate-y-3 transition-transform" />

                      <div className="relative h-full bg-base-100 border-2 border-base-200 p-6 md:p-8 rounded-[2.5rem] flex flex-col gap-6 group-hover:-translate-y-1 transition-transform">

                        {/* HEADER: AVATAR & INFO */}
                        <div className="flex items-center gap-5">
                          <div className="size-20 md:size-24 rounded-[2rem] bg-base-200 p-1 border-b-4 border-base-300 overflow-hidden shrink-0"
                            dangerouslySetInnerHTML={{ __html: user.profilePic }} />
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl md:text-2xl font-[1000] tracking-tight truncate uppercase leading-none mb-1">{user.fullName}</h3>
                            <div className="flex items-center gap-1 opacity-40 font-black text-[10px] uppercase tracking-widest">
                              <MapPinIcon size={12} className="text-primary" /> {user.location || "Earth"}
                            </div>
                          </div>
                        </div>

                        {/* BIO */}
                        <p className="text-sm font-medium opacity-60 italic line-clamp-2 h-10 leading-relaxed">
                          "{user.bio || "Searching for a study squad partner..."}"
                        </p>

                        {/* LANGUAGES SECTION */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-base-200/50 rounded-2xl p-3 flex flex-col items-center justify-center gap-1 border border-base-200">
                            <span className="text-[8px] font-black opacity-30 uppercase tracking-tighter">Native</span>
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{getLanguageFlag(user.nativeLanguage)}</span>
                              <span className="text-[10px] font-black uppercase tracking-tighter">{user.nativeLanguage}</span>
                            </div>
                          </div>
                          <div className="bg-primary/5 rounded-2xl p-3 flex flex-col items-center justify-center gap-1 border border-primary/10">
                            <span className="text-[8px] font-black text-primary/60 uppercase tracking-tighter">Learning</span>
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{getLanguageFlag(user.learningLanguage)}</span>
                              <span className="text-[10px] font-black text-primary uppercase tracking-tighter">{user.learningLanguage}</span>
                            </div>
                          </div>
                        </div>

                        {/* ACTION BUTTON */}
                        <div className="mt-auto">
                          {incomingId ? (
                            <button onClick={() => acceptRequestMutation(incomingId)} className="w-full py-4 bg-success text-success-content rounded-2xl font-[1000] uppercase text-xs shadow-[0_5px_0_0_#1d7a3a] active:shadow-none active:translate-y-1 transition-all">
                              Accept Request
                            </button>
                          ) : (
                            <button
                              disabled={hasSent || isPending}
                              onClick={() => sendRequestMutation(user._id)}
                              className={`w-full py-4 rounded-2xl font-[1000] uppercase text-xs transition-all flex items-center justify-center gap-2 ${hasSent ? 'bg-base-200 text-base-content/30' : 'bg-primary text-primary-content shadow-[0_5px_0_0_#4aab02] active:shadow-none active:translate-y-1'}`}
                            >
                              {hasSent ? "Invitation Sent" : "Connect Now"}
                              {!hasSent && <Languages size={14} />}
                            </button>
                          )}
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

      <style dangerouslySetInnerHTML={{
        __html: `
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .mask-fade-edges { mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent); }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
      `}} />
    </div>
  );
};

export default HomePage;