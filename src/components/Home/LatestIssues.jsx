const LatestIssues = () => {
  return (
    <div className="py-12 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-8">Latest Resolved Issues</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border p-4 rounded shadow">
          <img
            src="https://via.placeholder.com/300"
            className="w-full rounded mb-3"
            alt=""
          />
          <h3 className="font-bold">Road Repair Completed</h3>
          <p>Resolved recently by municipal staff.</p>
        </div>

        <div className="border p-4 rounded shadow">
          <img
            src="https://via.placeholder.com/300"
            className="w-full rounded mb-3"
            alt=""
          />
          <h3 className="font-bold">Street Light Fixed</h3>
          <p>Lighting issue resolved successfully.</p>
        </div>

        <div className="border p-4 rounded shadow">
          <img
            src="https://via.placeholder.com/300"
            className="w-full rounded mb-3"
            alt=""
          />
          <h3 className="font-bold">Drainage Cleaned</h3>
          <p>Water clogging issue resolved.</p>
        </div>
      </div>
    </div>
  );
};

export default LatestIssues;
