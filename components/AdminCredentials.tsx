
import React from 'react';
import Modal from './shared/Modal';

interface Props {
  isVisible: boolean;
  onClose: () => void;
}

const AdminCredentials: React.FC<Props> = ({ isVisible, onClose }) => {
  return (
    <Modal isVisible={isVisible} onClose={onClose}>
      <div className="p-6 bg-gray-900 text-green-400 font-mono border border-green-500/30 rounded-lg">
        <h3 className="text-xl font-bold mb-4 border-b border-green-500/30 pb-2">Admin Credentials</h3>
        
        <div className="space-y-4">
          <div className="bg-black/40 p-3 rounded border border-green-500/20">
            <p className="text-xs text-green-600 uppercase mb-1">Account 1 (Admin)</p>
            <div className="flex justify-between">
                <span>User:</span>
                <span className="text-white select-all">admin@gylphcircle.com</span>
            </div>
            <div className="flex justify-between">
                <span>Pass:</span>
                <span className="text-white select-all">admin123</span>
            </div>
          </div>

          <div className="bg-black/40 p-3 rounded border border-green-500/20">
            <p className="text-xs text-purple-400 uppercase mb-1">Account 2 (Master)</p>
             <div className="flex justify-between">
                <span>User:</span>
                <span className="text-white select-all">master@gylphcircle.com</span>
            </div>
            <div className="flex justify-between">
                <span>Pass:</span>
                <span className="text-white select-all">master123</span>
            </div>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="mt-6 w-full py-2 bg-green-900/30 hover:bg-green-800/50 text-green-300 border border-green-500/30 rounded uppercase text-xs tracking-widest"
        >
          Close
        </button>
      </div>
    </Modal>
  );
};

export default AdminCredentials;
