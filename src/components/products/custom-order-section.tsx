"use client";

import { useRef, useState } from "react";
import { Heart, Send, Sparkles, Tag, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { submitCustomRequest } from "@/actions/custom-requests";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PRODUCT_CATEGORIES } from "@/types";
import { cn } from "@/lib/utils";

const beadColors = [
  "bg-kling-blue",
  "bg-kling-pink",
  "bg-kling-yellow",
  "bg-kling-green",
  "bg-orange-200",
  "bg-rose-200",
  "bg-amber-200",
  "bg-sky-200",
  "bg-pink-200",
  "bg-emerald-200",
];

function RequiredMark() {
  return <span className="text-kling-pink">*</span>;
}

export function CustomOrderSection() {
  const [category, setCategory] = useState("");
  const [referenceFile, setReferenceFile] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ fullName?: string; contactNumber?: string }>({});
  const formRef = useRef<HTMLFormElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  function focusForm() {
    nameInputRef.current?.focus();
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target;
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name as keyof typeof errors];
        return next;
      });
    }
  };

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let cleanValue = e.target.value.replace(/\D/g, "");
    
    // Automatically strip leading zero if they type 09...
    if (cleanValue.startsWith("0")) {
      cleanValue = cleanValue.substring(1);
    }
    
    e.target.value = cleanValue;

    if (errors.contactNumber) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.contactNumber;
        return next;
      });
    }
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!category) {
      toast.error("Please select a custom order category.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const fullName = formData.get("fullName")?.toString().trim() ?? "";
    const rawContact = formData.get("contactNumber")?.toString().trim() ?? "";

    const newErrors: { fullName?: string; contactNumber?: string } = {};

    if (/\d/.test(fullName)) {
      newErrors.fullName = "Full name must not contain numbers.";
    }

    if (!/^9\d{9}$/.test(rawContact)) {
      newErrors.contactNumber = "Contact number must be a valid 10-digit mobile number starting with 9.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      if (newErrors.fullName) {
        nameInputRef.current?.focus();
      } else if (newErrors.contactNumber) {
        document.getElementById("custom-contact")?.focus();
      }
      toast.error("Please correct the errors in the form.");
      return;
    }

    // Set the complete formatted contact number with +63 prefix for submission
    formData.set("contactNumber", `+63${rawContact}`);

    setErrors({});
    setSubmitting(true);
    const result = await submitCustomRequest(formData);
    setSubmitting(false);

    if (result.error) {
      if (result.error.toLowerCase().includes("name")) {
        setErrors(prev => ({ ...prev, fullName: result.error }));
      } else if (result.error.toLowerCase().includes("contact")) {
        setErrors(prev => ({ ...prev, contactNumber: result.error }));
      }
      toast.error(result.error);
      return;
    }

    toast.success("Custom order request submitted. We'll get back to you soon.");
    formRef.current?.reset();
    setCategory("");
    setReferenceFile("");
    setErrors({});
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.95fr]">
      <aside className="relative overflow-hidden rounded-2xl border border-white/70 bg-gradient-to-br from-kling-pink/12 via-white/80 to-kling-yellow/12 p-8 shadow-sm">
        <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-kling-pink/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-16 h-48 w-48 rounded-full bg-kling-yellow/15 blur-3xl" />

        <div className="relative">
          <div className="mb-8 flex items-center gap-8">
            <div className="relative h-24 w-24 shrink-0">
              {beadColors.map((color, index) => {
                const angle = (index / beadColors.length) * Math.PI * 2;
                const x = 38 + Math.cos(angle) * 30;
                const y = 38 + Math.sin(angle) * 30;

                return (
                  <span
                    key={`${color}-${index}`}
                    className={`absolute h-4 w-4 rounded-full border border-white/70 shadow-bead ${color}`}
                    style={{ left: x, top: y }}
                  />
                );
              })}
              <Heart className="absolute bottom-1 left-4 h-8 w-8 fill-kling-gold text-kling-gold" />
            </div>

            <h3 className="font-display text-3xl font-bold leading-tight text-kling-forest">
              Can&apos;t find what you&apos;re looking for?
            </h3>
          </div>

          <p className="font-display text-2xl font-semibold text-kling-pink">
            We accept custom orders!
          </p>
          <p className="mt-7 max-w-sm leading-7 text-kling-forest">
            Have a design in mind? Let us bring it to life. Fill out the form
            and we&apos;ll create something made just for you.
          </p>

          <Button className="mt-8 h-12 px-7" type="button" onClick={focusForm}>
            <Sparkles className="h-4 w-4" />
            Request a Custom Order
          </Button>

          <div className="mt-9 flex gap-4 rounded-xl border border-kling-pink/20 bg-kling-pink/10 p-5 text-sm leading-6 text-kling-forest">
            <Heart className="mt-0.5 h-6 w-6 shrink-0 text-kling-pink" />
            <p>
              Price will be negotiable depending on the design, materials, and
              complexity.
            </p>
          </div>
        </div>
      </aside>

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="rounded-2xl border border-white/70 bg-white/85 p-6 shadow-sm backdrop-blur-sm md:p-8"
      >
        <div>
          <h3 className="font-display text-2xl font-bold text-kling-forest">
            Custom Order Form
          </h3>
          <p className="mt-1 text-sm text-kling-forest">
            Fill out the details below and we&apos;ll get back to you soon.
          </p>
        </div>

        <div className="mt-7 grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="custom-full-name" className="text-kling-forest">
              Full Name <RequiredMark />
            </Label>
            <Input
              ref={nameInputRef}
              id="custom-full-name"
              name="fullName"
              placeholder="Enter your full name"
              required
              className={errors.fullName ? "border-rose-500 focus-visible:ring-rose-500" : ""}
              onChange={handleInputChange}
            />
            {errors.fullName && (
              <p className="text-xs text-rose-500 font-medium mt-1 pl-3">{errors.fullName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-kling-forest">
              Category <RequiredMark />
            </Label>
            <input type="hidden" name="category" value={category} />
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-10 rounded-full border-kling-pink/25 bg-white">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_CATEGORIES.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom-reference" className="text-kling-forest">
              Reference Design <RequiredMark />
            </Label>
            <label
              htmlFor="custom-reference"
              className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-kling-pink/45 bg-kling-pink/5 px-4 text-center transition hover:bg-kling-pink/10"
            >
              <UploadCloud className="h-10 w-10 text-kling-pink" />
              <span className="mt-4 text-sm font-medium text-kling-forest">
                Click to upload or drag and drop
              </span>
              <span className="mt-1 text-xs text-muted-foreground">
                PNG, JPG, JPEG up to 5MB
              </span>
              {referenceFile ? (
                <span className="mt-3 max-w-full truncate rounded-full bg-white px-3 py-1 text-xs text-kling-forest">
                  {referenceFile}
                </span>
              ) : null}
            </label>
            <Input
              id="custom-reference"
              name="referenceDesign"
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              className="sr-only"
              required
              onChange={(event) =>
                setReferenceFile(event.target.files?.[0]?.name ?? "")
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom-description" className="text-kling-forest">
              Description of Order <RequiredMark />
            </Label>
            <Textarea
              id="custom-description"
              name="description"
              placeholder="Please describe your custom order in detail..."
              className="min-h-40 rounded-xl border-kling-pink/25 bg-white focus-visible:ring-kling-pink"
              required
            />
          </div>

          <div className="md:col-span-2">
            <div className="flex gap-3 rounded-lg border border-kling-yellow/50 bg-kling-yellow/10 p-4 text-sm text-kling-forest">
              <Tag className="mt-0.5 h-5 w-5 shrink-0 text-kling-gold" />
              <p>
                <span className="font-semibold">Note:</span> Price will be
                negotiable depending on the design, materials, and complexity.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom-contact" className="text-kling-forest">
              Contact Number <RequiredMark />
            </Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-kling-forest/60 font-semibold select-none">
                +63
              </span>
              <Input
                id="custom-contact"
                name="contactNumber"
                placeholder=""
                required
                maxLength={10}
                inputMode="numeric"
                className={cn(
                  "pl-12",
                  errors.contactNumber ? "border-rose-500 focus-visible:ring-rose-500" : ""
                )}
                onChange={handleContactChange}
              />
            </div>
            {errors.contactNumber && (
              <p className="text-xs text-rose-500 font-medium mt-1 pl-3">{errors.contactNumber}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom-landmark" className="text-kling-forest">
              Landmark of Shipping/Meetup <RequiredMark />
            </Label>
            <Input
              id="custom-landmark"
              name="landmark"
              placeholder="Enter landmark or preferred meetup location"
              required
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button className="h-12 px-7" type="submit" disabled={submitting}>
            <Send className="h-4 w-4" />
            {submitting ? "Submitting..." : "Submit Request"}
          </Button>
        </div>
      </form>
    </div>
  );
}
