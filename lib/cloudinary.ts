// Laster opp en fil til Cloudinary med usignert opplasting (kjøres i nettleseren).
export async function uploadToCloudinary(file: File): Promise<string> {
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
