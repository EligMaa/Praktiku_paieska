import React from "react";
import JobCard from "./JobCard";

export default function JobList({ jobs }) {
  if (!jobs.length)
    return <p className="text-gray-600 mt-10">No jobs found.</p>;

  return (
    <div className="grid md:grid-cols-3 gap-6 mt-6 w-full max-w-6xl">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
}
