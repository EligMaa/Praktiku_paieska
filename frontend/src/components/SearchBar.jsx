import React, { useState } from "react";

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mt-10 mb-6">
      <input
        type="text"
        placeholder="Search or filter"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-96 p-3 rounded-full border border-gray-300 shadow"
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700"
      >
        Show
      </button>
    </form>
  );
}
