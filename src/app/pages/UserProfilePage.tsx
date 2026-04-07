import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Camera, Upload, Crop, Check, X, RotateCcw } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import UserPic from '../components/source/Userpic.jpg';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CropRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

// ─── CropModal Component ──────────────────────────────────────────────────────

function CropModal({
  imageSrc,
  onApply,
  onCancel,
}: {
  imageSrc: string;
  onApply: (croppedDataUrl: string) => void;
  onCancel: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });
  const [cropRect, setCropRect] = useState<CropRect>({ x: 0, y: 0, w: 0, h: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);

  // Load image and initialise canvas dimensions
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      const maxW = Math.min(window.innerWidth * 0.8, 700);
      const maxH = window.innerHeight * 0.5;
      const scale = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight, 1);
      const w = Math.round(img.naturalWidth * scale);
      const h = Math.round(img.naturalHeight * scale);
      setCanvasSize({ w, h });
      // Default crop: centred square (80 % of shortest side)
      const side = Math.round(Math.min(w, h) * 0.8);
      setCropRect({
        x: Math.round((w - side) / 2),
        y: Math.round((h - side) / 2),
        w: side,
        h: side,
      });
      setImageLoaded(true);
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Draw image + crop overlay on every change
  useEffect(() => {
    if (!imageLoaded || !canvasRef.current || !imgRef.current) return;
    const ctx = canvasRef.current.getContext('2d')!;
    const { w, h } = canvasSize;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(imgRef.current, 0, 0, w, h);

    // Semi-transparent overlay outside the crop rect
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, 0, w, cropRect.y);                          // top
    ctx.fillRect(0, cropRect.y + cropRect.h, w, h - cropRect.y - cropRect.h); // bottom
    ctx.fillRect(0, cropRect.y, cropRect.x, cropRect.h);        // left
    ctx.fillRect(cropRect.x + cropRect.w, cropRect.y, w - cropRect.x - cropRect.w, cropRect.h); // right

    // Crop border
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.strokeRect(cropRect.x, cropRect.y, cropRect.w, cropRect.h);

    // Corner handles
    const handleSize = 10;
    ctx.fillStyle = '#3b82f6';
    const corners = [
      [cropRect.x, cropRect.y],
      [cropRect.x + cropRect.w - handleSize, cropRect.y],
      [cropRect.x, cropRect.y + cropRect.h - handleSize],
      [cropRect.x + cropRect.w - handleSize, cropRect.y + cropRect.h - handleSize],
    ];
    corners.forEach(([cx, cy]) => ctx.fillRect(cx, cy, handleSize, handleSize));

    // Rule-of-thirds grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    for (let i = 1; i < 3; i++) {
      const gx = cropRect.x + (cropRect.w / 3) * i;
      const gy = cropRect.y + (cropRect.h / 3) * i;
      ctx.beginPath(); ctx.moveTo(gx, cropRect.y); ctx.lineTo(gx, cropRect.y + cropRect.h); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cropRect.x, gy); ctx.lineTo(cropRect.x + cropRect.w, gy); ctx.stroke();
    }
    ctx.setLineDash([]);
  }, [imageLoaded, canvasSize, cropRect]);

  const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getPos(e);
    setDragStart(pos);
    setIsDragging(true);
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDragging) return;
      const pos = getPos(e);
      const rawX = Math.min(dragStart.x, pos.x);
      const rawY = Math.min(dragStart.y, pos.y);
      const rawW = Math.abs(pos.x - dragStart.x);
      const rawH = Math.abs(pos.y - dragStart.y);

      // Keep within canvas bounds
      const x = Math.max(0, rawX);
      const y = Math.max(0, rawY);
      const w = Math.min(rawW, canvasSize.w - x);
      const h = Math.min(rawH, canvasSize.h - y);

      if (w > 5 && h > 5) setCropRect({ x, y, w, h });
    },
    [isDragging, dragStart, canvasSize]
  );

  const handleMouseUp = () => setIsDragging(false);

  const resetCrop = () => {
    if (!canvasSize.w) return;
    const side = Math.round(Math.min(canvasSize.w, canvasSize.h) * 0.8);
    setCropRect({
      x: Math.round((canvasSize.w - side) / 2),
      y: Math.round((canvasSize.h - side) / 2),
      w: side,
      h: side,
    });
  };

  const applyCrop = () => {
    if (!imgRef.current || cropRect.w === 0 || cropRect.h === 0) {
      toast.error('Please select a crop area by dragging on the image');
      return;
    }
    const scaleX = imgRef.current.naturalWidth / canvasSize.w;
    const scaleY = imgRef.current.naturalHeight / canvasSize.h;

    const offCanvas = document.createElement('canvas');
    offCanvas.width = Math.round(cropRect.w * scaleX);
    offCanvas.height = Math.round(cropRect.h * scaleY);
    const ctx = offCanvas.getContext('2d')!;
    ctx.drawImage(
      imgRef.current,
      Math.round(cropRect.x * scaleX),
      Math.round(cropRect.y * scaleY),
      offCanvas.width,
      offCanvas.height,
      0, 0, offCanvas.width, offCanvas.height
    );
    onApply(offCanvas.toDataURL('image/jpeg', 0.92));
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onCancel} />
      <div className="relative bg-white rounded-xl shadow-2xl w-auto max-w-[95vw] mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Crop className="size-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Crop Profile Photo</h2>
              <p className="text-sm text-gray-500">Click & drag on the image to select your crop area</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="size-5" />
          </Button>
        </div>

        {/* Canvas */}
        <div
          ref={containerRef}
          className="bg-gray-900 flex items-center justify-center p-4"
          style={{ minHeight: 100 }}
        >
          {!imageLoaded ? (
            <div className="text-white text-sm py-10 px-20">Loading image…</div>
          ) : (
            <canvas
              ref={canvasRef}
              width={canvasSize.w}
              height={canvasSize.h}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{ cursor: isDragging ? 'crosshair' : 'crosshair', display: 'block' }}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={resetCrop} className="gap-2 text-gray-600">
              <RotateCcw className="size-4" />
              Reset
            </Button>
            <span className="text-xs text-gray-400">
              {cropRect.w > 0 && `${Math.round(cropRect.w)} × ${Math.round(cropRect.h)} px selected`}
            </span>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onCancel} className="gap-2">
              <X className="size-4" />
              Cancel
            </Button>
            <Button onClick={applyCrop} className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Check className="size-4" />
              Apply Crop
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page Component ──────────────────────────────────────────────────────

