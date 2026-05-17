// Tillatte bildeformater og maks filstørrelse. Cloudinary håndhever ikke
// dette i preset-en på gratisplanen, så vi gjør det på klientsiden.
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

// Laster opp en fil til Cloudinary med usignert opplasting (kjøres i nettleseren).
export async function uploadToCloudinary(file: File): Promise<string> {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Bildet må være JPG, PNG eller WebP.");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Bildet er for stort — maks 5 MB.");
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  if (!cloudName || !preset) {
    throw new Error("Cloudinary er ikke konfigurert.");
  }

  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", preset);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: form },
  );
  if (!res.ok) {
    throw new Error("Opplasting feilet.");
  }

  const data = (await res.json()) as { secure_url?: string };
  if (!data.secure_url) {
    throw new Error("Fikk ikke noen bilde-URL tilbake.");
  }
  return data.secure_url;
}

// Godtar kun bilde-URL-er fra vår egen Cloudinary-konto. Hindrer at en bruker
// lagrer en vilkårlig ekstern URL (f.eks. en sporingspiksel) som vises på den
// offentlige siden. Returnerer en gyldig URL, eller null.
export function sanitizeImageUrl(
  url: string | null | undefined,
): string | null {
  const u = (url ?? "").trim();
  if (!u) return null;
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (cloud && u.startsWith(`https://res.cloudinary.com/${cloud}/`)) {
    return u;
  }
  return null;
}

export function hasCloudinary(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
  );
}

// Laster opp et bilde fra en ekstern URL — Cloudinary henter selv filen.
// Brukes til å lagre AI-genererte bilder permanent (Replicate-URL-er utløper).
export async function uploadImageFromUrl(url: string): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  if (!cloudName || !preset) {
    throw new Error("Cloudinary er ikke konfigurert.");
  }

  const form = new FormData();
  form.append("file", url);
  form.append("upload_preset", preset);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: form },
  );
  if (!res.ok) {
    throw new Error("Opplasting til Cloudinary feilet.");
  }
  const data = (await res.json()) as { secure_url?: string };
  if (!data.secure_url) {
    throw new Error("Cloudinary returnerte ingen bilde-URL.");
  }
  return data.secure_url;
}
