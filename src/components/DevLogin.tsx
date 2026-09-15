import React, { useState } from "react";

type DevLoginProps = {
  onSubmit: (userId: number) => void;
  loading: boolean;
  error: string | null;
};

export const DevLogin: React.FC<DevLoginProps> = ({ onSubmit, loading, error }) => {
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = Number(value);
    if (!value || isNaN(id)) return;
    onSubmit(id);
  };

  return (
    <div className="h-screen flex items-center justify-center px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-xs flex flex-col gap-3">
        <h2 className="text-xl font-[500] text-center mb-2">Dev Login</h2>
        <p className="text-sm text-center opacity-70 mb-2">
          Telegram init is disabled on web. Enter a user ID to load an account.
        </p>
        <input
          className="bg-[#0D2A28] border border-[#49485C] rounded-xl px-4 py-2 text-center outline-none"
          type="text"
          inputMode="numeric"
          placeholder="User ID"
          value={value}
          onChange={e => setValue(e.target.value)}
          autoFocus
        />
        {error && <p className="text-sm text-red-400 text-center">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="gold-gradient rounded-xl py-2 font-[500] disabled:opacity-50"
        >
          {loading ? "Loading..." : "Continue"}
        </button>
      </form>
    </div>
  );
};
