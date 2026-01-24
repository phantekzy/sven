import { useState } from "react"
import useAuthUser from "../hooks/useAuthUser"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { completeOnboarding } from "../lib/api"
import toast from "react-hot-toast"
import { CameraIcon, MapPinIcon, ShuffleIcon } from "lucide-react"
import { LANGUAGES } from "../constants/index.js"

const OnboardingPage = () => {
    const { authUser } = useAuthUser()
    const queryClient = useQueryClient()
    const [formState, setFormState] = useState({
        fullName: authUser?.fullName || "",
        bio: authUser?.bio || "",
        nativeLanguage: authUser?.nativeLanguage || "",
        learningLanguage: authUser?.learningLanguage || "",
        location: authUser?.location || "",
        profilePic: authUser?.profilePic || "",
    })
    const { mutate: OnboardingMutation, isPending } = useMutation({
        mutationFn: completeOnboarding,
        onSuccess: () => {
            toast.success("Sven Profile updated successfully !")
            queryClient.invalidateQueries({ queryKey: ["authUser"] })
        }
    })
    const handleSubmit = (e) => {
        e.preventDefault()
        OnboardingMutation(formState)
    }

    const handleRandomAvatar = () => {

    }
    return (
        <div className="min-h-screen bg-base-100 flex items-center justify-center p-4 ">
            <div className="card bg-base-200 w-full max-w-3xl shadow-xl">
                <div className="card-body p-6 sm:p-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6">Introduce Yourself to the World</h1>
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-6"
                    >
                        <div className="flex flex-col items-center justify-center space-y-4">
                            <div className="size-32 rounded-full bg-base-300 overflow-hidden">
                                {/* Profile picture section */}
                                {formState.profilePic ? (
                                    < div
                                        className="w-32 h-32 rounded-full overflow-hidden border-2 border-primary"
                                        dangerouslySetInnerHTML={{ __html: formState.profilePic }}
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <CameraIcon className="size-12 text-base-content opacity-40" />
                                    </div>
                                )}
                            </div>
                            {/* Generate Avatar */}
                            <div className="flex items-center gap-2">
                                <button type="button" onClick={handleRandomAvatar} className="btn btn-accent">
                                    <ShuffleIcon className="size-4 mr-2" />
                                    Generate  avatar
                                </button>
                            </div>
                        </div>

                        {/* Full name section */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Full name</span>
                            </label>
                            <input
                                type="text"
                                name="fullName"
                                value={formState.fullName}
                                onChange={(e) => setFormState({ ...formState, fullName: e.target.value })}
                                className="input input-bordered w-full"
                                placeholder="Full Name"
                            />
                        </div>

                        {/* Bio section */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Bio</span>
                            </label>
                            <textarea
                                name="bio"
                                value={formState.bio}
                                onChange={(e) => setFormState({ ...formState, bio: e.target.value })}
                                className="textarea textarea-bordered h-24"
                                placeholder="Tell the community about yourself, your interests, the languages you love and what you’re hoping to learn together."
                            />
                        </div>
                        {/* Languages section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Native language section */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Native Language</span>
                                </label>
                                <select
                                    name="nativeLanguage"
                                    value={formState.nativeLanguage}
                                    onChange={(e) => setFormState({ ...formState, nativeLanguage: e.target.value })}
                                    className="select select-bordered w-full"
                                >
                                    <option value="">Select languages you speak</option>
                                    {LANGUAGES.map((lang) => (
                                        <option key={`native-${lang}`} value={lang.toLowerCase()}>
                                            {lang}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {/* Learning Languages section*/}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">
                                        Learning Language
                                    </span>
                                </label>
                                <select
                                    name="learningLanguage"
                                    value={formState.learningLanguage}
                                    onChange={(e) => setFormState({ ...formState, learningLanguage: e.target.value })}
                                    className="select select-bordered w-full"
                                >
                                    <option value="">What language are you practicing?</option>
                                    {LANGUAGES.map((lang) => (
                                        <option key={`learning-${lang}`} value={lang.toLowerCase()}>
                                            {lang}
                                        </option>
                                    ))}
                                </select>
                            </div>

                        </div>
                        {/* lcocation section */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Location</span>
                            </label>
                            <div className="relative">
                                <MapPinIcon className="absolute top-1/2 transform -translate-y-1/2 
                                            left-3 size-5 text-base-content opacity-70 "/>
                                <input
                                    type="text"
                                    name="location"
                                    value={formState.location}
                                    onChange={(e) => setFormState({ ...formState, location: e.target.value })}
                                    className="input input-bordered w-full pl-10"
                                    placeholder="City,Country"
                                />
                            </div>
                        </div>
                    </form>
                </div>
            </div >
        </div >
    )
}
export default OnboardingPage
