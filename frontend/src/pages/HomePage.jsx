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
import { Link } from "react-router";
import { MapPinIcon, ShipWheelIcon, UserIcon, SearchIcon, ChevronLeft, ChevronRight, Check, X, SearchX, Search } from "lucide-react";
import FriendCard, { getLanguageFlag } from "../components/FriendCard";
import NoFriendsFound from "../components/NoFriendsFound";

const HomePage = () => {
  const queryClient = useQueryClient();
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

  //  MUTATIONS 
  const { mutate: sendRequestMutation, isPending } = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] });
      const targetUser = recommendedUsers.find(u => u._id === variables);
      toast.custom((t) => (
        <div className="relative group animate-in slide-in-from-right-5">
          <div className="absolute inset-0 bg-info rounded-2xl translate-y-1.5 translate-x-1" />
          <div className="relative bg-base-100 border-2 border-info p-4 rounded-2xl flex items-center gap-4 min-w-[320px]">
            <div className="size-12 rounded-xl bg-base-200 border-b-4 border-base-300 overflow-hidden"
              dangerouslySetInnerHTML={{ __html: targetUser?.profilePic }} />
            <div className="flex-1">
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
    mutationKey: ["acceptRequest"],
    mutationFn: acceptFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.dismiss();
    }
  });

  const { mutate: declineRequestMutation } = useMutation({
    mutationKey: ["rejectRequest"],
    mutationFn: rejectFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      toast.dismiss();
    }
  });

  // INTERACTIVE TOAST FOR INCOMING 
  useEffect(() => {
    const incoming = friendRequests?.incomingReqs || [];
    if (prevIncomingCount.current !== null && incoming.length > prevIncomingCount.current) {
      const newReq = incoming[0];
      toast.custom((t) => (
        <div className="relative group animate-in slide-in-from-top-5">
          <div className="absolute inset-0 bg-primary rounded-2xl translate-y-2 translate-x-1" />
          <div className="relative bg-base-100 border-2 border-primary p-5 rounded-2xl flex flex-col gap-4 min-w-[340px]">
            <div className="flex items-center gap-4">
              <div className="size-14 rounded-2xl bg-base-200 border-b-4 border-base-300 overflow-hidden"
                dangerouslySetInnerHTML={{ __html: newReq.sender.profilePic }} />
              <div className="flex-1 text-left">
                <p className="font-black text-primary uppercase text-[10px] tracking-widest leading-none mb-1">New Invite!</p>
                <p className="font-bold text-lg leading-tight">{newReq.sender.fullName}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { declineRequestMutation(newReq._id); toast.dismiss(t); }} className="flex-1 py-2.5 rounded-xl font-black uppercase text-[10px] border-2 border-base-300 hover:bg-base-200 transition-all active:translate-y-1">Later</button>
              <button onClick={() => { acceptRequestMutation(newReq._id); toast.dismiss(t); }} className="flex-1 py-2.5 rounded-xl font-black uppercase text-[10px] bg-primary text-primary-content border-t border-white/20 shadow-[0_4px_0_0_#4aab02] active:shadow-none active:translate-y-1 transition-all">Accept</button>
            </div>
          </div>
        </div>
      ), { duration: Infinity });
    }
    prevIncomingCount.current = incoming.length;
  }, [friendRequests]);

  // FILTER LOGIC 
  const filteredFriends = useMemo(() => friends.filter(f => f.fullName.toLowerCase().includes(friendSearchQuery.toLowerCase())), [friends, friendSearchQuery]);
  const filteredUsers = useMemo(() => recommendedUsers.filter((user) => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || user.bio?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLang = selectedLanguage === "All" || user.nativeLanguage === selectedLanguage;
    return matchesSearch && matchesLang;
  }), [recommendedUsers, searchQuery, selectedLanguage]);

  const availableLanguages = useMemo(() => {
    const langs = new Set(recommendedUsers.map(u => u.nativeLanguage));
    return ["All", ...Array.from(langs)];
  }, [recommendedUsers]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - (clientWidth * 0.8) : scrollLeft + (clientWidth * 0.8);
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const incomingRequestMap = useMemo(() => {
    const map = new Map();
    friendRequests?.incomingReqs?.forEach((req) => map.set(req.sender._id, req._id));
    return map;
  }, [friendRequests]);

  useEffect(() => {
    const outgoingIds = new Set();
    if (outgoingFriendReqs) {
      outgoingFriendReqs.forEach((req) => outgoingIds.add(req.recipient._id));
      setOutgoingRequestsIds(outgoingIds);
    }
  }, [outgoingFriendReqs]);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-base-100 p-4 md:p-10 pb-32">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-[5%] animate-[float_8s_infinite] text-primary/20 font-black text-9xl select-none">A</div>
        <div className="absolute top-[40%] left-[85%] animate-[float_12s_infinite] text-secondary/20 font-black text-[12rem] select-none opacity-30">文</div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-24">
        <header className="flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
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

        {/* ACTIVE PARTNERS SECTION */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-1">
            <div className="space-y-4">
              <h2 className="text-2xl font-black flex items-center gap-3">
                <div className="size-4 bg-success rounded-full animate-pulse" />
                Active Partners
              </h2>
              <div className="relative w-full md:w-72 group">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 opacity-30" />
                <input
                  type="text"
                  placeholder="Find a friend..."
                  value={friendSearchQuery}
                  onChange={(e) => setFriendSearchQuery(e.target.value)}
                  className="input input-sm w-full pl-10 bg-base-200 border-2 border-base-300 rounded-xl font-bold focus:outline-none focus:border-success transition-all"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => scroll('left')} className="btn btn-circle btn-sm bg-base-200 border-base-300"><ChevronLeft size={16} /></button>
              <button onClick={() => scroll('right')} className="btn btn-circle btn-sm bg-base-200 border-base-300"><ChevronRight size={16} /></button>
            </div>
          </div>

          <div ref={scrollRef} className="flex gap-8 overflow-x-auto py-4 px-1 scrollbar-hide snap-x snap-mandatory mask-fade-edges" style={{ scrollbarWidth: 'none' }}>
            {loadingFriends ? <div className="loading loading-lg" /> :
              friendSearchQuery !== "" && filteredFriends.length === 0 ? (
                /* ALERT FOR FRIENDS NOT FOUND */
                <div className="w-full flex flex-col items-center justify-center p-10 bg-base-200/50 rounded-3xl border-2 border-dashed border-base-300">
                  <Search size={32} className="opacity-20 mb-2" />
                  <p className="font-bold opacity-40">No partner matches "{friendSearchQuery}"</p>
                </div>
              ) : friends.length === 0 ? <NoFriendsFound /> : (
                filteredFriends.map((f) => (
                  <div key={f._id} className="min-w-[85vw] md:min-w-[320px] snap-center hover:rotate-1 transition-transform cursor-pointer">
                    <FriendCard friend={f} />
                  </div>
                ))
              )}
          </div>
        </section>

        {/* DISCOVERY SECTION */}
        <section className="space-y-12">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <h2 className="text-4xl font-black uppercase italic tracking-tight">Expand Your World</h2>
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:max-w-xl">
              <div className="relative w-full">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 size-5 opacity-20" />
                <input
                  type="text"
                  placeholder="Search new learners..."
                  className="input input-bordered w-full pl-12 bg-base-200 border-2 border-base-300 rounded-2xl font-bold focus:border-primary focus:outline-none h-14"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="dropdown dropdown-end w-full sm:w-auto">
                <div tabIndex={0} role="button" className="btn h-14 bg-base-200 border-2 border-base-300 rounded-2xl font-bold w-full sm:w-44 flex justify-between">
                  <span>{selectedLanguage === "All" ? "Any Lang" : selectedLanguage}</span>
                  <ShipWheelIcon className="size-4 opacity-30" />
                </div>
                <ul tabIndex={0} className="dropdown-content z-[20] menu p-2 shadow-2xl bg-base-100 border-2 border-base-300 rounded-2xl w-52 mt-2">
                  {availableLanguages.map(lang => (
                    <li key={lang}><button onClick={() => setSelectedLanguage(lang)} className="font-bold">{lang}</button></li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
            {loadingUsers ? <div className="col-span-full flex justify-center py-20"><span className="loading loading-lg text-primary"></span></div> :
              (searchQuery !== "" || selectedLanguage !== "All") && filteredUsers.length === 0 ? (
                /* ALERT FOR EXPLORE NOT FOUND */
                <div className="col-span-full flex flex-col items-center justify-center py-20 bg-base-200/30 rounded-[3rem] border-2 border-dashed border-base-300 animate-in fade-in zoom-in-95">
                  <SearchX size={64} className="text-primary/20 mb-4" />
                  <h3 className="text-2xl font-black opacity-60">No users found</h3>
                  <p className="font-bold opacity-30">Try adjusting your search or language filter</p>
                  <button onClick={() => { setSearchQuery(""); setSelectedLanguage("All"); }} className="mt-4 btn btn-sm btn-ghost font-black uppercase tracking-widest text-[10px]">Reset Filters</button>
                </div>
              ) : (
                filteredUsers.map((user, index) => {
                  const hasSent = outgoingRequestsids.has(user._id);
                  const incomingId = incomingRequestMap.get(user._id);
                  return (
                    <div key={user._id} className="group relative" style={{ animation: `cardFloat 5s ease-in-out infinite`, animationDelay: `${index * 0.3}s` }}>
                      <div className="absolute inset-0 bg-base-300 rounded-[3rem] translate-y-3" />
                      <div className="relative bg-base-100 border-2 border-base-300 rounded-[3rem] p-8 space-y-6 overflow-hidden">
                        <div className="flex flex-col items-center gap-4">
                          <div className="size-28 rounded-[2.2rem] bg-base-200 p-1 border-b-8 border-base-300">
                            <div className="w-full h-full rounded-[1.8rem] overflow-hidden" dangerouslySetInnerHTML={{ __html: user?.profilePic }} />
                          </div>
                          <div className="text-center space-y-1">
                            <h3 className="text-2xl font-black">{user.fullName}</h3>
                            <span className="text-[10px] font-bold opacity-30 flex items-center justify-center gap-1 uppercase tracking-widest leading-none">
                              <MapPinIcon className="size-3" /> {user.location || "Online"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-base-200/50 rounded-3xl border-2 border-dashed border-base-300">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-[8px] font-black opacity-30 uppercase">Native</span>
                            <div className="scale-110">{getLanguageFlag(user.nativeLanguage)}</div>
                          </div>
                          <ShipWheelIcon className="size-6 text-primary animate-spin-slow" />
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-[8px] font-black text-primary/60 uppercase">Learning</span>
                            <div className="scale-110">{getLanguageFlag(user.learningLanguage)}</div>
                          </div>
                        </div>

                        <div className="w-full">
                          {incomingId ? (
                            <div className="flex gap-2">
                              <button onClick={() => declineRequestMutation(incomingId)} className="flex-1 py-3 font-black text-xs opacity-40 hover:opacity-100">Later</button>
                              <button onClick={() => acceptRequestMutation(incomingId)} className="flex-1 relative active:translate-y-1 transition-all">
                                <div className="absolute inset-0 bg-primary-focus rounded-2xl translate-y-1" />
                                <div className="relative bg-primary text-primary-content rounded-2xl py-4 font-black uppercase text-xs border-t border-white/20 text-center">Accept</div>
                              </button>
                            </div>
                          ) : (
                            <button disabled={hasSent || isPending} onClick={() => sendRequestMutation(user._id)} className={`relative w-full transition-all active:translate-y-2 ${hasSent ? "" : "group/btn"}`}>
                              {!hasSent && <div className="absolute inset-0 bg-primary-focus rounded-[1.5rem] translate-y-2" />}
                              <div className={`relative w-full py-5 rounded-[1.5rem] font-black uppercase text-xs tracking-[0.2em] border-t border-white/10 flex items-center justify-center ${hasSent ? "bg-base-200 text-base-content/20" : "bg-primary text-primary-content"}`}>
                                {hasSent ? "Sent ✨" : "Add Friend"}
                              </div>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
          </div>
        </section>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .mask-fade-edges { mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent); }
        @keyframes float { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-30px) rotate(5deg); } }
        @keyframes cardFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}} />
    </div>
  );
};

export default HomePage;