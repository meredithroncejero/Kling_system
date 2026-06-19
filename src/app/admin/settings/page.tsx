import { getGcashQrUrl } from "@/actions/settings";
import { SettingsForm } from "@/components/admin/settings-form";

export default async function AdminSettingsPage() {
  const gcashQrUrl = await getGcashQrUrl();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-kling-forest">Settings</h1>
        <p className="text-muted-foreground">Manage store configuration.</p>
      </div>
      <SettingsForm currentQrUrl={gcashQrUrl} />
    </div>
  );
}
