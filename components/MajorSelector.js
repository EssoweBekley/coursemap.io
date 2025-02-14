"use client"; // Required for Next.js app router

import { useRouter } from "next/navigation";

export default function MajorSelector() {
  const router = useRouter();

  const handleSelect = (event) => {
    const major = event.target.value;
    console.log("Selected Major:", major); // Log the selected major
    if (major) router.push(`/coursemaps/${major}`);
  };

  return (
    <div className="flex flex-col items-center mt-8">
      <label className="text-lg font-semibold mb-2">Select Your School:</label>
      <select
        onChange={handleSelect}
        defaultValue=""
        className="p-2 border border-gray-300 rounded-md text-black"
      >
        <option value="" disabled className="text-black">
          Select a major
        </option>
        <option value="cs" className="text-black">Computer Science</option>
        <option value="me" className="text-black">Mechanical Engineering</option>
      </select>
    </div>
  );
}
