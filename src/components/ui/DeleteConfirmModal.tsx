import React from 'react';
import { AlertTriangle, ShieldAlert, Trash2 } from 'lucide-react';
import { Modal } from './Modal';

interface DeleteConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  recordLabel: string;
  recordType?: string;
  warningMessage?: string;
  isSoftDelete?: boolean;
  confirmLabel?: string;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  open,
  onClose,
  onConfirm,
  title = 'Confirm Record Deletion',
  recordLabel,
  recordType = 'record',
  warningMessage,
  isSoftDelete = false,
  confirmLabel = 'Confirm Delete',
}) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      maxWidthClass="max-w-md"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#0D1628] hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#DC2626] hover:bg-red-700 text-white text-xs font-semibold transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {confirmLabel}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60">
          <AlertTriangle className="h-5 w-5 text-[#DC2626] dark:text-red-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-semibold text-red-900 dark:text-red-200">
              You are about to {isSoftDelete ? 'archive and remove' : 'delete'} this {recordType}:
            </p>
            <p className="font-bold text-sm text-slate-900 dark:text-white break-words">
              {recordLabel}
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          {warningMessage ||
            (isSoftDelete
              ? `This action will remove the ${recordType} from active tables, KPIs, and reports while preserving a traceable audit record for compliance.`
              : `This action will permanently remove the selected ${recordType} from the current demo workspace and update related metrics immediately.`)}
        </p>

        {isSoftDelete && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#F4F6F9] dark:bg-[#0D1628] border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300">
            <ShieldAlert className="h-3.5 w-3.5 text-[#396BA4] dark:text-sky-400 shrink-0" />
            <span>Audit &amp; regulatory compliance: Soft-delete / archive policy applied.</span>
          </div>
        )}
      </div>
    </Modal>
  );
};
