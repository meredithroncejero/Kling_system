"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { uploadGcashQr } from "@/actions/settings";

interface SettingsFormProps {
  currentQrUrl: string;
}

export function SettingsForm({ currentQrUrl }: SettingsFormProps) {
  const [qrUrl, setQrUrl] = useState(currentQrUrl);
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    const result = await uploadGcashQr(formData);
    setUploading(false);

    if (result.error) toast.error(result.error);
    else if (result.url) {
      setQrUrl(result.url);
      toast.success("GCash QR code updated");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>GCash QR Code</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Upload your GCash QR code. This will be displayed on the checkout page for customers.
        </p>
        {qrUrl && (
          <div className="relative mx-auto aspect-square w-48 overflow-hidden rounded-lg border">
            <Image src={qrUrl} alt="GCash QR Code" fill className="object-contain" />
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="gcash-qr">Upload New QR Code</Label>
          <Input
            id="gcash-qr"
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
          />
        </div>
        <Button disabled={uploading}>
          {uploading ? "Uploading..." : "Save QR Code"}
        </Button>
      </CardContent>
    </Card>
  );
}
