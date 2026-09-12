"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { PatientImageFormDialog } from "@/features/patients/components/patient-image-form-dialog";
import { useDeletePatientImage } from "@/features/patients/hooks/use-delete-patient-image";
import { usePatientImages } from "@/features/patients/hooks/use-patient-images";
import type { ImageResponse } from "@/types/images";

type DialogState =
  | { mode: "create" }
  | { mode: "edit"; image: ImageResponse }
  | null;

function PatientImages({ patientId }: { patientId: string }) {
  const { images, isLoading, refetch } = usePatientImages(patientId);
  const [dialogState, setDialogState] = useState<DialogState>(null);
  const [deleteTarget, setDeleteTarget] = useState<ImageResponse | null>(
    null,
  );
  const [previewImage, setPreviewImage] = useState<ImageResponse | null>(
    null,
  );
  const { deleteImage, isLoading: isDeleting } = useDeletePatientImage(
    patientId,
    () => {
      setDeleteTarget(null);
      refetch();
    },
  );

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Images</CardTitle>
        <Button size="sm" onClick={() => setDialogState({ mode: "create" })}>
          <Plus />
          Add Image
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="aspect-square w-full" />
            ))}
          </div>
        )}

        {!isLoading && images.length === 0 && (
          <Text>No images uploaded yet.</Text>
        )}

        {!isLoading && images.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {images.map((image) => (
              <div key={image.id} className="group flex flex-col gap-1">
                <div className="relative aspect-square overflow-hidden rounded-lg ring-1 ring-foreground/10">
                  {/* eslint-disable-next-line @next/next/no-img-element -- R2 signed URLs are short-lived and pre-optimized to webp server-side, so next/image's remote-pattern allowlist + caching don't apply well here */}
                  <img
                    src={image.url}
                    alt={image.title}
                    loading="lazy"
                    className="h-full w-full cursor-pointer object-cover"
                    onClick={() => setPreviewImage(image)}
                  />
                  <div className="absolute top-1 right-1 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      variant="secondary"
                      size="icon-xs"
                      onClick={() =>
                        setDialogState({ mode: "edit", image })
                      }
                    >
                      <Pencil />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon-xs"
                      onClick={() => setDeleteTarget(image)}
                    >
                      <Trash2 />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </div>
                <Text className="truncate text-xs text-foreground">
                  {image.title}
                </Text>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {dialogState && (
        <PatientImageFormDialog
          patientId={patientId}
          mode={dialogState.mode}
          image={dialogState.mode === "edit" ? dialogState.image : undefined}
          open
          onOpenChange={(open) => !open && setDialogState(null)}
          onSuccess={refetch}
        />
      )}

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete image</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove &quot;{deleteTarget?.title}&quot;.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isDeleting}
              onClick={() => deleteTarget && deleteImage(deleteTarget.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={!!previewImage}
        onOpenChange={(open) => !open && setPreviewImage(null)}
      >
        <DialogContent className="flex max-h-[95vh] w-full max-w-[95vw] items-center justify-center gap-0 p-2 sm:max-w-[95vw]">
          <DialogTitle className="sr-only">{previewImage?.title}</DialogTitle>
          {previewImage && (
            // eslint-disable-next-line @next/next/no-img-element -- see thumbnail note above
            <img
              src={previewImage.url}
              alt={previewImage.title}
              className="max-h-[90vh] max-w-full rounded-lg object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export { PatientImages };
