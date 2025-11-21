import React, { useState } from "react";
import {
  MoreVertical,
  BellOff,
  MessageSquareX,
  Minimize2,
  Volume2,
  VolumeX,
} from "lucide-react";

export function ChatMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const menuItems = [
    {
      icon: BellOff,
      label: "Turn off notifications",
      action: () => console.log("Notifications off"),
    },
    {
      icon: MessageSquareX,
      label: "Clear conversation",
      action: () => console.log("Clear conversation"),
    },
    {
      icon: Minimize2,
      label: "Minimize widget",
      action: () => console.log("Minimize widget"),
    },
    {
      icon: soundEnabled ? VolumeX : Volume2,
      label: soundEnabled ? "Turn off sounds" : "Turn on sounds",
      action: () => setSoundEnabled(!soundEnabled),
    },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
      >
        <MoreVertical className="w-5 h-5 text-white" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div
            className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg z-20 overflow-hidden"
            style={{ boxShadow: "var(--tandem-shadow-deep)" }}
          >
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  onClick={() => {
                    item.action();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                >
                  <Icon className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-800">{item.label}</span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
