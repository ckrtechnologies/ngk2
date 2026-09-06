import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  FileText,
  Search,
  MessageSquare,
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  User,
  Store,
  Eye,
  Car,
  Tag,
} from 'lucide-react';
import { fetchEnquiries } from '../redux/adminSlice';
import { StatusBadge } from '../components/common/Badge';
import { FilterBar } from '../components/common/FilterBar';
import { DataTable } from '../components/common/DataTable';
import { exportToCSV, exportToPDF } from '../utils/exportUtils';

const EnquiriesManagement = () => {
  const dispatch = useDispatch();
  const { enquiries, adminUser, loading } = useSelector((state) => state.admin);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');

  // Slide-Over Audit Drawer State
  const [activeEnquiry, setActiveEnquiry] = useState(null);
  const [showImageLightbox, setShowImageLightbox] = useState(false);

  useEffect(() => {
    // Fetch global enquiries for admin
    dispatch(fetchEnquiries(adminUser?.id || null));
  }, [dispatch, adminUser]);

  // Metric KPI calculation
  const metrics = useMemo(() => {
    const list = enquiries || [];
    return {
      total: list.length,
      pending: list.filter((e) => (e.status || '').toLowerCase() === 'pending').length,
      inProgress: list.filter(
        (e) =>
          (e.status || '').toLowerCase() === 'in progress' ||
          (e.status || '').toLowerCase() === 'inprogress'
      ).length,
      resolved: list.filter((e) => (e.status || '').toLowerCase() === 'resolved').length,
      closed: list.filter((e) => (e.status || '').toLowerCase() === 'closed').length,
    };
  }, [enquiries]);

  const facets = [
    { id: 'ALL', label: 'All Inquiries', count: metrics.total },
    { id: 'PENDING', label: 'Pending Response', count: metrics.pending },
    { id: 'IN PROGRESS', label: 'In Negotiation', count: metrics.inProgress },
    { id: 'RESOLVED', label: 'Completed', count: metrics.resolved },
    { id: 'CLOSED', label: 'Archived', count: metrics.closed },
  ];

  // Filtered & Sorted Inquiries
  const filteredEnquiries = useMemo(() => {
    let result = (enquiries || []).filter((eq) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (eq.title && eq.title.toLowerCase().includes(q)) ||
        (eq.description && eq.description.toLowerCase().includes(q)) ||
        (eq.userName && eq.userName.toLowerCase().includes(q)) ||
        (eq.userEmail && eq.userEmail.toLowerCase().includes(q)) ||
        (eq.dealerName && eq.dealerName.toLowerCase().includes(q)) ||
        (eq.customer?.name && eq.customer.name.toLowerCase().includes(q)) ||
        (eq.dealer?.name && eq.dealer.name.toLowerCase().includes(q));

      const statusVal = (eq.status || 'pending').toLowerCase();
      let matchesStatus = true;
      if (selectedStatus !== 'ALL') {
        const sel = selectedStatus.toLowerCase();
        if (sel === 'pending' && statusVal !== 'pending') matchesStatus = false;
        if (sel === 'in progress' && statusVal !== 'in progress' && statusVal !== 'inprogress')
          matchesStatus = false;
        if (sel === 'resolved' && statusVal !== 'resolved') matchesStatus = false;
        if (sel === 'closed' && statusVal !== 'closed') matchesStatus = false;
      }

      return matchesSearch && matchesStatus;
    });

    // Sorting
    return result.sort((a, b) => {
      const timeA = new Date(a.created_at || a.createdAt || 0).getTime();
      const timeB = new Date(b.created_at || b.createdAt || 0).getTime();
      if (sortBy === 'newest') return timeB - timeA;
      if (sortBy === 'oldest') return timeA - timeB;
      return 0;
    });
  }, [enquiries, searchQuery, selectedStatus, sortBy]);

  // Export handlers
  const handleExportCSV = () => {
    exportToCSV(filteredEnquiries, 'ngk_commercial_inquiries.csv');
  };

  const handleExportPDF = () => {
    exportToPDF(filteredEnquiries, 'ngk_commercial_inquiries.pdf');
  };

  const formatMessageTime = (ts) => {
    if (!ts) return '';
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
      return '';
    }
  };

  // Safe accessor for attached image URL
  const activeImageUrl = useMemo(() => {
    if (!activeEnquiry) return null;
    return (
      activeEnquiry.imageUrl ||
      activeEnquiry.image_url ||
      activeEnquiry.imageurl ||
      activeEnquiry.part_reference?.imageurl ||
      activeEnquiry.part_reference?.imageUrl ||
      null
    );
  }, [activeEnquiry]);

  // Safe accessor for messages thread
  const activeMessages = useMemo(() => {
    if (!activeEnquiry) return [];
    const msgs = activeEnquiry.messages || [];
    return [...msgs].sort(
      (a, b) =>
        new Date(a.created_at || a.timestamp || 0) - new Date(b.created_at || b.timestamp || 0)
    );
  }, [activeEnquiry]);

  // Table Columns (Clean Corporate Design)
  const columns = [
    {
      header: 'Inquiry Reference & Part',
      accessor: 'title',
      sortable: true,
      render: (item) => (
        <div className="flex flex-col">
          <span className="font-extrabold text-xs text-slate-900 leading-snug">
            {item.title || 'Technical Inquiry'}
          </span>
          <span className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
            {item.partName || item.description || 'Automotive parts request'}
          </span>
          <div className="flex items-center gap-2 mt-1">
            {item.partNumber && (
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                <Tag className="w-2.5 h-2.5" />
                {item.partNumber}
              </span>
            )}
            {item.carName && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500">
                <Car className="w-2.5 h-2.5" />
                {item.carName}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      header: 'Buyer (Vehicle Owner)',
      accessor: 'userName',
      render: (item) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs">
            {(item.userName || item.customer?.name || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xs text-slate-900">
              {item.userName || item.customer?.name || 'Customer'}
            </span>
            <span className="text-[10px] text-slate-400">
              {item.userEmail || item.customer?.email || 'Registered Owner'}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'Assigned Reseller',
      accessor: 'dealerName',
      render: (item) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
            <Store className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xs text-slate-900">
              {item.dealerName || item.dealer?.name || 'Authorized Stockist'}
            </span>
            <span className="text-[10px] text-slate-400">
              {item.dealer?.email || 'Local Network Partner'}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      render: (item) => <StatusBadge status={item.status || 'Pending'} />,
    },
    {
      header: 'Logged Date',
      accessor: 'created_at',
      sortable: true,
      render: (item) => {
        const d = new Date(item.created_at || item.createdAt || Date.now());
        return (
          <div className="flex flex-col text-xs">
            <span className="font-semibold text-slate-800">
              {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="text-[10px] text-slate-400">
              {d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        );
      },
    },
    {
      header: 'Audit Action',
      accessor: 'id',
      render: (item) => (
        <button
          onClick={() => setActiveEnquiry(item)}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Inspect Log</span>
        </button>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6 w-full font-sans">
      {/* Executive Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Commercial Inquiries & Activity Feed
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              Audit Mode
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Read-only market intelligence log of direct inquiries between vehicle owners and local verified stockists.
          </p>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
            Total Inquiries
          </span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{metrics.total}</span>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-extrabold text-amber-600 uppercase tracking-wider block">
            Pending Response
          </span>
          <span className="text-2xl font-black text-amber-600 mt-1 block">{metrics.pending}</span>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider block">
            Active Negotiation
          </span>
          <span className="text-2xl font-black text-blue-600 mt-1 block">{metrics.inProgress}</span>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider block">
            Completed Quotes
          </span>
          <span className="text-2xl font-black text-emerald-600 mt-1 block">{metrics.resolved}</span>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar
        facets={facets}
        selectedFacet={selectedStatus}
        onSelectFacet={setSelectedStatus}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by part number, vehicle, buyer name, or dealer..."
        sortBy={sortBy}
        onSortChange={setSortBy}
        sortOptions={[
          { value: 'newest', label: 'Latest First' },
          { value: 'oldest', label: 'Oldest First' },
        ]}
        onExportCSV={handleExportCSV}
        onExportPDF={handleExportPDF}
      />

      {/* Inquiries Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <DataTable
          columns={columns}
          data={filteredEnquiries}
          loading={loading}
          emptyMessage="No commercial inquiries found matching your filters."
        />
      </div>

      {/* Slide-Over Conversation Audit Drawer (Read-Only) */}
      {activeEnquiry && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setActiveEnquiry(null)}
          />

          <div className="relative w-full max-w-xl bg-white shadow-2xl h-full flex flex-col z-10 animate-slide-in-right border-l border-slate-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-50 text-brand-red rounded-xl">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900">
                    {activeEnquiry.title || 'Technical Inquiry Log'}
                  </h2>
                  <span className="text-[10px] font-bold text-slate-400">
                    ID: #{String(activeEnquiry.id).slice(0, 8)} • Read-Only Inspection
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <StatusBadge status={activeEnquiry.status || 'Pending'} />
                <button
                  onClick={() => setActiveEnquiry(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Buyer & Reseller Card */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Buyer (Customer)
                    </span>
                    <span className="font-extrabold text-slate-900 block mt-0.5">
                      {activeEnquiry.userName || activeEnquiry.customer?.name || 'Customer'}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {activeEnquiry.userEmail || activeEnquiry.customer?.email}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Assigned Reseller / Stockist
                    </span>
                    <span className="font-extrabold text-slate-900 block mt-0.5">
                      {activeEnquiry.dealerName || activeEnquiry.dealer?.name || 'Authorized Stockist'}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {activeEnquiry.dealer?.email || 'Local Network Partner'}
                    </span>
                  </div>
                </div>

                {activeEnquiry.description && (
                  <div className="pt-3 border-t border-slate-200/80">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Inquiry Details / Specification Request
                    </span>
                    <p className="text-xs font-medium text-slate-700 mt-1 leading-relaxed">
                      {activeEnquiry.description}
                    </p>
                  </div>
                )}

                {/* Attached Photo */}
                {activeImageUrl && (
                  <div className="pt-3 border-t border-slate-200/80">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Customer Attachment
                    </span>
                    <div
                      className="relative rounded-xl overflow-hidden border border-slate-200 max-w-xs cursor-pointer group"
                      onClick={() => setShowImageLightbox(true)}
                    >
                      <img
                        src={activeImageUrl}
                        alt="Enquiry attachment"
                        className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <span className="text-xs font-bold text-white bg-black/60 px-2 py-1 rounded-md flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" /> Zoom
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Direct Peer-to-Peer Conversation History (Read-Only) */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                    Buyer ↔ Seller Conversation
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">
                    {activeMessages.length} messages logged
                  </span>
                </div>

                <div className="space-y-3 bg-slate-50/60 p-4 rounded-xl border border-slate-200/80">
                  {activeMessages.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400 bg-white rounded-lg border border-slate-200">
                      No direct messages logged between buyer and seller yet.
                    </div>
                  ) : (
                    activeMessages.map((msg, mIdx) => {
                      const isSystem = msg.isSystem || msg.is_system;
                      const senderRole = (msg.sender_role || msg.sender || '').toLowerCase();
                      const isSeller = senderRole === 'reseller' || senderRole === 'distributor';

                      if (isSystem) {
                        return (
                          <div key={mIdx} className="text-center my-2">
                            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-slate-200 text-slate-600">
                              {msg.text || msg.message_text} • {formatMessageTime(msg.timestamp || msg.created_at)}
                            </span>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={mIdx}
                          className={`flex flex-col ${isSeller ? 'items-end' : 'items-start'}`}
                        >
                          <div className="flex items-center gap-1.5 mb-1 px-1">
                            <span className="text-[10px] font-black text-slate-700">
                              {msg.senderName || msg.sender_name || (isSeller ? 'Stockist / Dealer' : 'Customer')}
                            </span>
                            <span className="text-[9px] text-slate-400 font-medium">
                              {formatMessageTime(msg.timestamp || msg.created_at)}
                            </span>
                          </div>
                          <div
                            className={`p-3 rounded-xl max-w-md text-xs font-medium leading-relaxed ${
                              isSeller
                                ? 'bg-emerald-700 text-white rounded-tr-xs shadow-xs'
                                : 'bg-white text-slate-800 rounded-tl-xs border border-slate-200 shadow-2xs'
                            }`}
                          >
                            {msg.text || msg.message_text}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Policy Notice: Admin does not participate in ticket management */}
              <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                  <strong>Administrative Policy:</strong> Commercial negotiations, pricing, and fulfillment occur directly between verified resellers and customers. Administrative intervention is limited to auditing and regulatory compliance.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Lightbox Modal */}
      {showImageLightbox && activeImageUrl && (
        <div
          className="fixed inset-0 z-60 bg-black/85 flex items-center justify-center p-4"
          onClick={() => setShowImageLightbox(false)}
        >
          <div className="relative max-w-2xl max-h-[85vh]">
            <img
              src={activeImageUrl}
              alt="Attachment full view"
              className="max-w-full max-h-[85vh] rounded-xl shadow-2xl object-contain"
            />
            <button
              onClick={() => setShowImageLightbox(false)}
              className="absolute -top-3 -right-3 p-1.5 bg-white text-slate-800 rounded-full shadow-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnquiriesManagement;
