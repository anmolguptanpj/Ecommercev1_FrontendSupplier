import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../store/authSlice";
import { useNavigate } from "react-router-dom";

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, isAuthenticated } = useSelector(
    (state) => state.auth
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);

  const loginFrom = "SUPPLIER";

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await dispatch(
        login({
          email,
          password,
          loginFrom,
        })
      ).unwrap();

      navigate("/home");
    } catch (err) {
      console.log("Login Failed:", err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/home");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-black">
              Welcome Back
            </h1>

            <p className="text-gray-500 mt-2">
              Login to continue managing your inventory
            </p>
          </div>

          {/* Success */}
          {isAuthenticated && (
            <div className="mb-5 border border-green-200 bg-green-50 text-green-600 rounded-2xl px-4 py-3 text-sm">
              Logged in Successfully
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-5 border border-red-200 bg-red-50 text-red-500 rounded-2xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="text-sm text-gray-500">
                Email Address
              </label>

              <input
                type="email"
                placeholder="Enter Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="
                  w-full
                  mt-2
                  border border-gray-300
                  rounded-2xl
                  px-4 py-3
                  outline-none
                  focus:border-black
                  transition
                  bg-white
                "
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-sm text-gray-500">
                Password
              </label>

              <input
                type={show ? "text" : "password"}
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="
                  w-full
                  mt-2
                  border border-gray-300
                  rounded-2xl
                  px-4 py-3
                  outline-none
                  focus:border-black
                  transition
                  bg-white
                "
              />

              <div className="flex items-center gap-3 mt-4">
                <input
                  type="checkbox"
                  checked={show}
                  onChange={() => setShow((prev) => !prev)}
                  className="w-4 h-4 accent-black"
                />

                <label className="text-sm text-gray-600">
                  Show Password
                </label>
              </div>
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className={`
                w-full
                py-3
                rounded-2xl
                text-white
                transition
                font-medium
                ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-black hover:opacity-90"
                }
              `}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;