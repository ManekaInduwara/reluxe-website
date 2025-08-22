"use client";

export default function GoBackButton() {
  return (
    <button
      onClick={() => window.history.back()}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      Go Back
    </button>
  );
}