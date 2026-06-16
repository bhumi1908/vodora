"use client";

import {
  CheckCircle,
  Plus,
  Send,
  Share2,
  Shield,
  Star,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

interface InviteModalProps {
  onClose: () => void;
}

export function InviteModal({ onClose }: InviteModalProps) {
  const [emails, setEmails] = useState<string[]>([""]);
  const [senderName] = useState("Sarah Johnson");
  const [message, setMessage] = useState(
    "Hey! I've been using Vodora to manage my professional references and I think you'd love it. It lets you own your reputation and share verified references with recruiters in one click.",
  );
  const [sent, setSent] = useState(false);

  const addEmail = () => setEmails((prev) => [...prev, ""]);
  const removeEmail = (i: number) =>
    setEmails((prev) => prev.filter((_, idx) => idx !== i));
  const updateEmail = (i: number, val: string) =>
    setEmails((prev) => prev.map((e, idx) => (idx === i ? val : e)));

  const validEmails = emails.filter((e) => e.trim() && /\S+@\S+\.\S+/.test(e));

  const handleSend = () => {
    if (validEmails.length === 0) return;
    setSent(true);
  };

  if (sent) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl sm:p-10">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="mb-2 text-xl font-semibold text-gray-900 sm:text-2xl">
            Invitations Sent!
          </h2>
          <p className="mb-1 text-gray-500">
            {validEmails.length} invitation{validEmails.length > 1 ? "s" : ""}{" "}
            sent successfully.
          </p>
          <p className="mb-8 text-sm text-gray-400">
            Your colleagues will receive an email from Vodora with your personal
            message.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between p-6 pb-0 sm:p-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl">
              Invite & Connect
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Invite colleagues or friends to join you on Vodora
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="mt-1 text-gray-400 transition-colors hover:text-gray-700"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 p-6 sm:p-8">
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 sm:p-5">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-blue-600">
                <Share2 className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="font-semibold text-blue-900">Why Vodora?</span>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-3">
              {[
                {
                  icon: Shield,
                  label: "Verified References",
                  desc: "Collect once, reuse forever",
                },
                {
                  icon: Star,
                  label: "Own Your Reputation",
                  desc: "You control who sees what",
                },
                {
                  icon: Users,
                  label: "Trusted by Recruiters",
                  desc: "2,500+ companies hiring",
                },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="text-center sm:text-center">
                  <Icon className="mx-auto mb-1 h-5 w-5 text-blue-600" />
                  <p className="text-xs leading-tight font-semibold text-blue-900">
                    {label}
                  </p>
                  <p className="mt-0.5 text-xs leading-tight text-blue-600">
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Inviting from
            </label>
            <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100">
                <span className="text-sm font-semibold text-blue-700">SJ</span>
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-900">
                  {senderName}
                </p>
                <p className="truncate text-xs text-gray-500">
                  sarah.johnson@email.com
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Recipient email address{emails.length > 1 ? "es" : ""}
            </label>
            <div className="space-y-2">
              {emails.map((email, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => updateEmail(i, e.target.value)}
                    placeholder="colleague@company.com"
                    className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  {emails.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEmail(i)}
                      className="rounded-xl border border-gray-200 p-2.5 text-gray-400 transition-colors hover:text-red-500"
                      aria-label="Remove email"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addEmail}
              className="mt-2 flex items-center gap-1.5 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
            >
              <Plus className="h-4 w-4" />
              Add another email
            </button>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Personal message
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm leading-relaxed focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <p className="mt-1 text-xs text-gray-400">
              This message will appear in the invitation email alongside info
              about Vodora.
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-1 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-gray-300 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSend}
              disabled={validEmails.length === 0}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
              Send {validEmails.length > 0 ? `${validEmails.length} ` : ""}
              Invitation{validEmails.length !== 1 ? "s" : ""}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
