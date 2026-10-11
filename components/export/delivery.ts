import { copyText } from "../icons/clipboard";

/** Result of a copy / download, ready to show as feedback. */
export interface Outcome {
  ok: boolean;
  message: string;
}

export { copyText };

/** Save a blob as a file through a temporary link. */
export function downloadBlob(blob: Blob, filename: string): Outcome {
  try {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    // Give the browser a moment to start the download before releasing the URL.
    window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
    return { ok: true, message: `Downloaded ${filename}` };
  } catch {
    return { ok: false, message: "The browser blocked the download." };
  }
}

export const downloadText = (text: string, filename: string, type = "text/plain") => downloadBlob(new Blob([text], { type: `${type};charset=utf-8` }), filename);

/** Put an image on the clipboard. Needs a secure context and (in some browsers) a user gesture. */
export async function copyImage(blob: Blob): Promise<Outcome> {
  try {
    if (!navigator.clipboard || typeof ClipboardItem === "undefined") {
      return { ok: false, message: "Image copy isn't supported in this browser. Download the PNG instead." };
    }
    await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
    return { ok: true, message: "Copied PNG to the clipboard" };
  } catch (error) {
    const denied = error instanceof DOMException && error.name === "NotAllowedError";
    return { ok: false, message: denied ? "The browser blocked clipboard access. Allow it for this site, or download the PNG." : "Couldn't copy the image. Download the PNG instead." };
  }
}

export async function copyCode(text: string, what = "code"): Promise<Outcome> {
  const ok = await copyText(text);
  return ok ? { ok, message: `Copied ${what}` } : { ok, message: "Couldn't access the clipboard. Select the code and copy it manually." };
}
