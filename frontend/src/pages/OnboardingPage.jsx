import { useState } from "react"
import useAuthUser from "../hooks/useAuthUser"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { completeOnboarding } from "../lib/api"
import toast from "react-hot-toast"

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
    return (
        <div>Onboarding</div>
    )
}
export default OnboardingPage
