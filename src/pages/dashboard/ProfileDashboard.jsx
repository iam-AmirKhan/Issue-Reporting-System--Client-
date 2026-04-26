import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export default function ProfileDashboard() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => (await axios.get("/api/users/me")).data
  });

  if (isLoading) return <p>Loading...</p>;

  const subscribe = async () => {
    const { data } = await axios.post("/api/payments/create-subscription-session");
    window.location.href = data.paymentUrl;
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className=" text-black font-bold mb-4">Profile</h1>

      {user.blocked && (
        <div className="p-3 bg-red-200 text-black rounded mb-4">
          You are blocked. Contact authorities.
        </div>
      )}

      <div className="bg-white p-4 rounded shadow">
        <p><b>Name:</b> {user.name}</p>
        <p><b>Email:</b> {user.email}</p>

        <p className="mt-2">
          <b>Status:</b>{" "}
          {user.isPremium ? (
            <span className="text-green-600 font-bold">Premium</span>
          ) : (
            <span className="text-gray-600">Free User</span>
          )}
        </p>

        {!user.isPremium && !user.blocked && (
          <button
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
            onClick={subscribe}
          >
            Subscribe — 1000tk
          </button>
        )}
      </div>
    </div>
  );
}
