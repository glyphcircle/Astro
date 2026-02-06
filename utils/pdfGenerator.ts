import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PDFOptions {
  filename?: string;
  quality?: number;
  marginTop?: number;
  marginSide?: number;
}

/**
 * ✅ UNIVERSAL PDF GENERATOR
 * Works for ALL services: Numerology, Astrology, Palmistry, Tarot, Face Reading, Dream Analysis
 * 
 * Usage:
 * await generatePDF('service-report-content', { 
 *   filename: 'report.pdf',
 *   quality: 0.9,
 *   marginSide: 10 
 * });
 */
export const generatePDF = async (elementId: string, options: PDFOptions = {}): Promise<void> => {
  const {
    filename = 'report.pdf',
    quality = 0.95,
    marginTop = 8,
    marginSide = 10,
  } = options;

  try {
    console.log('📄 [PDF] Starting universal generation for:', elementId);

    // ============================================
    // STEP 1: INTELLIGENT ELEMENT VALIDATION
    // ============================================
    const original = await waitForElementWithContent(elementId);
    if (!original) {
      throw new Error(`Element #${elementId} not found or has no content`);
    }

    console.log('✅ [PDF] Element validated:', {
      id: elementId,
      height: original.offsetHeight,
      width: original.offsetWidth,
      children: original.children.length
    });

    // ============================================
    // STEP 2: SHOW LOADING INDICATOR
    // ============================================
    const loadingDiv = createLoadingIndicator();
    document.body.appendChild(loadingDiv);

    // Small delay to ensure loading indicator renders
    await delay(100);

    // ============================================
    // STEP 3: CREATE OPTIMIZED CLONE
    // ============================================
    const wrapper = createPDFWrapper();
    const clone = original.cloneNode(true) as HTMLElement;

    // Normalize clone for PDF capture
    normalizeCloneForPDF(clone);

    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    // Wait for fonts, images, and layout stabilization
    await Promise.all([
      document.fonts.ready,
      waitForImages(wrapper),
      delay(800) // Allow complex layouts to stabilize
    ]);

    console.log('✅ [PDF] Clone prepared and stabilized');

    // ============================================
    // STEP 4: CAPTURE AS CANVAS
    // ============================================
    const canvas = await html2canvas(wrapper, {
      scale: 2, // High quality
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: wrapper.offsetWidth,
      windowHeight: wrapper.offsetHeight,
      onclone: (clonedDoc) => {
        // Additional cleanup in cloned document
        const clonedWrapper = clonedDoc.getElementById('pdf-capture-wrapper');
        if (clonedWrapper) {
          // Remove no-print elements
          const noPrintElements = clonedWrapper.querySelectorAll('.no-print');
          noPrintElements.forEach(el => el.remove());
        }
      }
    });

    // Cleanup wrapper
    document.body.removeChild(wrapper);

    console.log('✅ [PDF] Canvas captured:', {
      width: canvas.width,
      height: canvas.height
    });

    // ============================================
    // STEP 5: GENERATE PDF WITH PAGINATION
    // ============================================
    const pdf = await createPDFFromCanvas(canvas, {
      quality,
      marginTop,
      marginSide
    });

    // ============================================
    // STEP 6: SAVE AND CLEANUP
    // ============================================
    pdf.save(filename);
    removeLoadingIndicator(loadingDiv);
    showNotification('✅ PDF Downloaded Successfully!', 'success');

    console.log('✅ [PDF] Generation complete:', filename);

  } catch (error) {
    console.error('❌ [PDF] Generation failed:', error);
    removeLoadingIndicator(document.getElementById('pdf-loading'));
    showNotification('❌ PDF generation failed. Please try again.', 'error');
    throw error;
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Wait for element to exist AND have actual rendered content
 */
async function waitForElementWithContent(elementId: string, maxAttempts = 20): Promise<HTMLElement | null> {
  for (let i = 0; i < maxAttempts; i++) {
    const element = document.getElementById(elementId);
    
    if (element && 
        element.offsetHeight > 100 && 
        element.offsetWidth > 100 &&
        element.children.length > 0) {
      return element;
    }
    
    console.log(`⏳ [PDF] Waiting for content... attempt ${i + 1}/${maxAttempts}`);
    await delay(200);
  }
  
  return null;
}

/**
 * Wait for all images in element to load
 */
async function waitForImages(element: HTMLElement): Promise<void> {
  const images = Array.from(element.querySelectorAll('img'));
  const promises = images.map(img => {
    if (img.complete) return Promise.resolve();
    return new Promise((resolve) => {
      img.onload = resolve;
      img.onerror = resolve; // Continue even if image fails
      setTimeout(resolve, 2000); // Timeout after 2s
    });
  });
  await Promise.all(promises);
}

/**
 * Create wrapper for PDF capture
 */
function createPDFWrapper(): HTMLDivElement {
  const wrapper = document.createElement('div');
  wrapper.id = 'pdf-capture-wrapper';
  wrapper.style.position = 'fixed';
  wrapper.style.left = '-10000px';
  wrapper.style.top = '0';
  wrapper.style.width = '210mm'; // A4 width
  wrapper.style.background = '#ffffff';
  wrapper.style.padding = '0';
  wrapper.style.margin = '0';
  return wrapper;
}

/**
 * Normalize clone for consistent PDF rendering
 */
function normalizeCloneForPDF(clone: HTMLElement): void {
  // Reset margins and padding
  clone.style.margin = '0';
  clone.style.padding = '0';
  clone.style.width = '100%';
  clone.style.boxSizing = 'border-box';

  // Remove no-print elements
  const noPrintElements = clone.querySelectorAll('.no-print');
  noPrintElements.forEach(el => el.remove());

  // Fix alignment: Change justify-center to justify-start for PDF
  const centeredElements = clone.querySelectorAll('.justify-center');
  centeredElements.forEach(el => {
    (el as HTMLElement).style.justifyContent = 'flex-start';
  });

  // Normalize full-height sections
  const fullHeightSections = clone.querySelectorAll('.min-h-screen, .min-h-\\[297mm\\]');
  fullHeightSections.forEach(el => {
    const page = el as HTMLElement;
    page.style.minHeight = '275mm'; // Slightly less than A4
    page.style.paddingTop = '15mm';
    page.style.marginBottom = '0';
  });

  // Target content wrapper for consistent spacing
  const contentWrapper = clone.querySelector('.content-wrapper') as HTMLElement;
  if (contentWrapper) {
    contentWrapper.style.paddingTop = '10mm';
    contentWrapper.style.marginTop = '0';
  }

  // Ensure backgrounds are visible
  const sections = clone.querySelectorAll('section, div[class*="bg-"]');
  sections.forEach(el => {
    const element = el as HTMLElement;
    const bgColor = window.getComputedStyle(element).backgroundColor;
    if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)') {
      element.style.backgroundColor = bgColor;
    }
  });
}

