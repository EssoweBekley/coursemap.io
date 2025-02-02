"use client"; // Required for Next.js app router

import { useRouter } from "next/navigation";

export default function MajorSelector() {
  const router = useRouter();

  const handleSelect = (event) => {
    const major = event.target.value;
    if (major) router.push(`/coursemaps/${major}`);
  };

  return (
    <div>
      <label>Select Your Major:</label>
      <select onChange={handleSelect} defaultValue="">
        <option value="" disabled>Select a major</option>
        <option value="cs">Computer Science</option>
      </select>
    </div>
  );
}
