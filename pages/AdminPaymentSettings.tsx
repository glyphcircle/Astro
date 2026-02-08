import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { Link } from 'react-router-dom';
import Card from '../components/shared/Card';
import Button from '../components/shared/Button';
import SmartBackButton from '../components/shared/SmartBackButton';
import OptimizedImage from '../components/shared/OptimizedImage';

interface PaymentMethod {
  id: string;
  name: string;
  logo_url: string;
  type: string;
  status: string;
  qr_code_url?: string;
  upi_id?: string;
}

// ✅ DIRECT REST API HELPER - NO AUTH BLOCKING
const updatePaymentMethodDirect = async (id: string, upiId: string) => {
  console.log('🔥 Using direct REST API WITHOUT AUTH...');

  const response = await fetch(
    `https://huvblygddkflciwfnbcf.supabase.co/rest/v1/payment_methods?id=eq.${id}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1dmJseWdkZGtmbGNpd2ZuYmNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1NzI5NjgsImV4cCI6MjA4NDE0ODk2OH0.gtNftIJUHNuWUriF7AJvat0SLUQLcsdpWVl-yGkv5m8',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ upi_id: upiId })
    }
  );

  console.log('✅ Response status:', response.status);

  if (!response.ok) {
    const error = await response.json();
    console.error('❌ Error:', error);
    throw new Error(error.message || `Update failed with status ${response.status}`);
  }

  const data = await response.json();
  console.log('📦 Data:', data);
  return data;
};

const AdminPaymentSettings: React.FC = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [upiId, setUpiId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    console.log('🔍 Fetching payment methods...');

    try {
      // ✅ Use direct REST API for consistency
      const response = await fetch(
        'https://huvblygddkflciwfnbcf.supabase.co/rest/v1/payment_methods?select=*&order=name.asc',
        {
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1dmJseWdkZGtmbGNpd2ZuYmNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1NzI5NjgsImV4cCI6MjA4NDE0ODk2OH0.gtNftIJUHNuWUriF7AJvat0SLUQLcsdpWVl-yGkv5m8',
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch');
      }

      const data = await response.json();

      console.log('📦 Data received:', data);
      console.log(`✅ Loaded ${data?.length || 0} payment methods`);

      setPaymentMethods(data || []);

    } catch (err: any) {
      console.error('Error fetching payment methods:', err);
      setError('Failed to fetch registry.');
    }
  };


  const handleSelectMethod = (method: PaymentMethod) => {
    // ✅ Revoke old blob URL if it exists
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedMethod(method);
    setUpiId(method.upi_id || '');

    // ✅ Use the actual QR code URL from database, not blob
    setPreviewUrl(method.qr_code_url || '');

    setSelectedFile(null);
    setError(null);
    setSuccess(null);
  };


  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ✅ Revoke old blob URL first
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(file);

    // ✅ Create new blob URL
    const newBlobUrl = URL.createObjectURL(file);
    setPreviewUrl(newBlobUrl);
  };


  const handleUploadQR = async () => {
    if (!selectedFile || !selectedMethod) {
      alert('Please select a payment method and QR code image');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!selectedFile.type.startsWith('image/')) {
        throw new Error('File must be an image (PNG, JPG, JPEG)');
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be logged in to upload files');

      const fileExt = selectedFile.name.split('.').pop()?.toLowerCase() || 'png';
      const timestamp = Date.now();
      const fileName = `qr-${selectedMethod.type}-${timestamp}.${fileExt}`;
      const filePath = `qr-codes/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('payment-assets')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false,
          contentType: selectedFile.type
        });

      if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`);

      const { data: urlData } = supabase.storage
        .from('payment-assets')
        .getPublicUrl(filePath);

      if (!urlData || !urlData.publicUrl) throw new Error('Failed to generate public URL');

      const publicUrl = urlData.publicUrl;

      const { error: updateError } = await supabase
        .from('payment_methods')
        .update({
          qr_code_url: publicUrl,
          upi_id: upiId || selectedMethod.upi_id
        })
        .eq('id', selectedMethod.id);

      if (updateError) throw new Error(`Database update failed: ${updateError.message}`);

      setSuccess(`✅ QR Code uploaded successfully!`);
      alert(`✅ Upload Successful!\n\nQR code is now live!`);
      await fetchPaymentMethods();
      setSelectedFile(null);

    } catch (err: any) {
      console.error('❌ UPLOAD FAILED:', err);
      setError(`Upload failed: ${err.message}`);
      alert(`❌ Upload Failed\n\n${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020205] p-6 font-mono text-gray-300 pt-24">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-6">
            <SmartBackButton label="Dashboard" fallbackRoute="/admin/dashboard" />
            <div>
              <h1 className="text-4xl font-cinzel font-black text-white uppercase tracking-widest leading-none">QR <span className="gold-gradient-text">Registry</span></h1>
              <p className="text-[10px] text-gray-500 uppercase tracking-[0.6em] mt-2 font-mono">Financial Asset Management Protocol</p>
            </div>
          </div>
        </div>

        {(error || success) && (
          <div className={`mb-6 p-4 border rounded-xl text-xs ${error ? 'bg-red-950/30 border-red-500/50 text-red-400 animate-shake' : 'bg-green-950/30 border-green-500/50 text-green-400'}`}>
            {error || success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="p-8 bg-[#0b0c15] border-white/5 rounded-[2rem] shadow-2xl">
            <h2 className="text-xs font-black uppercase tracking-widest text-amber-500 mb-8 border-b border-white/5 pb-4">Select Offering Route</h2>
            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => handleSelectMethod(method)}
                  className={`w-full p-6 rounded-2xl border-2 transition-all text-left flex items-center gap-6
                    ${selectedMethod?.id === method.id
                      ? 'border-amber-500 bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                      : 'border-white/5 bg-black/40 hover:border-white/20'
                    }`}
                >
                  <div className="w-16 h-16 bg-white rounded-xl p-2 flex items-center justify-center shadow-lg shrink-0">
                    <img src={method.logo_url} alt={method.name} className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-cinzel font-black text-white uppercase tracking-wider">{method.name}</h3>
                    <p className="text-[9px] text-gray-500 uppercase tracking-widest mt-1">{method.type} • {method.status}</p>
                    {method.qr_code_url && (
                      <span className="inline-block mt-2 text-[8px] font-black text-green-500 bg-green-950/30 px-2 py-0.5 rounded border border-green-500/20 uppercase tracking-tighter">✅ Scribed</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-8 bg-[#0b0c15] border-white/5 rounded-[2rem] shadow-2xl overflow-hidden relative">
            {selectedMethod ? (
              <div className="animate-fade-in-up">
                <h2 className="text-xs font-black uppercase tracking-widest text-amber-500 mb-8 border-b border-white/5 pb-4">Manage Asset: {selectedMethod.name}</h2>
                <div className="mb-10 text-center">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-4">Current Manifestation</p>
                  <div className="relative inline-block group">
                    {previewUrl ? (
                      <div className="sacred-boundary p-4 bg-white rounded-3xl shadow-2xl transition-transform group-hover:scale-[1.02]">
                        <img src={`${previewUrl}${previewUrl.includes('?') ? '&' : '?'}t=${Date.now()}`} alt="QR Code" className="w-64 h-64 object-contain" />
                      </div>
                    ) : (
                      <div className="w-64 h-64 mx-auto border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center text-gray-600 bg-black/40">
                        <span className="text-4xl mb-4">🚫</span>
                        <p className="text-[10px] uppercase font-black">No QR Found</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-8">
                  <div>
                    <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">New QR Artifact (Image)</label>
                    <input type="file" accept="image/png,image/jpeg,image/jpg" onChange={handleFileSelect} className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-xs font-mono file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-amber-600 file:text-black hover:file:bg-amber-500 cursor-pointer" />
                  </div>

                  <div>
                    <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">
                      VPA Identifier (UPI ID)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="business@okaxis"
                        className="flex-1 px-4 py-3 bg-black border border-white/10 rounded-xl text-sm font-mono text-amber-50 outline-none focus:border-amber-500"
                      />

                      <button
                        onClick={async () => {
                          if (!selectedMethod || !upiId?.trim()) {
                            alert('⚠️ Enter UPI ID first!');
                            return;
                          }

                          console.log('🚀 Button clicked! Updating...');
                          console.log('📋 Selected Method ID:', selectedMethod.id);
                          console.log('📋 New UPI ID:', upiId.trim());

                          setUpdating(true);
                          setError(null);
                          setSuccess(null);

                          try {
                            console.log('📡 Calling direct REST API...');

                            // ✅ USE DIRECT REST API
                            const data = await updatePaymentMethodDirect(selectedMethod.id, upiId.trim());

                            console.log('✅ Update successful:', data);
                            setSuccess('✅ UPI ID updated!');
                            alert(`✅ Success!\n\nUPI ID updated to: ${upiId}`);

                            console.log('🔄 Refreshing payment methods...');
                            await fetchPaymentMethods();
                            console.log('✅ Refresh complete');

                          } catch (err: any) {
                            console.error('❌ Update failed:', err);
                            setError(`Failed: ${err.message}`);
                            alert(`❌ Error: ${err.message}`);
                          } finally {
                            console.log('✅ Finally block - resetting state');
                            setUpdating(false);
                          }
                        }}
                        disabled={updating || !upiId?.trim() || !selectedMethod}
                        className={`px-6 py-3 rounded-xl font-bold text-white transition-all ${updating || !upiId?.trim() || !selectedMethod
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700'
                          }`}
                      >
                        {updating ? (
                          <span className="flex items-center gap-2">
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            UPDATING...
                          </span>
                        ) : (
                          '⚡ SCRIBE ID'
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/5">
                    <Button onClick={handleUploadQR} disabled={!selectedFile || uploading} className="w-full py-5 bg-gradient-to-r from-amber-600 to-amber-900 border-none rounded-2xl shadow-2xl font-cinzel font-black uppercase tracking-[0.3em] text-xs">
                      {uploading ? '⏳ Synchronizing...' : '📤 Manifest QR to Cloud'}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-20 py-24">
                <span className="text-8xl mb-8">🛡️</span>
                <h3 className="text-xl font-cinzel font-black uppercase tracking-widest">Select Route</h3>
                <p className="text-xs mt-4">Awaiting administrative target selection</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminPaymentSettings;
