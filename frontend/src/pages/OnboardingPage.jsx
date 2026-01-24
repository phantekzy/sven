import { useState } from "react"
import useAuthUser from "../hooks/useAuthUser"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { completeOnboarding } from "../lib/api"
import toast from "react-hot-toast"
import { CameraIcon, ShuffleIcon } from "lucide-react"

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
                    </form>
                </div>
            </div >
        </div >
    )
}
export default OnboardingPage
