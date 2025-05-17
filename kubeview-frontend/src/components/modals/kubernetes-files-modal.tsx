import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { X } from "lucide-react";

interface KubernetesFilesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (files: string[]) => void;
}

export const KubernetesFilesModal: React.FC<KubernetesFilesModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [files, setFiles] = useState<string[]>([""]);

  const handleAddFile = () => {
    setFiles([...files, ""]);
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles.length ? newFiles : [""]);
  };

  const handleFileChange = (index: number, value: string) => {
    const newFiles = [...files];
    newFiles[index] = value;
    setFiles(newFiles);
  };

  const handleSubmit = () => {
    const nonEmptyFiles = files.filter((file) => file.trim());
    onSubmit(nonEmptyFiles);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Kubernetes YAML Files</DialogTitle>
          <p className="text-sm text-gray-500 mt-2">
            Specify the paths to Kubernetes YAML files to include in the preview
            environment.
          </p>
        </DialogHeader>

        <div className="space-y-3 my-6">
          {files.map((file, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={file}
                  onChange={(e) => handleFileChange(index, e.target.value)}
                  placeholder="e.g., k8s/deployment.yaml"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                />
                {files.length > 1 && (
                  <button
                    onClick={() => handleRemoveFile(index)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <Button variant="outline" className="w-full" onClick={handleAddFile}>
          Add Another File
        </Button>

        <DialogFooter className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Create Preview Environment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
