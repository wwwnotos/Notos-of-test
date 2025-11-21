
import React, { useState, useRef } from 'react';
import { X, Check, User, AtSign, FileText, Loader2, Camera, Image as ImageIcon } from 'lucide-react';
import { User as UserType } from '../types';
import ImageCropper from './ImageCropper';
import { db } from '../services/db';

interface EditProfileModalProps {
  user: UserType;
  onClose: () => void;
  onSave: (data: { displayName: string; username: string; bio: string }) => Promise<void>;
  t: any;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ user, onClose, onSave, t }) => {
  const [displayName, setDisplayName] = useState(user.displayName);
  const [username, setUsername] = useState(user.username);
  const [bio, setBio] = useState(user.bio);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Cropper State
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [cropType, setCropType] = useState<'AVATAR' | 'COVER'>('AVATAR');
  
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'AVATAR' | 'COVER') => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = () => {
              setCropImage(reader.result as string);
              setCropType(type);
          };
          reader.readAsDataURL(file);
      }
      // Reset input
      e.target.value = '';
  };

  const handleCropComplete = async (blob: Blob) => {
      setIsLoading(true);
      setCropImage(null); // Close cropper
      try {
          const url = await db.uploadFile(blob);
          if (cropType === 'AVATAR') {
              // We update directly here for immediate feedback or via the parent refresh, 
              // but typically we update the DB then the state.
              // The parent `onSave` only handles text fields, so we need to do specific user updates here.
              await db.updateUser(user.id, { avatarUrl: url });
              // Force a reload or notify parent? 
              // Since user prop is from parent state, we rely on parent refreshing or 
              // ideally we should pass an `onUpdateUser` prop. 
              // For now, we'll assume the parent refreshes data when the modal closes or we call onSave.
          } else {
              await db.updateUser(user.id, { coverUrl: url });
          }
      } catch (err) {
          console.error("Upload failed", err);
          setError('Failed to upload image');
      } finally {
          setIsLoading(false);
      }
  };

  const handleSave = async () => {
    if (!displayName.trim() || !username.trim()) {
      setError('Name and Username are required.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    try {
      await onSave({ displayName, username, bio });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (cropImage) {
      return (
          <ImageCropper 
            imageSrc={cropImage} 
            aspectRatio={cropType === 'AVATAR' ? 1 : 3} // 1:1 for Avatar, 3:1 for Cover
            onCrop={handleCropComplete}
            onCancel={() => setCropImage(null)}
          />
      );
  }

  return (
    <div className="absolute inset-0 bg-black/60 z-[60] flex items-center justify-center backdrop-blur-sm p-6 animate-fade-in" onClick={onClose}>
        <div 
            className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl shadow-2xl flex flex-col animate-heart-pop overflow-hidden max-h-[90vh]"
            onClick={e => e.stopPropagation()}
        >
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-zinc-800">
                <h3 className="text-xl font-bold dark:text-white">{t.editProfile}</h3>
                <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-zinc-800 rounded-full hover:rotate-90 transition-all duration-300 dark:text-white">
                    <X size={20} />
                </button>
            </div>

            <div className="overflow-y-auto no-scrollbar">
                {/* Cover Image Section */}
                <div className="relative h-32 bg-gray-200 dark:bg-zinc-800 group cursor-pointer" onClick={() => coverInputRef.current?.click()}>
                     <img src={user.coverUrl} className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" alt="cover" />
                     <div className="absolute inset-0 flex items-center justify-center">
                         <div className="bg-black/50 p-2 rounded-full text-white backdrop-blur-sm">
                             <Camera size={20} />
                         </div>
                     </div>
                     <input type="file" ref={coverInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileSelect(e, 'COVER')} />
                </div>

                {/* Avatar Section - Negative Margin overlap */}
                <div className="px-6 relative -mt-10 mb-6 pointer-events-none">
                    <div className="relative inline-block pointer-events-auto group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
                         <img src={user.avatarUrl} className="w-20 h-20 rounded-full border-4 border-white dark:border-zinc-900 object-cover bg-white" alt="avatar" />
                         <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                             <Camera size={20} className="text-white" />
                         </div>
                         <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileSelect(e, 'AVATAR')} />
                    </div>
                </div>

                <div className="px-6 pb-6 space-y-5">
                    {error && <div className="p-3 bg-red-50 text-red-500 text-sm rounded-xl font-medium text-center">{error}</div>}

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">{t.name}</label>
                        <div className="flex items-center gap-3 bg-gray-50 dark:bg-zinc-800/50 rounded-xl px-4 py-3 focus-within:ring-2 ring-black dark:ring-white transition-all">
                            <User size={18} className="text-gray-400" />
                            <input 
                                type="text" 
                                value={displayName} 
                                onChange={(e) => setDisplayName(e.target.value)}
                                className="flex-1 bg-transparent outline-none font-bold dark:text-white"
                                placeholder="Your Name"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">{t.username}</label>
                        <div className="flex items-center gap-3 bg-gray-50 dark:bg-zinc-800/50 rounded-xl px-4 py-3 focus-within:ring-2 ring-black dark:ring-white transition-all">
                            <AtSign size={18} className="text-gray-400" />
                            <input 
                                type="text" 
                                value={username} 
                                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                className="flex-1 bg-transparent outline-none font-bold dark:text-white"
                                placeholder="username"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">{t.bio}</label>
                        <div className="flex gap-3 bg-gray-50 dark:bg-zinc-800/50 rounded-xl px-4 py-3 focus-within:ring-2 ring-black dark:ring-white transition-all">
                            <FileText size={18} className="text-gray-400 mt-1" />
                            <textarea 
                                value={bio} 
                                onChange={(e) => setBio(e.target.value)}
                                className="flex-1 bg-transparent outline-none font-medium dark:text-white resize-none h-24 leading-relaxed"
                                placeholder="Tell your story..."
                            />
                        </div>
                    </div>

                    <button 
                        onClick={handleSave}
                        disabled={isLoading}
                        className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-2xl font-bold shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 mt-4"
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : <><Check size={20} /> {t.save}</>}
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default EditProfileModal;
