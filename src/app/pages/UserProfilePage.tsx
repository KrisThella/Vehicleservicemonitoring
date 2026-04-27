import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Camera, Upload, Crop, Check, X, RotateCcw, Move, Pencil } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import { useProfile } from '../../lib/api';
import UserPic from '../components/source/Userpic.jpg';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CropRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

type DragHandle = 'nw' | 'ne' | 'sw' | 'se' | 'move' | null;

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
  const [dragHandle, setDragHandle] = useState<DragHandle>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [cropAtDragStart, setCropAtDragStart] = useState<CropRect>({ x: 0, y: 0, w: 0, h: 0 });
  const [cursor, setCursor] = useState<string>('default');
  const [imageLoaded, setImageLoaded] = useState(false);

  const HANDLE_RADIUS = 8;   // half the handle square size (visual)
  const HIT_TOL = 16;        // pixel tolerance for corner hit detection
  const MIN_SIZE = 30;       // minimum crop dimension

  // Load image and initialise canvas dimensions
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      const maxW = Math.min(window.innerWidth * 0.82, 720);
      const maxH = window.innerHeight * 0.52;
      const scale = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight, 1);
      const w = Math.round(img.naturalWidth * scale);
      const h = Math.round(img.naturalHeight * scale);
      setCanvasSize({ w, h });
      // Default crop: centred square (80% of shortest side)
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
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const { w, h } = canvasSize;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(imgRef.current, 0, 0, w, h);

    const { x, y, w: cw, h: ch } = cropRect;

    // Semi-transparent overlay outside the crop rect
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, 0, w, y);
    ctx.fillRect(0, y + ch, w, h - y - ch);
    ctx.fillRect(0, y, x, ch);
    ctx.fillRect(x + cw, y, w - x - cw, ch);

    // Crop border
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.strokeRect(x, y, cw, ch);

    // Rule-of-thirds grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    for (let i = 1; i < 3; i++) {
      const gx = x + (cw / 3) * i;
      const gy = y + (ch / 3) * i;
      ctx.beginPath(); ctx.moveTo(gx, y); ctx.lineTo(gx, y + ch); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x, gy); ctx.lineTo(x + cw, gy); ctx.stroke();
    }
    ctx.setLineDash([]);

    // Corner handles — centred on each corner, white fill with blue border
    const corners: [number, number][] = [
      [x, y],
      [x + cw, y],
      [x, y + ch],
      [x + cw, y + ch],
    ];
    const hr = HANDLE_RADIUS;
    corners.forEach(([cx, cy]) => {
      ctx.fillStyle = 'white';
      ctx.fillRect(cx - hr, cy - hr, hr * 2, hr * 2);
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.strokeRect(cx - hr, cy - hr, hr * 2, hr * 2);
    });

    // Center move icon indicator (small cross)
    const mx = x + cw / 2;
    const my = y + ch / 2;
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 1.5;
    const armLen = 10;
    ctx.beginPath(); ctx.moveTo(mx - armLen, my); ctx.lineTo(mx + armLen, my); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(mx, my - armLen); ctx.lineTo(mx, my + armLen); ctx.stroke();
    // arrowheads
    const ah = 4;
    [[mx - armLen, my, -1, 0], [mx + armLen, my, 1, 0], [mx, my - armLen, 0, -1], [mx, my + armLen, 0, 1]].forEach(([bx, by, dx, dy]) => {
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx + dy * ah - dx * ah, by - dx * ah - dy * ah);
      ctx.lineTo(bx - dy * ah - dx * ah, by + dx * ah - dy * ah);
      ctx.closePath();
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.fill();
    });
  }, [imageLoaded, canvasSize, cropRect]);

  const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const scaleX = canvasRef.current!.width / rect.width;
    const scaleY = canvasRef.current!.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const getHandleAtPos = useCallback(
    (pos: { x: number; y: number }, crop: CropRect): DragHandle => {
      const { x, y, w: cw, h: ch } = crop;
      const tol = HIT_TOL;
      // Corners first (priority over interior)
      if (Math.abs(pos.x - x) <= tol && Math.abs(pos.y - y) <= tol) return 'nw';
      if (Math.abs(pos.x - (x + cw)) <= tol && Math.abs(pos.y - y) <= tol) return 'ne';
      if (Math.abs(pos.x - x) <= tol && Math.abs(pos.y - (y + ch)) <= tol) return 'sw';
      if (Math.abs(pos.x - (x + cw)) <= tol && Math.abs(pos.y - (y + ch)) <= tol) return 'se';
      // Interior → move
      if (pos.x >= x && pos.x <= x + cw && pos.y >= y && pos.y <= y + ch) return 'move';
      return null;
    },
    []
  );

  const cursorForHandle = (h: DragHandle) => {
    if (h === 'nw' || h === 'se') return 'nw-resize';
    if (h === 'ne' || h === 'sw') return 'ne-resize';
    if (h === 'move') return 'move';
    return 'default';
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getPos(e);
    const handle = getHandleAtPos(pos, cropRect);
    setDragHandle(handle);
    setDragStart(pos);
    setCropAtDragStart({ ...cropRect });
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const pos = getPos(e);

      if (!dragHandle) {
        // Hover cursor update
        const h = getHandleAtPos(pos, cropRect);
        setCursor(cursorForHandle(h));
        return;
      }

      const dx = pos.x - dragStart.x;
      const dy = pos.y - dragStart.y;
      const c = cropAtDragStart;
      let { x: nx, y: ny, w: nw, h: nh } = c;

      if (dragHandle === 'nw') {
        nx = Math.min(c.x + dx, c.x + c.w - MIN_SIZE);
        ny = Math.min(c.y + dy, c.y + c.h - MIN_SIZE);
        nw = c.w - (nx - c.x);
        nh = c.h - (ny - c.y);
      } else if (dragHandle === 'ne') {
        ny = Math.min(c.y + dy, c.y + c.h - MIN_SIZE);
        nh = c.h - (ny - c.y);
        nw = Math.max(c.w + dx, MIN_SIZE);
      } else if (dragHandle === 'sw') {
        nx = Math.min(c.x + dx, c.x + c.w - MIN_SIZE);
        nw = c.w - (nx - c.x);
        nh = Math.max(c.h + dy, MIN_SIZE);
      } else if (dragHandle === 'se') {
        nw = Math.max(c.w + dx, MIN_SIZE);
        nh = Math.max(c.h + dy, MIN_SIZE);
      } else if (dragHandle === 'move') {
        nx = c.x + dx;
        ny = c.y + dy;
      }

      // Clamp to canvas bounds
      nx = Math.max(0, nx);
      ny = Math.max(0, ny);
      if (nx + nw > canvasSize.w) {
        if (dragHandle === 'move') nx = canvasSize.w - nw;
        else nw = canvasSize.w - nx;
      }
      if (ny + nh > canvasSize.h) {
        if (dragHandle === 'move') ny = canvasSize.h - nh;
        else nh = canvasSize.h - ny;
      }
      if (nx < 0) { nw += nx; nx = 0; }
      if (ny < 0) { nh += ny; ny = 0; }

      setCropRect({ x: nx, y: ny, w: nw, h: nh });
    },
    [dragHandle, dragStart, cropAtDragStart, canvasSize, cropRect, getHandleAtPos]
  );

  const handleMouseUp = () => setDragHandle(null);

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
      toast.error('No crop area selected');
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
      <div className="relative bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-auto max-w-[95vw] mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 dark:from-slate-800 to-white dark:to-slate-800">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Crop className="size-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Crop Profile Photo</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                <Move className="size-3.5 inline" />
                Drag corners to resize · drag inside to move
              </p>
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
              style={{ cursor, display: 'block', maxWidth: '100%' }}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={resetCrop} className="gap-2 text-gray-600">
              <RotateCcw className="size-4" />
              Reset
            </Button>
            <span className="text-xs text-gray-400">
              {cropRect.w > 0 && `${Math.round(cropRect.w)} × ${Math.round(cropRect.h)} px`}
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
  const { profile, saveProfile } = useProfile();

  const [profileImage, setProfileImage] = useState<string>(UserPic);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setRole(profile.role);
      setEmail(profile.email);
      if (profile.image_data_url) setProfileImage(profile.image_data_url);
    }
  }, [profile]);

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

  const handleCropApply = async (croppedDataUrl: string) => {
    setProfileImage(croppedDataUrl);
    setIsCropModalOpen(false);
    try {
      await saveProfile({ name, role, email, image_data_url: croppedDataUrl });
      toast.success('Profile photo updated successfully!');
    } catch (e: any) {
      toast.error(`Failed to save photo: ${e.message}`);
    }
  };

  const handleCropCancel = () => {
    setIsCropModalOpen(false);
    setRawImageSrc('');
  };

  const handleSave = async () => {
    try {
      await saveProfile({ name, role, email, image_data_url: profileImage === UserPic ? null : profileImage });
      toast.success('Profile updated successfully!');
    } catch (e: any) {
      toast.error(`Failed to save: ${e.message}`);
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="flex-1 flex flex-col bg-gray-50 dark:bg-slate-950">
        {/* Header */}
        <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/settings')} className="gap-2">
              <ArrowLeft className="size-4" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">User Profile</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Update your profile information</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-8">

              {/* Profile Photo Section */}
              <div className="mb-8">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Profile Photo</h3>
                <div className="flex items-start gap-6">
                  {/* Current photo preview — click to crop */}
                  <button
                    type="button"
                    onClick={() => openCropModal(profileImage)}
                    title="Click to crop your profile photo"
                    className="group relative w-36 h-36 flex-shrink-0 cursor-pointer focus:outline-none"
                  >
                    <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-gray-100 dark:border-slate-700 shadow-sm group-hover:border-blue-300 group-focus:ring-2 group-focus:ring-blue-400 group-focus:ring-offset-2 transition-colors">
                      <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/40 transition-colors flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 pointer-events-none">
                        <Crop className="size-6 mb-1" />
                        <span className="text-xs font-medium">Crop Photo</span>
                      </div>
                    </div>
                    {/* Pencil edit badge */}
                    <span
                      aria-hidden="true"
                      className="absolute bottom-1 right-1 inline-flex items-center justify-center size-9 rounded-full bg-blue-600 text-white border-2 border-white shadow-md group-hover:bg-blue-700 transition-colors"
                    >
                      <Pencil className="size-4" />
                    </span>
                  </button>

                  {/* Upload area */}
                  <div className="flex-1">
                    <div
                      onDrop={handleDrop}
                      onDragOver={(e) => e.preventDefault()}
                      className="border-2 border-border border-gray-300 rounded-lg p-3 text-center hover:border-blue-400 transition-colors cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera className="size-6 text-gray-400 mx-auto mb-2" />
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
                          className="gap-2 text-blue-600 border-blue-200 hover:bg-blue-50 dark:hover:bg-slate-800"
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
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Personal Information</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your full name" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Role</label>
                  <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Enter your role" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-slate-700">
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