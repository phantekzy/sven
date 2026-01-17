/* Import section */
import { Route, Routes } from "react-router"
// Routes 
import HomePage from "./pages/HomePage"
import SignUpPage from "./pages/SignUpPage"
/* App component */
const App = () => {
    return (
        <>
            <div className="h-screen" data-theme="coffee">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/signup" element={<SignUpPage />} />
                </Routes>
            </div>
        </>
    )
}
/* Export section */
export default App
