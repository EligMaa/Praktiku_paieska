import React from "react";

export default function JobCard({ job }) {
  return (
    <div className="bg-white rounded-2xl shadow p-5 flex flex-col justify-between hover:shadow-lg transition">
      <div>
        <h3 className="font-bold text-lg">{job.title}</h3>
        <p className="text-sm text-gray-600">{job.company}</p>
        <p className="text-sm mt-2">
          <span className="font-medium">{job.location}</span> |{" "}
          {job.salary_min}€ – {job.salary_max}€/mo
        </p>
      </div>
      <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700">
        Join {job.company}
      </button>
    </div>
  );
}
