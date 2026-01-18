import { useState } from "react"

/* Signup component */
const SignUpPage = () => {
    const [signupData, setSignupData] = useState({
        fullName: "",
        email: "",
        password: "",
    })
    return (
        <div>Signup</div>
    )
}
/* Export section */
export default SignUpPage
