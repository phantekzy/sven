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
                    <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6">Update your Profile</h1>
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-6"
                    >
                        {/* Profile picture section */}
                        <div className="flex flex-col items-center justify-center space-y-4">
                            <div className="size-32 rounded-full bg-base-300 overflow-hidden">
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
                                    Generate Your Avatar
                                </button>
                            </div>

                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
export default OnboardingPage
