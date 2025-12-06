const Features = () => {
  return (
    <div className="py-12 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 shadow border rounded">
          <h3 className="text-lg font-bold mb-2">Report Issues</h3>
          <p>Submit public issues with photos and location.</p>
        </div>

        <div className="p-5 shadow border rounded">
          <h3 className="text-lg font-bold mb-2">Track Progress</h3>
          <p>Follow the progress from pending to resolved.</p>
        </div>

        <div className="p-5 shadow border rounded">
          <h3 className="text-lg font-bold mb-2">Help Community</h3>
          <p>Boost or upvote important issues to prioritize them.</p>
        </div>
      </div>
    </div>
  );
};

export default Features;
