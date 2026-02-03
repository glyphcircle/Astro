import React from 'react';
import { cloudManager } from '../services/cloudManager';

interface TemplatedReportWrapperProps {
  template: any;
  children: React.ReactNode;
}

const TemplatedReportWrapper: React.FC<TemplatedReportWrapperProps> = ({ 
  template, 
  children 
}) => {
  const config = template?.content_area_config || {
    marginTop: 200,
    marginBottom: 150,
    marginLeft: 120,
    marginRight: 120,
    textColor: '#1a1a1a',
    fontFamily: 'Lora, serif',
    backgroundColor: 'transparent'
  };
  
  const bgUrl = template ? cloudManager.resolveImage(template.template_image_url) : "https://www.transparenttextures.com/patterns/handmade-paper.png";
  
  return (
    <div 
      className="report-global-container w-full flex flex-col items-center bg-[#0a0a1a] py-12 px-4 min-h-screen"
    >
      <div 
        className="report-pages-stack flex flex-col gap-12"
        style={{
          '--template-bg': `url(${bgUrl})`,
          '--margin-top': `${config.marginTop}px`,
          '--margin-bottom': `${config.marginBottom}px`,
          '--margin-left': `${config.marginLeft}px`,
          '--margin-right': `${config.marginRight}px`,
          '--report-text-color': config.textColor,
          '--report-font': config.fontFamily
        } as React.CSSProperties}
      >
        {children}
      </div>
      
      <style>{`
        .report-page {
          position: relative;
          width: 210mm;
          min-height: 297mm;
          background-image: var(--template-bg);
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          background-color: #fffcf0;
          box-shadow: 0 40px 100px rgba(0,0,0,0.5);
          overflow: hidden;
          page-break-after: always;
          color: var(--report-text-color);
          font-family: var(--report-font);
          display: flex;
          flex-direction: column;
        }
        
        .page-content {
          padding-top: var(--margin-top);
          padding-bottom: var(--margin-bottom);
          padding-left: var(--margin-left);
          padding-right: var(--margin-right);
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          z-index: 10;
        }

        @media print {
          .report-global-container { padding: 0; background: white; }
          .report-page { box-shadow: none; margin: 0; }
        }
      `}</style>
    </div>
  );
};

export default TemplatedReportWrapper;