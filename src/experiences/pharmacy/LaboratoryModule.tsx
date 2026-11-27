import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Edit3,
  Eye,
  FileText,
  FlaskConical,
  MessageSquare,
  Plus,
  Printer,
  ShieldAlert,
  Trash2,
  UserPlus,
  XCircle,
} from 'lucide-react';
import { ColumnDef, DataTable } from '../../components/ui/DataTable';
import { DeleteConfirmModal } from '../../components/ui/DeleteConfirmModal';
import { KpiCard } from '../../components/ui/KpiCard';
import { Logo } from '../../components/ui/Logo';
import { Modal } from '../../components/ui/Modal';
import { StatusLabel } from '../../components/ui/StatusLabel';
import { useDemoStore } from '../../store/demoStore';
import { LabRequestRecord, PatientRecord } from '../../types/erp';

interface LaboratoryModuleProps {
  onToast: (msg: string, type?: 'success' | 'error') => void;
}

export const LaboratoryModule: React.FC<LaboratoryModuleProps> = ({ onToast }) => {
  const {
    state,
    registerPatient,
    updatePatient,
    deletePatient,
    createLabRequest,
    updateLabRequest,
    deleteLabRequest,
    submitLabResult,
    simulateWhatsappDelivery,
  } = useDemoStore();

  const [tab, setTab] = useState<'requests' | 'patients'>('requests');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Answered'>('All');

  // Modals
  const [patientModalOpen, setPatientModalOpen] = useState(false);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [resultModalReq, setResultModalReq] = useState<LabRequestRecord | null>(null);
  const [reportModalReq, setReportModalReq] = useState<LabRequestRecord | null>(null);
  const [viewingRequest, setViewingRequest] = useState<LabRequestRecord | null>(null);
  const [editingRequest, setEditingRequest] = useState<LabRequestRecord | null>(null);
  const [editRequestForm, setEditRequestForm] = useState({
    patientId: '',
    testName: '',
    testCategory: 'Hematology',
    status: 'Pending' as 'Pending' | 'Answered',
    resultValues: '',
    resultSummary: '',
    clinicalNotes: '',
  });
  const [deleteTargetRequest, setDeleteTargetRequest] = useState<LabRequestRecord | null>(null);

  const [viewingPatient, setViewingPatient] = useState<PatientRecord | null>(null);
  const [editingPatient, setEditingPatient] = useState<PatientRecord | null>(null);
  const [editPatientForm, setEditPatientForm] = useState({
    fullName: '',
    age: '30',
    gender: 'Female' as 'Male' | 'Female',
    phone: '',
    address: '',
  });
  const [deleteTargetPatient, setDeleteTargetPatient] = useState<PatientRecord | null>(null);

  // Forms
  const [patientForm, setPatientForm] = useState({
    fullName: '',
    age: '30',
    gender: 'Female' as 'Male' | 'Female',
    phone: '',
    address: '',
  });

  const [requestForm, setRequestForm] = useState({
    patientId: state.patients[0]?.id || '',
    testName: 'Complete Blood Count (CBC)',
    testCategory: 'Hematology',
  });

  const [resultForm, setResultForm] = useState({
    resultValues: '',
    resultSummary: '',
    clinicalNotes: '',
  });

  const totalRequests = state.labRequests.length;
  const answeredCount = state.labRequests.filter((r) => r.status === 'Answered').length;
  const pendingCount = state.labRequests.filter((r) => r.status === 'Pending').length;

  const filteredRequests = useMemo(
    () =>
      state.labRequests.filter(
        (r) => statusFilter === 'All' || r.status === statusFilter
      ),
    [state.labRequests, statusFilter]
  );

  const requestColumns: ColumnDef<LabRequestRecord>[] = [
    {
      key: 'req',
      header: 'Request #',
      render: (r) => (
        <span className="font-mono text-xs font-semibold text-[#1E396A] dark:text-sky-300">
          {r.requestNo}
        </span>
      ),
    },
    {
      key: 'patient',
      header: 'Patient',
      render: (r) => (
        <div>
          <p className="font-semibold text-slate-900 dark:text-white">{r.patientName}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{r.patientPhone}</p>
        </div>
      ),
    },
    {
      key: 'test',
      header: 'Requested Test',
      render: (r) => (
        <div>
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{r.testName}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">{r.testCategory}</p>
        </div>
      ),
    },
    {
      key: 'date',
      header: 'Request Date',
      render: (r) => (
        <span className="text-xs tabular-nums text-slate-600 dark:text-slate-300">
          {r.requestDate}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Lab Status',
      render: (r) => <StatusLabel label={r.status} />,
    },
    {
      key: 'wa',
      header: 'WhatsApp Delivery',
      render: (r) => (
        <StatusLabel
          label={r.whatsappStatus}
          tone={
            r.whatsappStatus === 'Delivered'
              ? 'success'
              : r.whatsappStatus === 'Failed'
              ? 'error'
              : 'neutral'
          }
        />
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (r) => (
        <div className="inline-flex items-center justify-end gap-1.5 flex-wrap">
          <button
            type="button"
            title="View Request Details"
            onClick={() => (r.status === 'Answered' ? setReportModalReq(r) : setViewingRequest(r))}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0D1628] text-xs font-medium text-[#1E396A] dark:text-sky-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Eye className="h-3.5 w-3.5" />
            View
          </button>
          <button
            type="button"
            title="Edit Lab Request"
            onClick={() => {
              setEditingRequest(r);
              setEditRequestForm({
                patientId: r.patientId,
                testName: r.testName,
                testCategory: r.testCategory,
                status: r.status,
                resultValues: r.resultValues || '',
                resultSummary: r.resultSummary || '',
                clinicalNotes: r.clinicalNotes || '',
              });
            }}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0D1628] text-xs font-medium text-[#396BA4] dark:text-sky-400 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Edit3 className="h-3.5 w-3.5" />
            Edit
          </button>
          {r.status === 'Pending' && (
            <button
              type="button"
              onClick={() => {
                setResultModalReq(r);
                setResultForm({
                  resultValues: '',
                  resultSummary: '',
                  clinicalNotes: '',
                });
              }}
              className="px-2 py-1 rounded-md bg-[#F05D21] hover:bg-[#d94f18] text-white text-xs font-medium"
            >
              Results
            </button>
          )}
          <button
            type="button"
            title="Archive / Delete Lab Request"
            onClick={() => setDeleteTargetRequest(r)}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-red-200 dark:border-red-900/60 bg-white dark:bg-[#0D1628] text-xs font-medium text-[#DC2626] dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      ),
    },
  ];

  const patientColumns: ColumnDef<PatientRecord>[] = [
    {
      key: 'code',
      header: 'Patient ID',
      render: (p) => (
        <span className="font-mono text-xs font-semibold text-[#1E396A] dark:text-sky-300">
          {p.patientCode}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Patient Full Name',
      render: (p) => <span className="font-semibold text-slate-900 dark:text-white">{p.fullName}</span>,
    },
    {
      key: 'demo',
      header: 'Age / Gender',
      render: (p) => (
        <span className="text-xs text-slate-700 dark:text-slate-300 tabular-nums">
          {p.age} yrs · {p.gender}
        </span>
      ),
    },
    {
      key: 'phone',
      header: 'Phone (WhatsApp)',
      render: (p) => <span className="text-xs tabular-nums text-slate-700 dark:text-slate-300">{p.phone}</span>,
    },
    {
      key: 'addr',
      header: 'Address',
      render: (p) => <span className="text-xs text-slate-500 dark:text-slate-400">{p.address}</span>,
    },
    {
      key: 'reg',
      header: 'Registered',
      render: (p) => <span className="text-xs tabular-nums text-slate-500 dark:text-slate-400">{p.registeredAt}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (p) => (
        <div className="inline-flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => setViewingPatient(p)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0D1628] text-xs font-medium text-[#1E396A] dark:text-sky-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Eye className="h-3.5 w-3.5" />
            View
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingPatient(p);
              setEditPatientForm({
                fullName: p.fullName,
                age: String(p.age),
                gender: p.gender,
                phone: p.phone,
                address: p.address,
              });
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0D1628] text-xs font-medium text-[#396BA4] dark:text-sky-400 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Edit3 className="h-3.5 w-3.5" />
            Edit
          </button>
          <button
            type="button"
            onClick={() => setDeleteTargetPatient(p)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-red-200 dark:border-red-900/60 bg-white dark:bg-[#0D1628] text-xs font-medium text-[#DC2626] dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Privacy Notice */}
      <div className="px-4 py-3 rounded-xl bg-white dark:bg-[#111B2E] border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300">
          <ShieldAlert className="h-4 w-4 text-[#396BA4] dark:text-sky-400 shrink-0" />
          <span>
            Patient records and laboratory diagnostics are restricted to authorized Pharmacy Admin sessions only.
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setPatientModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1628] hover:border-[#1E396A] dark:hover:border-sky-400 text-xs font-semibold text-[#1E396A] dark:text-sky-300"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Register Patient
          </button>
          <button
            type="button"
            onClick={() => {
              setRequestForm({
                patientId: state.patients[0]?.id || '',
                testName: 'Complete Blood Count (CBC)',
                testCategory: 'Hematology',
              });
              setRequestModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#F05D21] hover:bg-[#d94f18] text-white text-xs font-semibold"
          >
            <Plus className="h-3.5 w-3.5" />
            New Test Request
          </button>
        </div>
      </div>

      {/* Mandatory 3 Lab KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard label="Total Laboratory Requests" value={totalRequests} tone="navy" />
        <KpiCard label="Answered Requests" value={answeredCount} tone="success" />
        <KpiCard label="Pending Requests" value={pendingCount} tone="warning" />
      </div>

      {/* Sub-navigation tabs */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setTab('requests')}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold ${
            tab === 'requests'
              ? 'bg-[#1E396A] text-white'
              : 'bg-white dark:bg-[#111B2E] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          Test Requests &amp; Reports ({totalRequests})
        </button>
        <button
          type="button"
          onClick={() => setTab('patients')}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold ${
            tab === 'patients'
              ? 'bg-[#1E396A] text-white'
              : 'bg-white dark:bg-[#111B2E] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          Registered Patients ({state.patients.length})
        </button>
      </div>

      {tab === 'requests' ? (
        <DataTable
          data={filteredRequests}
          columns={requestColumns}
          keyExtractor={(r) => r.id}
          searchPlaceholder="Search request #, patient name, test..."
          searchFilter={(r, q) =>
            r.requestNo.toLowerCase().includes(q) ||
            r.patientName.toLowerCase().includes(q) ||
            r.testName.toLowerCase().includes(q)
          }
          toolbarExtra={
            <div className="flex items-center gap-1 p-1 bg-[#F4F6F9] dark:bg-[#0D1628] rounded-lg">
              {(['All', 'Pending', 'Answered'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-md text-xs font-medium ${
                    statusFilter === st
                      ? 'bg-white dark:bg-[#1E396A] text-[#1E396A] dark:text-white shadow-xs font-semibold'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          }
        />
      ) : (
        <DataTable
          data={state.patients}
          columns={patientColumns}
          keyExtractor={(p) => p.id}
          searchPlaceholder="Search patient ID, name, phone..."
          searchFilter={(p, q) =>
            p.patientCode.toLowerCase().includes(q) ||
            p.fullName.toLowerCase().includes(q) ||
            p.phone.toLowerCase().includes(q)
          }
        />
      )}

      {/* Register Patient Modal */}
      <Modal
        open={patientModalOpen}
        onClose={() => setPatientModalOpen(false)}
        title="Register New Laboratory Patient"
        maxWidthClass="max-w-lg"
        footer={
          <>
            <button
              type="button"
              onClick={() => setPatientModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#0D1628]"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!patientForm.fullName.trim() || !patientForm.phone.trim()}
              onClick={() => {
                const pat = registerPatient({
                  fullName: patientForm.fullName.trim(),
                  age: Number(patientForm.age) || 25,
                  gender: patientForm.gender,
                  phone: patientForm.phone.trim(),
                  address: patientForm.address.trim() || 'Mogadishu',
                });
                onToast(`Registered patient ${pat.fullName} (${pat.patientCode}).`);
                setPatientModalOpen(false);
                setPatientForm({
                  fullName: '',
                  age: '30',
                  gender: 'Female',
                  phone: '',
                  address: '',
                });
              }}
              className="px-4 py-2 rounded-lg bg-[#F05D21] hover:bg-[#d94f18] text-white text-xs font-semibold disabled:opacity-40"
            >
              Register Patient
            </button>
          </>
        }
      >
        <div className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Patient Full Name *
            </label>
            <input
              type="text"
              value={patientForm.fullName}
              onChange={(e) => setPatientForm({ ...patientForm, fullName: e.target.value })}
              placeholder="e.g. Halima Mohamed Nur"
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Age</label>
              <input
                type="number"
                value={patientForm.age}
                onChange={(e) => setPatientForm({ ...patientForm, age: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Gender</label>
              <select
                value={patientForm.gender}
                onChange={(e) =>
                  setPatientForm({
                    ...patientForm,
                    gender: e.target.value as 'Male' | 'Female',
                  })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0D1628]"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Phone / WhatsApp Number *
            </label>
            <input
              type="tel"
              value={patientForm.phone}
              onChange={(e) => setPatientForm({ ...patientForm, phone: e.target.value })}
              placeholder="+252 61 ..."
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Address</label>
            <input
              type="text"
              value={patientForm.address}
              onChange={(e) => setPatientForm({ ...patientForm, address: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg"
            />
          </div>
        </div>
      </Modal>

      {/* Create Test Request Modal */}
      <Modal
        open={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
        title="Create Laboratory Test Request"
        maxWidthClass="max-w-lg"
        footer={
          <>
            <button
              type="button"
              onClick={() => setRequestModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#0D1628]"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!requestForm.patientId || !requestForm.testName.trim()}
              onClick={() => {
                const req = createLabRequest(requestForm);
                onToast(`Created lab request ${req.requestNo} for ${req.patientName}.`);
                setRequestModalOpen(false);
              }}
              className="px-4 py-2 rounded-lg bg-[#F05D21] hover:bg-[#d94f18] text-white text-xs font-semibold disabled:opacity-40"
            >
              Submit Request
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Patient *
            </label>
            <select
              value={requestForm.patientId}
              onChange={(e) => setRequestForm({ ...requestForm, patientId: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0D1628]"
            >
              {state.patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.fullName} ({p.patientCode})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Laboratory Test Name *
            </label>
            <input
              type="text"
              value={requestForm.testName}
              onChange={(e) => setRequestForm({ ...requestForm, testName: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Test Category
            </label>
            <select
              value={requestForm.testCategory}
              onChange={(e) => setRequestForm({ ...requestForm, testCategory: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0D1628]"
            >
              <option value="Hematology">Hematology</option>
              <option value="Clinical Chemistry">Clinical Chemistry</option>
              <option value="Microbiology">Microbiology</option>
              <option value="Immunology">Immunology</option>
            </select>
          </div>
        </div>
      </Modal>

      {/* Result Entry Modal */}
      <Modal
        open={resultModalReq !== null}
        onClose={() => setResultModalReq(null)}
        title="Enter Laboratory Test Results"
        subtitle={
          resultModalReq
            ? `${resultModalReq.requestNo} · ${resultModalReq.patientName} · ${resultModalReq.testName}`
            : ''
        }
        maxWidthClass="max-w-lg"
        footer={
          <>
            <button
              type="button"
              onClick={() => setResultModalReq(null)}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#0D1628]"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!resultForm.resultValues.trim() || !resultForm.resultSummary.trim()}
              onClick={() => {
                if (resultModalReq) {
                  submitLabResult({
                    requestId: resultModalReq.id,
                    ...resultForm,
                  });
                  onToast(`Results saved for ${resultModalReq.requestNo}. Status set to Answered.`);
                  setResultModalReq(null);
                }
              }}
              className="px-4 py-2 rounded-lg bg-[#16A34A] hover:bg-emerald-700 text-white text-xs font-semibold disabled:opacity-40"
            >
              Save &amp; Generate Report
            </button>
          </>
        }
      >
        <div className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Measured Test Values *
            </label>
            <input
              type="text"
              value={resultForm.resultValues}
              onChange={(e) => setResultForm({ ...resultForm, resultValues: e.target.value })}
              placeholder="e.g. Malaria RDT: Negative | WBC: 6.2 x10^9/L"
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Result Summary *
            </label>
            <textarea
              rows={2}
              value={resultForm.resultSummary}
              onChange={(e) => setResultForm({ ...resultForm, resultSummary: e.target.value })}
              placeholder="Clinical summary of findings..."
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Clinical Notes / Recommendations
            </label>
            <textarea
              rows={2}
              value={resultForm.clinicalNotes}
              onChange={(e) => setResultForm({ ...resultForm, clinicalNotes: e.target.value })}
              placeholder="Recommended follow-up or pharmacist notes..."
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg"
            />
          </div>
        </div>
      </Modal>

      {/* Professional Lab Report & WhatsApp Delivery Simulation Modal */}
      <Modal
        open={reportModalReq !== null}
        onClose={() => setReportModalReq(null)}
        title="Official Laboratory Report"
        subtitle={reportModalReq ? `${reportModalReq.requestNo} · ${reportModalReq.patientName}` : ''}
        maxWidthClass="max-w-2xl"
        footer={
          <>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-[#1E396A] dark:text-sky-300 bg-white dark:bg-[#0D1628]"
            >
              <Printer className="h-3.5 w-3.5" />
              Print Report
            </button>
            <button
              type="button"
              onClick={() => setReportModalReq(null)}
              className="px-4 py-2 rounded-lg bg-[#1E396A] text-white text-xs font-semibold"
            >
              Close
            </button>
          </>
        }
      >
        {reportModalReq && (() => {
          const liveReq =
            state.labRequests.find((r) => r.id === reportModalReq.id) || reportModalReq;
          return (
            <div className="space-y-5">
              {/* Printable Report Document */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-5 bg-white dark:bg-[#0D1628] print:bg-white print:text-slate-900 space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <Logo className="h-8" />
                    <p className="mt-2 text-xs font-bold text-[#1E396A] dark:text-white">
                      Al-Shifa Modern Pharmacy · Clinical Laboratory Unit
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Maka Al-Mukarama Road, Hodan · Mogadishu
                    </p>
                  </div>
                  <div className="text-right text-xs">
                    <p className="font-mono font-bold text-[#1E396A] dark:text-sky-300">{liveReq.requestNo}</p>
                    <p className="text-slate-500 dark:text-slate-400 tabular-nums">
                      Report Date: {liveReq.resultDate || liveReq.requestDate}
                    </p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 text-xs bg-[#F4F6F9] dark:bg-[#111B2E] p-3.5 rounded-lg">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Patient Name: </span>
                    <span className="font-semibold text-slate-900 dark:text-white">{liveReq.patientName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Contact: </span>
                    <span className="font-semibold text-slate-900 dark:text-white tabular-nums">
                      {liveReq.patientPhone}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Test Name: </span>
                    <span className="font-semibold text-[#1E396A] dark:text-sky-300">{liveReq.testName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Category: </span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{liveReq.testCategory}</span>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <p className="font-semibold text-slate-700 dark:text-slate-300">Measured Values</p>
                    <p className="mt-1 p-3 rounded-lg border border-slate-200 dark:border-slate-700 font-mono text-[#1E396A] dark:text-sky-300 bg-slate-50 dark:bg-[#111B2E]">
                      {liveReq.resultValues}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700 dark:text-slate-300">Diagnostic Summary</p>
                    <p className="mt-1 text-slate-700 dark:text-slate-200 leading-relaxed">{liveReq.resultSummary}</p>
                  </div>
                  {liveReq.clinicalNotes && (
                    <div>
                      <p className="font-semibold text-slate-700 dark:text-slate-300">Clinical Notes</p>
                      <p className="mt-1 text-slate-600 dark:text-slate-300">{liveReq.clinicalNotes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* WhatsApp Delivery Simulation Panel */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-[#F4F6F9] dark:bg-[#0D1628] space-y-3 no-print">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-[#16A34A] dark:text-emerald-400" />
                    <span className="text-xs font-bold text-[#1E396A] dark:text-white">
                      WhatsApp Report Delivery Simulation
                    </span>
                  </div>
                  <StatusLabel
                    label={
                      liveReq.whatsappStatus === 'Delivered'
                        ? `Delivered (${liveReq.whatsappSentAt})`
                        : liveReq.whatsappStatus === 'Failed'
                        ? `Delivery Failed (${liveReq.whatsappSentAt})`
                        : 'Not Sent'
                    }
                    tone={
                      liveReq.whatsappStatus === 'Delivered'
                        ? 'success'
                        : liveReq.whatsappStatus === 'Failed'
                        ? 'error'
                        : 'neutral'
                    }
                  />
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  Simulate sending this laboratory report PDF summary to {liveReq.patientPhone} (no real WhatsApp message is transmitted).
                </p>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      simulateWhatsappDelivery(liveReq.id, true);
                      onToast(`Simulated WhatsApp report delivered to ${liveReq.patientName}.`);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#16A34A] hover:bg-emerald-700 text-white text-xs font-semibold"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Send Report via WhatsApp (Simulate Success)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      simulateWhatsappDelivery(liveReq.id, false);
                      onToast(`Simulated WhatsApp delivery failure for ${liveReq.requestNo}.`);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-red-200 dark:border-red-900/60 bg-white dark:bg-[#111B2E] text-[#DC2626] dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 text-xs font-semibold"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Simulate Delivery Failure
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* View Pending Lab Request Details Modal */}
      <Modal
        open={viewingRequest !== null}
        onClose={() => setViewingRequest(null)}
        title={`Lab Request — ${viewingRequest?.requestNo || ''}`}
        subtitle={viewingRequest ? `${viewingRequest.patientName} · ${viewingRequest.testCategory}` : ''}
        maxWidthClass="max-w-lg"
        footer={
          viewingRequest && (
            <>
              {viewingRequest.status === 'Pending' && (
                <button
                  type="button"
                  onClick={() => {
                    const target = viewingRequest;
                    setViewingRequest(null);
                    setResultModalReq(target);
                    setResultForm({ resultValues: '', resultSummary: '', clinicalNotes: '' });
                  }}
                  className="px-4 py-2 rounded-lg bg-[#F05D21] hover:bg-[#d94f18] text-white text-xs font-semibold"
                >
                  Enter Results
                </button>
              )}
              <button
                type="button"
                onClick={() => setViewingRequest(null)}
                className="px-4 py-2 rounded-lg bg-[#1E396A] text-white text-xs font-semibold"
              >
                Close
              </button>
            </>
          )
        }
      >
        {viewingRequest && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#F4F6F9] dark:bg-[#0D1628]">
              <span className="font-semibold text-slate-700 dark:text-slate-200">{viewingRequest.testName}</span>
              <StatusLabel label={viewingRequest.status} />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <p className="text-slate-500 dark:text-slate-400">Patient</p>
                <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{viewingRequest.patientName}</p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400">WhatsApp Contact</p>
                <p className="font-semibold text-slate-900 dark:text-white tabular-nums mt-0.5">{viewingRequest.patientPhone}</p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400">Category</p>
                <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">{viewingRequest.testCategory}</p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400">Request Date</p>
                <p className="font-medium text-slate-800 dark:text-slate-200 tabular-nums mt-0.5">{viewingRequest.requestDate}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Lab Request Modal */}
      <Modal
        open={editingRequest !== null}
        onClose={() => setEditingRequest(null)}
        title={`Edit Lab Request — ${editingRequest?.requestNo || ''}`}
        maxWidthClass="max-w-lg"
        footer={
          <>
            <button
              type="button"
              onClick={() => setEditingRequest(null)}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#0D1628]"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!editRequestForm.testName.trim()}
              onClick={() => {
                if (!editingRequest) return;
                updateLabRequest(editingRequest.id, {
                  patientId: editRequestForm.patientId,
                  testName: editRequestForm.testName.trim(),
                  testCategory: editRequestForm.testCategory,
                  status: editRequestForm.status,
                  resultValues: editRequestForm.resultValues.trim() || undefined,
                  resultSummary: editRequestForm.resultSummary.trim() || undefined,
                  clinicalNotes: editRequestForm.clinicalNotes.trim() || undefined,
                });
                onToast(`Updated laboratory request ${editingRequest.requestNo}.`);
                setEditingRequest(null);
              }}
              className="px-4 py-2 rounded-lg bg-[#1E396A] text-white text-xs font-semibold disabled:opacity-40"
            >
              Save Changes
            </button>
          </>
        }
      >
        <div className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Patient
            </label>
            <select
              value={editRequestForm.patientId}
              onChange={(e) => setEditRequestForm({ ...editRequestForm, patientId: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0D1628] dark:text-white"
            >
              {state.patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.fullName} ({p.patientCode})
                </option>
              ))}
            </select>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Test Name *
              </label>
              <input
                type="text"
                value={editRequestForm.testName}
                onChange={(e) => setEditRequestForm({ ...editRequestForm, testName: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0D1628] dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={editRequestForm.testCategory}
                onChange={(e) => setEditRequestForm({ ...editRequestForm, testCategory: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0D1628] dark:text-white"
              >
                <option value="Hematology">Hematology</option>
                <option value="Clinical Chemistry">Clinical Chemistry</option>
                <option value="Microbiology">Microbiology</option>
                <option value="Immunology">Immunology</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Lab Status
            </label>
            <select
              value={editRequestForm.status}
              onChange={(e) =>
                setEditRequestForm({
                  ...editRequestForm,
                  status: e.target.value as 'Pending' | 'Answered',
                })
              }
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0D1628] dark:text-white"
            >
              <option value="Pending">Pending</option>
              <option value="Answered">Answered</option>
            </select>
          </div>
          {editRequestForm.status === 'Answered' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Measured Test Values
                </label>
                <input
                  type="text"
                  value={editRequestForm.resultValues}
                  onChange={(e) =>
                    setEditRequestForm({ ...editRequestForm, resultValues: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg font-mono bg-white dark:bg-[#0D1628] dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Result Summary
                </label>
                <textarea
                  rows={2}
                  value={editRequestForm.resultSummary}
                  onChange={(e) =>
                    setEditRequestForm({ ...editRequestForm, resultSummary: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0D1628] dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Clinical Notes
                </label>
                <textarea
                  rows={2}
                  value={editRequestForm.clinicalNotes}
                  onChange={(e) =>
                    setEditRequestForm({ ...editRequestForm, clinicalNotes: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0D1628] dark:text-white"
                />
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* View Patient Profile Modal */}
      <Modal
        open={viewingPatient !== null}
        onClose={() => setViewingPatient(null)}
        title={viewingPatient?.fullName || 'Patient Profile'}
        subtitle={viewingPatient ? `${viewingPatient.patientCode} · Registered ${viewingPatient.registeredAt}` : ''}
        maxWidthClass="max-w-lg"
      >
        {viewingPatient && (() => {
          const patientTests = state.labRequests.filter((r) => r.patientId === viewingPatient.id);
          return (
            <div className="space-y-4 text-xs">
              <div className="grid sm:grid-cols-2 gap-3 p-3.5 rounded-lg bg-[#F4F6F9] dark:bg-[#0D1628]">
                <div>
                  <p className="text-slate-500 dark:text-slate-400">Demographics</p>
                  <p className="font-semibold text-slate-900 dark:text-white mt-0.5">
                    {viewingPatient.age} yrs · {viewingPatient.gender}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400">WhatsApp Phone</p>
                  <p className="font-semibold text-slate-900 dark:text-white tabular-nums mt-0.5">
                    {viewingPatient.phone}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-slate-500 dark:text-slate-400">Address</p>
                  <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                    {viewingPatient.address}
                  </p>
                </div>
              </div>
              <div>
                <p className="font-semibold text-[#1E396A] dark:text-white mb-2">
                  Laboratory History ({patientTests.length})
                </p>
                {patientTests.length === 0 ? (
                  <p className="text-slate-500 dark:text-slate-400">No laboratory requests recorded for this patient.</p>
                ) : (
                  <div className="space-y-2">
                    {patientTests.map((t) => (
                      <div
                        key={t.id}
                        className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{t.testName}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {t.requestNo} · {t.requestDate}
                          </p>
                        </div>
                        <StatusLabel label={t.status} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* Edit Patient Modal */}
      <Modal
        open={editingPatient !== null}
        onClose={() => setEditingPatient(null)}
        title={`Edit Patient — ${editingPatient?.patientCode || ''}`}
        maxWidthClass="max-w-lg"
        footer={
          <>
            <button
              type="button"
              onClick={() => setEditingPatient(null)}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#0D1628]"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!editPatientForm.fullName.trim() || !editPatientForm.phone.trim()}
              onClick={() => {
                if (!editingPatient) return;
                updatePatient(editingPatient.id, {
                  fullName: editPatientForm.fullName.trim(),
                  age: Number(editPatientForm.age) || 25,
                  gender: editPatientForm.gender,
                  phone: editPatientForm.phone.trim(),
                  address: editPatientForm.address.trim() || 'Mogadishu',
                });
                onToast(`Updated patient profile for ${editPatientForm.fullName.trim()}.`);
                setEditingPatient(null);
              }}
              className="px-4 py-2 rounded-lg bg-[#1E396A] text-white text-xs font-semibold disabled:opacity-40"
            >
              Save Changes
            </button>
          </>
        }
      >
        <div className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Patient Full Name *
            </label>
            <input
              type="text"
              value={editPatientForm.fullName}
              onChange={(e) => setEditPatientForm({ ...editPatientForm, fullName: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0D1628] dark:text-white"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Age</label>
              <input
                type="number"
                value={editPatientForm.age}
                onChange={(e) => setEditPatientForm({ ...editPatientForm, age: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg tabular-nums bg-white dark:bg-[#0D1628] dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Gender</label>
              <select
                value={editPatientForm.gender}
                onChange={(e) =>
                  setEditPatientForm({
                    ...editPatientForm,
                    gender: e.target.value as 'Male' | 'Female',
                  })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0D1628] dark:text-white"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Phone / WhatsApp *
            </label>
            <input
              type="tel"
              value={editPatientForm.phone}
              onChange={(e) => setEditPatientForm({ ...editPatientForm, phone: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0D1628] dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Address</label>
            <input
              type="text"
              value={editPatientForm.address}
              onChange={(e) => setEditPatientForm({ ...editPatientForm, address: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0D1628] dark:text-white"
            />
          </div>
        </div>
      </Modal>

      <DeleteConfirmModal
        open={deleteTargetRequest !== null}
        onClose={() => setDeleteTargetRequest(null)}
        title="Archive & Delete Lab Request"
        recordType="Laboratory Request"
        recordLabel={
          deleteTargetRequest
            ? `${deleteTargetRequest.requestNo} · ${deleteTargetRequest.patientName} (${deleteTargetRequest.testName})`
            : ''
        }
        isSoftDelete
        warningMessage="Clinical diagnostic records are archived for medical compliance before removal from the active lab queue."
        onConfirm={() => {
          if (!deleteTargetRequest) return;
          const res = deleteLabRequest(deleteTargetRequest.id);
          onToast(res.message, res.ok ? 'success' : 'error');
          setDeleteTargetRequest(null);
        }}
      />

      <DeleteConfirmModal
        open={deleteTargetPatient !== null}
        onClose={() => setDeleteTargetPatient(null)}
        title="Archive & Delete Patient Record"
        recordType="Laboratory Patient"
        recordLabel={
          deleteTargetPatient
            ? `${deleteTargetPatient.patientCode} · ${deleteTargetPatient.fullName}`
            : ''
        }
        isSoftDelete
        warningMessage="Archiving this patient removes their profile and linked laboratory requests from active queues while preserving a clinical archive snapshot."
        onConfirm={() => {
          if (!deleteTargetPatient) return;
          const res = deletePatient(deleteTargetPatient.id);
          onToast(res.message, res.ok ? 'success' : 'error');
          setDeleteTargetPatient(null);
        }}
      />
    </div>
  );
};
