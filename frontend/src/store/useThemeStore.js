import {create} from "zustand"

export const useThemeStore = create((set) => ({
    theme : localStorage.getItem("sven-theme") ||"sunset",
    setTheme :  (theme) =>{ 
        localStorage.setItem("sven-theme" , theme),
        set({theme})
    }
}))