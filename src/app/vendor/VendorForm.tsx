
"use client";

import React from 'react';

export default function VendorForm() {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted!");
    // Your form logic goes here later
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input 
        name="name" 
        placeholder="Vendor Name" 
        className="p-2 border rounded text-black" 
      />
      <button 
        type="submit" 
        className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
      >
        Submit Registration
      </button>
    </form>
  );
}