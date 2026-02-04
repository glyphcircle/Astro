import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PDFOptions {
  filename?: string;
  quality?: number;
  marginTop?: number;
  marginSide?: number;
}

/**
 * Generate PDF from HTML element with improved pagination and margin control.
 * Optimized to remove blank pages, hide interactive elements, and handle page breaks better.
 */
export const generatePDF = async (
  elementId: string,
  options: PDFOptions = {}
): Promise<void> => {
  const {
    filename = 'report.pdf',
    quality = 0.95,
    marginTop = 8,
    marginSide = 10,
  } = options;

  try {
    console.log('📄 Starting optimized PDF generation for:', elementId);
    const original = document.getElementById(elementId);
    
    if (!original) {
      throw new Error(`Element with ID "${elementId}" not found in DOM`);
    }

    // Show loading indicator
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'pdf-loading';
    loadingDiv.innerHTML = `
      <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                  background: rgba(0,0,0,0.9); color: white; padding: 30px 50px; 
                  border-radius: 12px; z-index: 99999; text-align: center;">
        <div style="font-size: 20px; font-weight: 600; margin-bottom: 10px;">Generating Decree</div>
        <div style="font-size: 14px; opacity: 0.8;">Trimming margins & aligning destiny...</div>
      </div>
    `;
    document.body.appendChild(loadingDiv);

    // 1. Prepare a clean clone for capture
    const wrapper = document.createElement('div');
    wrapper.id = 'pdf-capture-wrapper';
    wrapper.style.position = 'fixed';
    wrapper.style.left = '-10000px';
    wrapper.style.top = '0';
    wrapper.style.width = '210mm';
    wrapper.style.background = '#ffffff';
    wrapper.style.padding = '0';
    wrapper.style.margin = '0';

    const clone = original.cloneNode(true) as HTMLElement;

    // Normalize clone margins/paddings
    clone.style.margin = '0';
    clone.style.padding = '0';
    clone.style.width = '100%';

    // *** FIX 1: HIDE ALL INTERACTIVE ELEMENTS ***
    const interactiveSelectors = [
      'button',
      '.download-button',
      '.no-print',
      '[class*="button"]',
      '[type="submit"]',
      'input',
      'textarea',
      'select',
      '.interactive-element'
    ];
    
    interactiveSelectors.forEach(selector => {
      const elements = clone.querySelectorAll(selector);
      elements.forEach(el => {
        (el as HTMLElement).style.display = 'none';
      });
    });

    // *** FIX 2: HIDE SPECIFIC BUTTONS BY TEXT CONTENT ***
    const allButtons = clone.querySelectorAll('*');
    allButtons.forEach(el => {
      const text = el.textContent?.trim().toUpperCase() || '';
      if (
        text.includes('DOWNLOAD') ||
        text.includes('GET KIT') ||
        text.includes('SEND QUERY') ||
        text.includes('LISTEN AUDIO') ||
        el.tagName === 'BUTTON'
      ) {
        (el as HTMLElement).style.display = 'none';
      }
    });

    // Override specific layout classes that push content down
    const centeredElements = clone.querySelectorAll('.justify-center');
    centeredElements.forEach(el => {
      (el as HTMLElement).style.justifyContent = 'flex-start';
    });

    // *** FIX 3: BETTER PAGE BREAK HANDLING ***
    const fullHeightSections = clone.querySelectorAll('.min-h-screen, .min-h-\\[297mm\\]');
    fullHeightSections.forEach(el => {
      const page = el as HTMLElement;
      page.style.minHeight = 'auto'; // Changed from fixed height
      page.style.paddingTop = '15mm';
      page.style.paddingBottom = '15mm'; // Added bottom padding
      page.style.marginBottom = '0';
      page.style.pageBreakInside = 'avoid'; // CSS hint for better breaks
    });

    // *** FIX 4: ADD PAGE BREAK HINTS TO SECTIONS ***
    const sections = clone.querySelectorAll('section, .section-container, [class*="section"]');
    sections.forEach(el => {
      const section = el as HTMLElement;
      section.style.pageBreakInside = 'avoid';
      section.style.breakInside = 'avoid';
    });

    // Target the specific report wrapper internal padding
    const contentWrapper = clone.querySelector('.content-wrapper') as HTMLElement;
    if (contentWrapper) {
      contentWrapper.style.paddingTop = '10mm';
      contentWrapper.style.marginTop = '0';
    }

    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    // Wait for fonts and images to load
    await document.fonts.ready;
    await new Promise(resolve => setTimeout(resolve, 800)); // Increased wait time

    // 2. Capture the element as canvas
    const canvas = await html2canvas(wrapper, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: wrapper.offsetWidth,
      windowHeight: wrapper.offsetHeight,
      onclone: (clonedDoc) => {
        // Additional cleanup in cloned document
        const clonedElement = clonedDoc.getElementById('pdf-capture-wrapper');
        if (clonedElement) {
          const buttons = clonedElement.querySelectorAll('button, [role="button"]');
          buttons.forEach(btn => {
            (btn as HTMLElement).style.display = 'none';
          });
        }
      }
    });

    // Cleanup hidden wrapper
    document.body.removeChild(wrapper);

    const imgData = canvas.toDataURL('image/jpeg', quality);

    // 3. Calculate PDF dimensions
    const pdfWidth = 210;
    const pdfHeight = 297;
    const imgWidth = pdfWidth - (marginSide * 2);
    const pageContentHeight = pdfHeight - (marginTop * 2);
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    // 4. Improved Multi-page Pagination Logic
    let heightLeft = imgHeight;
    let pageIndex = 0;

    while (heightLeft > 0) {
      const yOffset = marginTop - (pageIndex * pageContentHeight);

      // Protection against nearly blank pages
      if (pageIndex > 0 && heightLeft < 10) { // Increased threshold from 5 to 10
        break;
      }

      if (pageIndex > 0) {
        pdf.addPage();
      }

      pdf.addImage(
        imgData, 
        'JPEG', 
        marginSide, 
        yOffset, 
        imgWidth, 
        imgHeight, 
        undefined, 
        'FAST'
      );

      heightLeft -= pageContentHeight;
      pageIndex++;
    }

    console.log(`✅ PDF manifested with ${pageIndex} page(s)`);

    // 5. Save the PDF
    pdf.save(filename);

    // Remove loading indicator
    const currentLoader = document.getElementById('pdf-loading');
    if (currentLoader) {
      document.body.removeChild(currentLoader);
    }

    // Success notification
    showNotification('PDF Decree Manifested! ✨', 'success');

  } catch (error) {
    console.error('❌ PDF generation failed:', error);
    
    const currentLoader = document.getElementById('pdf-loading');
    if (currentLoader) {
      document.body.removeChild(currentLoader);
    }

    showNotification('Manifestation failed. Please try again.', 'error');
    throw error;
  }
};

/**
 * Show unobtrusive notification
 */
const showNotification = (message: string, type: 'success' | 'error') => {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#10b981' : '#ef4444'};
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    z-index: 99999;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    animation: slideIn 0.3s ease-out;
    pointer-events: none;
  `;
  notification.innerHTML = `${type === 'success' ? '✨' : '⚠️'} ${message}`;
  
  document.body.appendChild(notification);

  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => {
        if (notification.parentNode) {
          document.body.removeChild(notification);
        }
      }, 300);
    }
  }, 4000);
};
