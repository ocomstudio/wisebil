// src/components/dashboard/settings/avatar-upload-dialog.tsx
"use client";

import { useState, useRef } from 'react';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useLocale } from '@/context/locale-context';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

interface AvatarUploadDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAvatarSave: (dataUrl: string) => void;
}

const MIN_DIMENSION = 150;
const MAX_FILE_SIZE_MB = 1;

function getCroppedImg(
  image: HTMLImageElement,
  crop: Crop,
  scale = 1,
  rotate = 0
): Promise<string> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return Promise.reject(new Error('No 2d context'));
  }

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  
  const cropX = crop.x * scaleX;
  const cropY = crop.y * scaleY;
  
  const cropWidth = crop.width * scaleX;
  const cropHeight = crop.height * scaleY;
  
  canvas.width = cropWidth;
  canvas.height = cropHeight;
  
  ctx.translate(cropWidth / 2, cropHeight / 2);
  ctx.rotate((rotate * Math.PI) / 180);
  ctx.translate(-image.naturalWidth/2, -image.naturalHeight/2);

  ctx.drawImage(
    image,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight
  );

  const data = ctx.getImageData(
    cropX,
    cropY,
    cropWidth,
    cropHeight
  );

  canvas.width = cropWidth;
  canvas.height = cropHeight;
  
  ctx.putImageData(data,0,0);


  return new Promise((resolve) => {
    resolve(canvas.toDataURL('image/jpeg', 0.9));
  });
}

export function AvatarUploadDialog({ isOpen, onOpenChange, onAvatarSave }: AvatarUploadDialogProps) {
  const { t } = useLocale();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  
  const [imgSrc, setImgSrc] = useState('');
  const [crop, setCrop] = useState<Crop>();
  const [error, setError] = useState('');
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      toast({
        variant: 'destructive',
        title: 'Fichier trop volumineux',
        description: `La taille de l'image ne doit pas dépasser ${MAX_FILE_SIZE_MB} Mo.`,
      });
      return;
    }

    const reader = new FileReader();
    reader.addEventListener('load', () => {
      const imageUrl = reader.result?.toString() || '';
      setImgSrc(imageUrl);
    });
    reader.readAsDataURL(file);
    e.target.value = ''; // Reset input to allow re-selection of the same file
  };
  
  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const crop = centerCrop(
      makeAspectCrop({ unit: '%', width: 90 }, 1, width, height),
      width,
      height
    );
    setCrop(crop);
  };
  
  const handleSaveCrop = async () => {
    if (imgRef.current && crop?.width && crop?.height) {
      const croppedDataUrl = await getCroppedImg(imgRef.current, crop, scale, rotate);
      onAvatarSave(croppedDataUrl);
      resetState();
    }
  };

  const resetState = () => {
    onOpenChange(false);
    setImgSrc('');
    setCrop(undefined);
    setError('');
    setScale(1);
    setRotate(0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) resetState();
      else onOpenChange(true);
    }}>
      <DialogContent onInteractOutside={(e) => e.preventDefault()} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mettre à jour la photo de profil</DialogTitle>
          <DialogDescription>
            Chargez et rognez votre nouvelle photo. La taille du fichier ne doit pas dépasser 1Mo.
          </DialogDescription>
        </DialogHeader>
        {error && <p className="text-destructive text-sm">{error}</p>}
        {imgSrc ? (
          <div className="space-y-4">
             <div className="flex justify-center bg-muted/50 p-4 rounded-md">
                <ReactCrop
                    crop={crop}
                    onChange={(_, percentCrop) => setCrop(percentCrop)}
                    circularCrop
                    keepSelection
                    aspect={1}
                    minWidth={MIN_DIMENSION}
                >
                    <img
                        ref={imgRef}
                        alt="Crop me"
                        src={imgSrc}
                        style={{ transform: `scale(${scale}) rotate(${rotate}deg)` }}
                        onLoad={onImageLoad}
                    />
                </ReactCrop>
            </div>
            <div className="space-y-2">
                <Label htmlFor="scale">Zoom</Label>
                <Slider id="scale" value={[scale]} min={0.5} max={2} step={0.1} onValueChange={(value) => setScale(value[0])} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="rotate">Rotation</Label>
                <Slider id="rotate" value={[rotate]} min={-180} max={180} step={1} onValueChange={(value) => setRotate(value[0])} />
            </div>
          </div>
        ) : (
          <Button onClick={() => fileInputRef.current?.click()}>
            Choisir une image
          </Button>
        )}
        <input
          type="file"
          ref={fileInputRef}
          onChange={onSelectFile}
          accept="image/*"
          className="hidden"
        />
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={resetState}>
            Annuler
          </Button>
          <Button onClick={handleSaveCrop} disabled={!imgSrc}>
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
