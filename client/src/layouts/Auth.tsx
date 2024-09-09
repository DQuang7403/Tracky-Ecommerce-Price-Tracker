import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router-dom";
import { useLoginMutation, useSignupMutation } from "../redux/api/authApiSlice";
import { useAppDispatch } from "../redux/hooks";
import { logIn } from "../redux/slice/authSlice";
import { toast } from "../components/ui/use-toast";
import { CircleHelp } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";
import passwordChecker from "../utils/passwordChecker";

export default function Auth() {
  const [loginEmail, setLoginEmail] = useState<string>("");
  const [logininPassword, setLoginPassword] = useState<string>("");

  const [signupName, setSignUpName] = useState<string>("");
  const [signupEmail, setSignUpEmail] = useState<string>("");
  const [signupPassword, setSignUpPassword] = useState<string>("");
  const [receiveGmail, setReceiveGmail] = useState<boolean>(false);

  const [errorMsg, setErrorMsg] = useState<string>("");
  const navigate = useNavigate();
  const [signUpForm, setSignUpForm] = useState<boolean>(false);

  const [login] = useLoginMutation();
  const [signup] = useSignupMutation();

  const dispatch = useAppDispatch();
  useEffect(() => {
    setErrorMsg("");
  }, [loginEmail, logininPassword, signupEmail, signupName, signupPassword]);
  useEffect(() => {
    if (errorMsg !== "") {
      toast({
        title: "ERROR!!!",
        description: errorMsg,
        variant: "destructive",
      });
    }
  }, [errorMsg]);
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await login({
        email: loginEmail,
        password: logininPassword,
      });
      if (res?.error) {
        setErrorMsg(res.error.data.msg);
      } else if (res.data.isError === true) {
        setErrorMsg("Something went wrong, please try again");
      } else if (res?.data !== undefined) {
        dispatch(logIn({ ...res?.data }));
        toast({
          title: "Login Successful",
          description: "You have successfully logged in",
          variant: "success",
        });
        setLoginEmail("");
        setLoginPassword("");
        navigate("/");
      }
    } catch (error: any) {
      console.log(error);
    }
  };
  const handelSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (passwordChecker(signupPassword).valid === false) {
        setErrorMsg(passwordChecker(signupPassword).error[0]);
        return;
      }
      const res = await signup({
        name: signupName,
        email: signupEmail,
        password: signupPassword,
        receiveGmail: receiveGmail,
      });
      if (res.data === "User created successfully") {
        toast({
          title: "Sign Up Successful",
          description: "You have successfully signed up",
          variant: "success",
        });
        setSignUpForm(false);
        setSignUpName("");
        setSignUpEmail("");
        setSignUpPassword("");
      } else if (res?.error) {
        setErrorMsg(res.error.data);
      }
    } catch (error: any) {
      console.log(error);
    }
  };

  return (
    <section className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center sm:bg-gradient-to-tr sm:from-[#e2e2e2] sm:to-[#c9d6ff] bg-white">
      <div className={`container ${signUpForm ? "active" : ""}`}>
        <div className="container-form sign-up ">
          <form onSubmit={handelSignUp}>
            <h1 className="text-4xl font-bold mb-4">Create Account</h1>
            <span className="text-[#6b7280] mt-2">
              or use your email for registration
            </span>
            <input
              type="text"
              placeholder="name"
              name="SignupName"
              required
              value={signupName}
              onChange={(e) => setSignUpName(e.target.value)}
            />
            <input
              type="email"
              name="SignupEmail"
              placeholder="email"
              required
              value={signupEmail}
              onChange={(e) => setSignUpEmail(e.target.value)}
            />
            <input
              type="password"
              name="SignupPassword"
              placeholder="password"
              required
              value={signupPassword}
              onFocus={(e) => e.target.type = "text"}
              onChange={(e) => setSignUpPassword(e.target.value)}
            />
            <div className="flex items-center self-start space-x-2">
              <input
                type="checkbox"
                id="terms"
                name="receiveGmail"
                onChange={() => setReceiveGmail(!receiveGmail)}
              />

              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer "
              >
                Receive notifications
              </label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <CircleHelp className="w-10 cursor-pointer" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Receive an email whenever your <br /> tracked product has
                      new price changes
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Button className="mt-4">Sign Up</Button>
            <p className="absolute bottom-5">
              Already have an account?{" "}
              <button
                type="button"
                className="text-[#a1aabe] "
                onClick={() => setSignUpForm(false)}
              >
                {" "}
                Sign in
              </button>
            </p>
          </form>
        </div>
        <div className="container-form sign-in">
          <form onSubmit={handleLogin}>
            <h1 className="text-4xl font-bold mb-4">Login</h1>
            <span className="text-[#6b7280] mt-2">
              or use your email and password
            </span>
            <input
              type="email"
              placeholder="email"
              name="LoginEmail"
              required
              onChange={(e) => setLoginEmail(e.target.value)}
            />
            <input
              type="password"
              name="LoginPassword"
              placeholder="password"
              required
              onChange={(e) => setLoginPassword(e.target.value)}
            />
            <Button type="submit" className="mt-4">
              Log In
            </Button>
            <p className="absolute bottom-5">
              Don't have an account yet?{" "}
              <button
                type="button"
                className="text-[#a1aabe]"
                onClick={() => setSignUpForm(true)}
              >
                Sign up
              </button>
            </p>
          </form>
        </div>
        <div className="toggle-container text-white">
          <div className="toggle">
            <div className="toggle-panel toggle-left">
              <h1 className="text-4xl font-bold mb-2">Welcome</h1>
              <p className="text-[#adb7cb]">
                Register with your personal details
              </p>
            </div>
            <div className="toggle-panel toggle-right">
              <h1 className="text-4xl font-bold mb-2">Hello, there</h1>
              <p className="text-[#adb7cb]">
                Enter your credentials to access your account
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
