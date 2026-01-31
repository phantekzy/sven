import { PaletteIcon } from "lucide-react";
import { useThemeStore } from "../store/useThemeStore";

const ThemeSelector = () => {
  const { theme, setTheme } = useThemeStore();
  return (
    <div className="dropdown dropdown-end">
      {/* Dropdwon trigger */}
      <button tabIndex={0} className="btn btn-ghost btn-circleV">
        <PaletteIcon className="size-5" />
      </button>
    </div>
  );
};

export default ThemeSelector;
