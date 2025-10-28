import { supabase } from './supabase';

export type UploadResult = {
  url: string;
};

export async function uploadPublicFile(
  bucket: string,
  file: File,
  options?: { pathPrefix?: string }
): Promise<UploadResult> {
  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9-_.]/g, '-');
  const filePath = `${options?.pathPrefix ?? ''}${timestamp}-${sanitizedName}`;

  const { error } = await supabase.storage.from(bucket).upload(filePath, file, {
    upsert: true,
  });

  if (error) throw error;

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(filePath);

  return { url: publicUrl };
}