/**
 * Create PDF from canvas with intelligent pagination
 */
async function createPDFFromCanvas(
  canvas: HTMLCanvasElement,
  options: { quality: number; marginTop: number; marginSide: number }
): Promise<jsPDF> {
  const { quality, marginTop, marginSide } = options;
  
  const imgData = canvas.toDataURL('image/jpeg', quality);
  
  // A4 dimensions in mm
  const pdfWidth = 210;
  const pdfHeight = 297;
  
  // Calculate image dimensions
  const imgWidth = pdfWidth - (marginSide * 2);
  const pageContentHeight = pdfHeight - (marginTop * 2);
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });
  
  let heightLeft = imgHeight;
  let pageIndex = 0;
  
  while (heightLeft > 0) {
    const yOffset = marginTop - (pageIndex * pageContentHeight);
    
    // Skip nearly blank pages
    if (pageIndex > 0 && heightLeft < 5) {
      break;
    }
    
    if (pageIndex > 0) {
      pdf.addPage();
    }
    
    pdf.addImage(imgData, 'JPEG', marginSide, yOffset, imgWidth, imgHeight, undefined, 'FAST');
    
    heightLeft -= pageContentHeight;
    pageIndex++;
  }
  
  console.log(`📄 [PDF] Generated ${pageIndex} pages`);
  
  return pdf;
}

/**
 * Create loading indicator
 */
function createLoadingIndicator(): HTMLDivElement {
  const loadingDiv = document.createElement('div');
  loadingDiv.id = 'pdf-loading';
  loadingDiv.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      backdrop-filter: blur(8px);
    ">
      <div style="
        background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
        padding: 48px;
        border-radius: 24px;
        text-align: center;
        border: 2px solid #f59e0b;
        box-shadow: 0 25px 50px -12px rgba(245, 158, 11, 0.3);
        max-width: 400px;
      ">
        <div style="
          width: 60px;
          height: 60px;
          border: 4px solid rgba(245, 158, 11, 0.2);
          border-top-color: #f59e0b;
          border-radius: 50%;
          animation: pdf-spin 0.8s linear infinite;
          margin: 0 auto 24px;
        "></div>
        <h3 style="
          color: #f59e0b;
          font-family: 'Cinzel', serif;
          font-size: 24px;
          margin: 0 0 12px;
          font-weight: bold;
          letter-spacing: 1px;
        ">Generating PDF</h3>
        <p style="
          color: #999;
          font-family: 'Lora', serif;
          font-size: 14px;
          margin: 0 0 8px;
          line-height: 1.6;
        ">Capturing report content...</p>
        <p style="
          color: #666;
          font-family: monospace;
          font-size: 11px;
          margin: 0;
        ">Please wait, this may take a moment</p>
      </div>
    </div>
    <style>
      @keyframes pdf-spin {
        to { transform: rotate(360deg); }
      }
    </style>
  `;
  return loadingDiv;
}

/**
 * Remove loading indicator
 */
function removeLoadingIndicator(element: HTMLElement | null): void {
  if (element && element.parentNode) {
    document.body.removeChild(element);
  }
}

/**
 * Show notification
 */
function showNotification(message: string, type: 'success' | 'error'): void {
  const notification = document.createElement('div');
  notification.innerHTML = `
    <div style="
      position: fixed;
      top: 24px;
      right: 24px;
      background: ${type === 'success' ? '#10b981' : '#ef4444'};
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      z-index: 10000;
      animation: slideIn 0.3s ease-out;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      font-weight: 600;
      max-width: 350px;
    ">
      ${message}
    </div>
    <style>
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    </style>
  `;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    if (notification.parentNode) {
      document.body.removeChild(notification);
    }
  }, 4000);
}

/**
 * Simple delay utility
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}