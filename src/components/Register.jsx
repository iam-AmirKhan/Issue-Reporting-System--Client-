import { useState } from "react";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { app } from "../../firebase/firebase.config";
import Swal from "sweetalert2";

const auth = getAuth(app);

const Register = () => {
  const [error, setError] = useState("");

  const handleRegister = (e) => {
    e.preventDefault();
    const form = e.target;

    const name = form.name.value;
    const email = form.email.value;
    const password = form.password.value;

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    createUserWithEmailAndPassword(auth, email, password)
      .then((result) => {
        updateProfile(result.user, { displayName: name });
        Swal.fire("Success", "Account created successfully!", "success");
        form.reset();
      })
      .catch((error) => {
        setError(error.message);
      });
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Register</h1>

      <form onSubmit={handleRegister} className="space-y-3">
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          className="border p-2 w-full"
          required
        />

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

        <button className="bg-blue-600 text-white w-full py-2">Register</button>
      </form>
    </div>
  );
};

export default Register;
