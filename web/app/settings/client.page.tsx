"use client";

import { useAppBridge } from "@shopify/app-bridge-react";
import { useCallback, useState } from "react";
import { saveSettings, type AppSettings } from "./actions";

const DEFAULT_SETTINGS: AppSettings = {
  appName: "",
  notificationsEnabled: false,
};

export default function SettingsForm() {
  const app = useAppBridge();
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    tone: "default" | "critical";
  } | null>(null);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const token = await app.idToken();
      const result = await saveSettings(token, settings);
      if (result.status === "success") {
        setToast({ message: "Settings saved", tone: "default" });
      } else {
        setToast({
          message: result.message || "Failed to save",
          tone: "critical",
        });
      }
    } catch {
      setToast({ message: "An error occurred", tone: "critical" });
    } finally {
      setSaving(false);
      setTimeout(() => setToast(null), 3000);
    }
  }, [app, settings]);

  return (
    <s-page
      title="Settings"
      primaryAction={JSON.stringify({
        content: saving ? "Saving..." : "Save",
        disabled: saving,
        onAction: "save",
      })}
    >
      {toast && (
        <s-banner tone={toast.tone === "critical" ? "critical" : "info"}>
          <p>{toast.message}</p>
        </s-banner>
      )}

      <div className="grid gap-4">
        <s-card>
          <div className="p-4 grid gap-4">
            <s-text as="h2" variant="headingMd">
              General
            </s-text>
            <div className="grid gap-3">
              <label className="grid gap-1">
                <s-text as="span" variant="bodyMd">
                  App display name
                </s-text>
                <input
                  type="text"
                  className="border rounded px-3 py-2"
                  value={settings.appName}
                  onChange={(e) =>
                    setSettings({ ...settings, appName: e.target.value })
                  }
                  placeholder="My Shopify App"
                />
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.notificationsEnabled}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      notificationsEnabled: e.target.checked,
                    })
                  }
                />
                <s-text as="span" variant="bodyMd">
                  Enable email notifications
                </s-text>
              </label>
            </div>
            <div className="flex justify-end">
              <s-button
                variant="primary"
                onClick={handleSave}
                disabled={saving || undefined}
              >
                {saving ? "Saving..." : "Save"}
              </s-button>
            </div>
          </div>
        </s-card>
      </div>
    </s-page>
  );
}
