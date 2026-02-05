import { PaletteIcon } from "lucide-react";
import { useThemeStore } from "../store/useThemeStore";
import { THEMES } from "../constants";

const ThemeSelector = () => {
  const { theme, setTheme } = useThemeStore();

  return (
    <div className="dropdown dropdown-end">
      {/* Dropdown trigger */}
      <button tabIndex={0} className="btn btn-ghost btn-circle">
        <PaletteIcon className="size-5 text-base-content" />
      </button>

      <div
        tabIndex={0}
        className="dropdown-content mt-2 p-1 shadow-2xl bg-base-200 backdrop-blur-lg rounded-2xl w-56 border border-base-content/10 max-h-80 overflow-y-auto z-[1]"
      >
        <div className="space-y-1">
          {THEMES.map((themeOption) => {
            const isSelected = theme === themeOption.name;

            return (
              <button
                key={themeOption.name}
                className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 group ${isSelected
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-base-content/5 text-base-content/70 hover:text-base-content"
                  }`}
                onClick={() => setTheme(themeOption.name)}
              >
                {/* Icon follows theme color if selected */}
                <PaletteIcon className={`size-4 ${isSelected ? "text-primary" : "opacity-50"}`} />

                <span className={`font-medium capitalize ${isSelected ? "text-primary" : ""}`}>
                  {themeOption.name}
                </span>

                {/* Theme colors preview */}
                <div className="ml-auto flex gap-1">
                  {themeOption.colors.map((color, i) => (
                    <span
                      key={i}
                      className="size-2 rounded-full border border-base-content/10"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ThemeSelector;