import { toBlob, toPng } from 'html-to-image';
import { EMBEDDED_FONT_CSS } from './embeddedFont';

/**
 * Exports an HTML element as a high-precision, high-resolution PNG image.
 * Uses exact A4 dimensions (210mm x 297mm with 10mm margins) for full sheets,
 * strips interactive controls, embeds offline Arabic fonts, and prevents text wrapping bugs.
 */
export async function exportElementAsImage(
  element: HTMLElement,
  filename: string,
  onStart?: () => void,
  onComplete?: () => void,
  onError?: (err: any) => void
) {
  let stagingContainer: HTMLDivElement | null = null;

  try {
    if (onStart) onStart();

    const isA4Sheet =
      element.classList.contains('a4-sheet') ||
      Boolean(element.querySelector('.a4-sheet'));

    // Exact A4 dimensions in CSS pixels at standard 96 DPI:
    // 210mm = 793.7px (~794px), 297mm = 1122.5px (~1123px), 10mm margins = 37.8px (~38px)
    // Printable content width inside margins = 794 - 2 * 38 = 718px
    const targetWidth = isA4Sheet ? 794 : 718;

    // Create an isolated staging container offscreen
    stagingContainer = document.createElement('div');
    stagingContainer.id = '__export_sandbox__';
    stagingContainer.style.position = 'fixed';
    stagingContainer.style.left = '-10000px';
    stagingContainer.style.top = '0';
    stagingContainer.style.width = `${targetWidth}px`;
    stagingContainer.style.maxWidth = `${targetWidth}px`;
    stagingContainer.style.minWidth = `${targetWidth}px`;
    stagingContainer.style.backgroundColor = '#ffffff';
    stagingContainer.style.boxSizing = 'border-box';
    stagingContainer.style.zIndex = '-9999';
    stagingContainer.style.opacity = '1';
    stagingContainer.style.pointerEvents = 'none';
    stagingContainer.dir = 'rtl';

    // Clone target node
    const clone = element.cloneNode(true) as HTMLElement;

    // Remove all interactive control elements marked with 'no-print'
    clone.querySelectorAll('.no-print').forEach((node) => node.remove());

    // Apply exact standard geometry to the clone to guarantee consistent measurements
    if (isA4Sheet) {
      clone.style.width = '794px';
      clone.style.minWidth = '794px';
      clone.style.maxWidth = '794px';
      clone.style.minHeight = '1123px';
      clone.style.padding = '38px'; // 10mm margins
      clone.style.margin = '0 auto';
      clone.style.border = 'none';
      clone.style.boxShadow = 'none';
      clone.style.backgroundColor = '#ffffff';
      clone.style.boxSizing = 'border-box';
    } else {
      clone.style.width = '718px';
      clone.style.minWidth = '718px';
      clone.style.maxWidth = '718px';
      clone.style.margin = '0';
      clone.style.boxShadow = 'none';
      clone.style.backgroundColor = '#ffffff';
      clone.style.boxSizing = 'border-box';
    }

    stagingContainer.appendChild(clone);
    document.body.appendChild(stagingContainer);

    // Ensure fonts are loaded and layout pass has occurred
    if (document.fonts?.ready) {
      try {
        await document.fonts.ready;
      } catch (e) {
        console.warn('fonts.ready wait ignored:', e);
      }
    }
    // Brief layout stabilization
    await new Promise((resolve) => setTimeout(resolve, 80));

    // High resolution capture (pixelRatio: 2.5 gives ~2000px - 2400px width print quality)
    const exportOptions = {
      quality: 0.98,
      pixelRatio: 2.5,
      backgroundColor: '#ffffff',
      fontEmbedCSS: EMBEDDED_FONT_CSS,
      cacheBust: false,
    };

    let blob: Blob | null = null;
    try {
      blob = await toBlob(clone, exportOptions);
    } catch (primaryErr) {
      console.warn('toBlob attempt failed, falling back to toPng:', primaryErr);
    }

    if (blob) {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
        URL.revokeObjectURL(url);
      }, 1000);
    } else {
      // Fallback to toPng
      const dataUrl = await toPng(clone, exportOptions);
      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
      }, 1000);
    }

    if (onComplete) onComplete();
  } catch (error) {
    console.error('Export failed:', error);
    if (onError) onError(error);
  } finally {
    // Clean up staging container
    if (stagingContainer && document.body.contains(stagingContainer)) {
      document.body.removeChild(stagingContainer);
    }
  }
}
