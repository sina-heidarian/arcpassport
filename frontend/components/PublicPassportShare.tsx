"use client";

import { useEffect, useState } from "react";

type PublicPassportShareProps = {
  wallet: string;
};

export default function PublicPassportShare({
  wallet,
}: PublicPassportShareProps) {
  const [origin, setOrigin] = useState("http://localhost:3000");
  const [copied, setCopied] = useState(false);
  const publicPath = `/passport/${wallet}`;
  const publicUrl = `${origin}${publicPath}`;

  useEffect(() => {
    void Promise.resolve().then(() => {
      setOrigin(window.location.origin);
    });
  }, []);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy public passport link:", error);
    }
  }

  return (
    <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Public Builder Passport</h2>
        <p className="text-gray-400 mt-1">
          Share your Arc builder identity with others.
        </p>
      </div>

      <div className="bg-black border border-zinc-800 rounded-xl p-4">
        <p className="text-gray-500 text-sm">Public URL</p>
        <p className="text-gray-300 mt-1 break-all">{publicUrl}</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <a
          href={publicPath}
          className="bg-white text-black rounded-xl px-5 py-3 font-medium text-center"
        >
          View Public Passport
        </a>

        <button
          onClick={copyLink}
          className="bg-black border border-zinc-700 rounded-xl px-5 py-3 font-medium text-white hover:border-zinc-500"
        >
          Copy Link
        </button>

        {copied && <p className="text-sm text-green-400">Copied!</p>}
      </div>
    </div>
  );
}