export function UserProfilePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profileImage, setProfileImage] = useState<string>(UserPic);
  const [name, setName] = useState('Donna Ricci');
  const [role, setRole] = useState('Admin User');
  const [email, setEmail] = useState('donna.ricci@tsmpc.com');

  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState('');

  // ─── Open crop dialog with a raw image ─────────────────────────────────────

  const openCropModal = (src: string) => {
    setRawImageSrc(src);
    setIsCropModalOpen(true);
  };

  const readFileAndOpenCrop = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) openCropModal(e.target.result as string);
    };
    reader.readAsDataURL(file);
  };

  // ─── Event handlers ─────────────────────────────────────────────────────────

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) readFileAndOpenCrop(file);
    event.target.value = '';
  };

  const handleImagePaste = async () => {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const imageType = item.types.find((t) => t.startsWith('image/'));
        if (imageType) {
          const blob = await item.getType(imageType);
          readFileAndOpenCrop(new File([blob], 'pasted.png', { type: imageType }));
          return;
        }
      }
      toast.error('No image found in clipboard');
    } catch {
      toast.error('Failed to paste image from clipboard');
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file?.type.startsWith('image/')) readFileAndOpenCrop(file);
    else toast.error('Please drop an image file');
  };

  const handleCropApply = (croppedDataUrl: string) => {
    setProfileImage(croppedDataUrl);
    setIsCropModalOpen(false);
    toast.success('Profile photo updated successfully!');
  };

  const handleCropCancel = () => {
    setIsCropModalOpen(false);
    setRawImageSrc('');
  };

  const handleSave = () => toast.success('Profile updated successfully!');

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="flex-1 flex flex-col bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/settings')} className="gap-2">
              <ArrowLeft className="size-4" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">User Profile</h1>
              <p className="text-sm text-gray-500">Update your profile information</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg border border-gray-200 p-8">

              {/* Profile Photo Section */}
              <div className="mb-8">
                <h3 className="font-semibold text-gray-900 mb-4">Profile Photo</h3>
                <div className="flex items-start gap-6">
                  {/* Current photo preview */}
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100 flex-shrink-0 shadow-sm">
                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                  </div>

                  {/* Upload area */}
                  <div className="flex-1">
                    <div
                      onDrop={handleDrop}
                      onDragOver={(e) => e.preventDefault()}
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera className="size-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-1">
                        Drag & drop an image, or click to select
                      </p>
                      <p className="text-xs text-gray-400 mb-3">
                        After selecting, you can crop the image before saving
                      </p>
                      <div className="flex gap-2 justify-center" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          className="gap-2"
                        >
                          <Upload className="size-4" />
                          Upload Photo
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleImagePaste} className="gap-2">
                          Paste
                        </Button>
                        {profileImage !== UserPic && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openCropModal(profileImage)}
                            className="gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                          >
                            <Crop className="size-4" />
                            Re-Crop
                          </Button>
                        )}
                      </div>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 mb-4">Personal Information</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your full name" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Enter your role" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                <Button variant="outline" onClick={() => navigate('/settings')}>Cancel</Button>
                <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">Save Changes</Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Crop Modal */}
      {isCropModalOpen && rawImageSrc && (
        <CropModal
          imageSrc={rawImageSrc}
          onApply={handleCropApply}
          onCancel={handleCropCancel}
        />
      )}
    </>
  );
}
