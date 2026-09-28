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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { PERMISSIONS } from "@/config/permissions";
import { useAccess } from "@/hooks/use-access";
import { PatientImageFormDialog } from "@/features/patients/components/patient-image-form-dialog";
import { useDeletePatientImage } from "@/features/patients/hooks/use-delete-patient-image";
import { usePatientImages } from "@/features/patients/hooks/use-patient-images";
import type { DialogState } from "@/types/dialog-state";
import type { ImageResponse } from "@/types/images";

function PatientImages({ patientId }: { patientId: string }) {
  const { can } = useAccess();
  const canUpload = can(PERMISSIONS.IMAGES_UPLOAD);
  const canUpdate = can(PERMISSIONS.IMAGES_UPDATE);
  const canDelete = can(PERMISSIONS.IMAGES_DELETE);
  const { images, isLoading, refetch } = usePatientImages(patientId);
  const [dialogState, setDialogState] =
    useState<DialogState<ImageResponse>>(null);
  const [deleteTarget, setDeleteTarget] = useState<ImageResponse | null>(null);
  const [previewImage, setPreviewImage] = useState<ImageResponse | null>(null);
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
        {canUpload && (
          <Button size="sm" onClick={() => setDialogState({ mode: "create" })}>
            <Plus />
            Add Image
          </Button>
        )}
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
                  {/* Hover-revealed icons only work with a pointer; touch devices get the labelled buttons below instead */}
                  {(canUpdate || canDelete) && (
                    <div className="absolute top-1 right-1 hidden gap-1 opacity-0 transition-opacity group-hover:opacity-100 md:flex">
                      {canUpdate && (
                        <Button
                          variant="secondary"
                          size="icon-xs"
                          onClick={() =>
                            setDialogState({ mode: "edit", data: image })
                          }
                        >
                          <Pencil />
                          <span className="sr-only">Edit</span>
                        </Button>
                      )}
                      {canDelete && (
                        <Button
                          variant="secondary"
                          size="icon-xs"
                          onClick={() => setDeleteTarget(image)}
                        >
                          <Trash2 />
                          <span className="sr-only">Delete</span>
                        </Button>
                      )}
                    </div>
                  )}
                </div>
                <Text className="truncate text-xs text-foreground">
                  {image.title}
                </Text>
                {(canUpdate || canDelete) && (
                  <div className="flex flex-col gap-1 md:hidden">
                    {canUpdate && (
                      <Button
                        variant="outline"
                        size="lg"
                        className="flex-1"
                        onClick={() =>
                          setDialogState({ mode: "edit", data: image })
                        }
                      >
                        <Pencil />
                        Edit
                      </Button>
                    )}
                    {canDelete && (
                      <Button
                        variant="destructive"
                        size="lg"
                        className="flex-1"
                        onClick={() => setDeleteTarget(image)}
                      >
                        <Trash2 />
                        Delete
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {dialogState && (
        <PatientImageFormDialog
          patientId={patientId}
          mode={dialogState.mode}
          image={dialogState.mode === "edit" ? dialogState.data : undefined}
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
        {/* pt-10 reserves a strip for the close button so it never sits on top of the image */}
        <DialogContent className="flex max-h-[95vh] w-full max-w-[95vw] items-center justify-center gap-0 p-2 pt-10 sm:max-w-[95vw]">
          <DialogTitle className="sr-only">{previewImage?.title}</DialogTitle>
          {previewImage && (
            // eslint-disable-next-line @next/next/no-img-element -- see thumbnail note above
            <img
              src={previewImage.url}
              alt={previewImage.title}
              className="max-h-[calc(95vh-3rem)] max-w-full rounded-lg object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export { PatientImages };
