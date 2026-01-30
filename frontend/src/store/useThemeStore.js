import {create} from "zustand"

export const useTheme = create((set) => ({
    theme : "coffee",
    setTheme :  (theme) => set({theme})
}))