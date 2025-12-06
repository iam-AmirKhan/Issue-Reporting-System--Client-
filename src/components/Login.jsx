import { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { app } from "../../firebase/firebase.config";
import Swal from "sweetalert2";

const auth = getAuth(app);

const Login = () => {
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    const form = e.target;

    const email = form.email.value;
    const password = form.password.value;

    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        Swal.fire("Success", "Logged in successfully!", "success");
      })
      .catch(() => {
        setError("Invalid email or password");
      });
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Login</h1>

      <form onSubmit={handleLogin} className="space-y-3">
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          className="border p-2 w-full"
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          className="border p-2 w-full"
          required
        />

        {error && <p className="text-red-600">{error}</p>}

        <button className="bg-blue-600 text-white w-full py-2">Login</button>
      </form>
    </div>
  );
};

export default Login;
