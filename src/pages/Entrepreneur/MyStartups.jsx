import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '../../hooks/useAuth';
import DashboardLayout from '../../components/DashboardLayout';
import EntrepreneurSidebar from '../../components/EntrepreneurSidebar';
import WarliLoader from '../../components/WarliLoader';
import {
  RocketLaunchIcon,
  PlusIcon,
  TagIcon,
  TrophyIcon,
  PencilIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  BuildingOfficeIcon,
  UsersIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import jsPDF from 'jspdf';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';

const MyStartups = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStartup, setSelectedStartup] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const sidebar = useMemo(() => <EntrepreneurSidebar />, []);

  const fetchStartups = async () => {
    if (!currentUser?.uid) {
      setLoading(false);
      return;
    }
    try {
      const q = query(
        collection(db, 'startups'),
        where('userId', '==', currentUser.uid)
      );
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        _id: docSnap.id,
        ...docSnap.data()
      }));
      setStartups(list);
    } catch (error) {
      console.error('Error fetching startups:', error);
      toast.error('Failed to load your startups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStartups();
  }, [currentUser]);

  const handleDeleteStartup = async (startupId) => {
    setDeleting(true);
    try {
      await deleteDoc(doc(db, 'startups', startupId));
      setStartups((prev) => prev.filter((s) => (s._id || s.id) !== startupId));
      setShowDeleteConfirm(null);
      toast.success('Startup deleted successfully');
    } catch (error) {
      console.error('Error deleting startup:', error);
      toast.error('Failed to delete startup. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const handleEditStartup = (startup) => {
    navigate('/create-startup', { state: { startup } });
  };

  const handleDownloadStartupPDF = (startup) => {
    const docPdf = new jsPDF();
    const pageHeight = docPdf.internal.pageSize.height;
    const margin = 20;
    let yPosition = 20;
    const lineHeight = 10;

    docPdf.setFillColor(141, 70, 36);
    docPdf.rect(0, 0, docPdf.internal.pageSize.width, 40, 'F');
    docPdf.setTextColor(255, 255, 255);
    docPdf.setFontSize(22);
    docPdf.setFont(undefined, 'bold');
    docPdf.text('Startup Proposal', docPdf.internal.pageSize.width / 2, 25, { align: 'center' });

    yPosition = 50;

    const addText = (label, value, isBold = false) => {
      if (yPosition > pageHeight - margin) {
        docPdf.addPage();
        yPosition = 20;
      }

      docPdf.setFontSize(11);
      docPdf.setTextColor(50, 45, 40);
      if (isBold) {
        docPdf.setFont(undefined, 'bold');
      } else {
        docPdf.setFont(undefined, 'normal');
      }
      docPdf.text(label, 20, yPosition);

      if (value) {
        docPdf.setFont(undefined, 'normal');
        const textLines = docPdf.splitTextToSize(String(value), 170);
        docPdf.text(textLines, 20, yPosition + 6);
        yPosition += 6 + textLines.length * 5;
      }
      yPosition += lineHeight;
    };

    const addSectionHeader = (title) => {
      if (yPosition > pageHeight - margin - 15) {
        docPdf.addPage();
        yPosition = 20;
      }
      docPdf.setFontSize(13);
      docPdf.setFont(undefined, 'bold');
      docPdf.setTextColor(141, 70, 36);
      docPdf.text(title, 20, yPosition);
      yPosition += lineHeight;
    };

    addSectionHeader('Basic Information');
    addText('Startup Name:', startup.name || 'Not provided');
    addText('Industry:', startup.industry || 'Not provided');
    addText('Stage:', startup.stage || 'Not provided');
    addText('Description:', startup.description || 'Not provided');
    addText('Tagline:', startup.tagline || 'Not provided');
    addText('Location:', startup.location || 'Not provided');

    addSectionHeader('Business Details');
    addText('Problem Statement:', startup.problemStatement || 'Not provided');
    addText('Solution:', startup.solution || 'Not provided');
    addText('Target Market:', startup.targetMarket || 'Not provided');
    addText('Unique Selling Point:', startup.uniqueSellingPoint || 'Not provided');
    addText('Value Proposition:', startup.valueProposition || 'Not provided');

    addSectionHeader('Financial Information');
    addText('Funding Goal:', startup.fundingGoal ? `₹${startup.fundingGoal.toLocaleString()}` : 'Not provided');
    addText('Current Revenue:', startup.currentRevenue ? `₹${startup.currentRevenue.toLocaleString()}` : 'Not provided');
    addText('Revenue Model:', startup.revenueModel || 'Not provided');
    addText('Projected Revenue:', startup.projectedRevenue || 'Not provided');
    addText('Investment Use:', startup.investmentUse || 'Not provided');

    addSectionHeader('Team Information');
    addText('Founder Name:', startup.founderName || 'Not provided');
    addText('Email:', startup.email || 'Not provided');
    addText('Phone:', startup.phone || 'Not provided');
    addText('Team Size:', startup.teamSize || 'Not provided');

    const fileName = `${startup.name?.replace(/\s+/g, '_') || 'startup'}_proposal.pdf`;
    docPdf.save(fileName);
  };

  const filteredStartups = useMemo(() => {
    if (!searchQuery.trim()) return startups;
    const queryLower = searchQuery.toLowerCase();
    return startups.filter(
      (s) =>
        s.name?.toLowerCase().includes(queryLower) ||
        s.industry?.toLowerCase().includes(queryLower) ||
        s.stage?.toLowerCase().includes(queryLower) ||
        s.tagline?.toLowerCase().includes(queryLower)
    );
  }, [startups, searchQuery]);

  if (loading) {
    return (
      <DashboardLayout sidebar={sidebar}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <WarliLoader size={88} />
            <p className="mt-4 text-[#8d4624] font-medium tracking-wide">Loading your startups...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebar={sidebar}>
      <div className="space-y-6 pb-16">
        {/* Top Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            <Input
              type="text"
              placeholder="Search your startups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 rounded-xl bg-transparent border-[#8d4624]/20 focus-visible:ring-[#8d4624]"
            />
          </div>

          <Button
            onClick={() => navigate('/create-startup')}
            className="bg-[#8d4624] hover:bg-[#72371c] text-white shadow-xs rounded-xl px-5 h-11 font-medium gap-2 shrink-0"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Create Startup</span>
          </Button>
        </div>

        {/* Startups Grid / List */}
        {filteredStartups.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredStartups.map((startup) => (
              <div
                key={startup._id || startup.id}
                onClick={() => setSelectedStartup(startup)}
                className="group relative p-6 rounded-2xl bg-white/70 dark:bg-stone-900/60 backdrop-blur-xl border border-stone-200/80 hover:border-[#8d4624]/40 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0">
                      <h3 className="text-xl font-bold text-stone-900 group-hover:text-[#8d4624] transition-colors truncate">
                        {startup.name}
                      </h3>
                      {startup.tagline && (
                        <p className="text-xs text-stone-500 line-clamp-1 mt-0.5">{startup.tagline}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditStartup(startup)}
                        className="rounded-xl h-8 w-8 text-stone-600 hover:text-[#8d4624] hover:bg-[#f5e9dd]/50"
                        title="Edit"
                      >
                        <PencilIcon className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowDeleteConfirm(startup._id || startup.id)}
                        className="rounded-xl h-8 w-8 text-stone-600 hover:text-red-600 hover:bg-red-50"
                        title="Delete"
                      >
                        <TrashIcon className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleDownloadStartupPDF(startup)}
                        className="bg-[#8d4624] hover:bg-[#72371c] text-white rounded-xl gap-1 px-2.5 h-8 text-xs font-medium"
                      >
                        <ArrowDownTrayIcon className="w-3 h-3" />
                        PDF
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <Badge variant="secondary" className="bg-[#f5e9dd] text-[#8d4624] text-[11px] font-semibold px-2 py-0.5 rounded-md">
                      <TagIcon className="w-3 h-3 mr-1" />
                      {startup.industry || startup.category || 'General'}
                    </Badge>
                    <Badge className="bg-[#8d4624] text-white text-[11px] font-semibold px-2 py-0.5 rounded-md hover:bg-[#72371c]">
                      <TrophyIcon className="w-3 h-3 mr-1" />
                      {startup.stage || 'Idea'}
                    </Badge>
                  </div>

                  <p className="text-xs sm:text-sm text-stone-600 line-clamp-2 leading-relaxed mb-4">
                    {startup.description || 'No description provided.'}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-4">
                    {startup.targetMarket && (
                      <div className="p-2.5 rounded-xl bg-stone-50/70 border border-stone-200/50">
                        <span className="text-[10px] font-medium text-stone-500 block uppercase">Target Market</span>
                        <p className="text-xs font-semibold text-stone-900 mt-0.5 truncate">{startup.targetMarket}</p>
                      </div>
                    )}
                    {startup.fundingGoal ? (
                      <div className="p-2.5 rounded-xl bg-stone-50/70 border border-stone-200/50">
                        <span className="text-[10px] font-medium text-stone-500 block uppercase">Funding Goal</span>
                        <p className="text-xs font-semibold text-[#8d4624] mt-0.5 truncate">
                          ₹{Number(startup.fundingGoal).toLocaleString()}
                        </p>
                      </div>
                    ) : null}
                    {startup.teamSize && (
                      <div className="p-2.5 rounded-xl bg-stone-50/70 border border-stone-200/50">
                        <span className="text-[10px] font-medium text-stone-500 block uppercase">Team</span>
                        <p className="text-xs font-semibold text-stone-900 mt-0.5">{startup.teamSize} members</p>
                      </div>
                    )}
                  </div>
                </div>

                {(startup.hasWebsite || startup.hasPrototype || startup.hasMinimumViableProduct || startup.hasRevenue || startup.hasFunding) && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-stone-100">
                    <span className="text-[11px] font-semibold text-stone-500 mr-1.5">Milestones:</span>
                    {startup.hasWebsite && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                        ✓ Website
                      </span>
                    )}
                    {startup.hasPrototype && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                        ✓ Prototype
                      </span>
                    )}
                    {startup.hasMinimumViableProduct && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                        ✓ MVP
                      </span>
                    )}
                    {startup.hasRevenue && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                        ✓ Revenue
                      </span>
                    )}
                    {startup.hasFunding && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                        ✓ Funding
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 rounded-3xl border border-dashed border-[#8d4624]/20 text-center bg-white/40 backdrop-blur-sm max-w-md mx-auto mt-8">
            <div className="w-14 h-14 rounded-2xl bg-[#f5e9dd] text-[#8d4624] flex items-center justify-center mx-auto mb-4">
              <RocketLaunchIcon className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-stone-900">
              {searchQuery ? 'No startups found' : 'No Startups Registered'}
            </h3>
            <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
              {searchQuery
                ? 'Try a different keyword or clear your search query.'
                : 'Create your first venture profile to showcase your ideas, pitch to investors, and connect with mentors.'}
            </p>
            <Button
              onClick={() => navigate('/create-startup')}
              className="mt-6 bg-[#8d4624] hover:bg-[#72371c] text-white rounded-xl px-5 text-xs font-semibold gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Create Startup</span>
            </Button>
          </div>
        )}
      </div>

      {/* Startup Details Modal */}
      <Dialog open={!!selectedStartup} onOpenChange={(open) => !open && setSelectedStartup(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] p-0 overflow-hidden bg-white rounded-3xl">
          {selectedStartup && (
            <>
              <DialogHeader className="p-6 pb-4 border-b border-stone-100 bg-stone-50/50">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <DialogTitle className="text-2xl font-black text-stone-900">
                      {selectedStartup.name}
                    </DialogTitle>
                    {selectedStartup.tagline && (
                      <DialogDescription className="text-xs text-stone-500 mt-1">
                        {selectedStartup.tagline}
                      </DialogDescription>
                    )}
                  </div>
                  <Badge className="bg-[#8d4624] text-white text-xs px-2.5 py-0.5">
                    {selectedStartup.stage || 'Idea'}
                  </Badge>
                </div>
              </DialogHeader>

              <ScrollArea className="p-6 max-h-[60vh]">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-bold text-[#8d4624] uppercase tracking-wider mb-2">Description</h4>
                    <p className="text-sm text-stone-700 leading-relaxed">
                      {selectedStartup.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {selectedStartup.problemStatement && (
                      <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/60">
                        <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-1">Problem</h4>
                        <p className="text-xs text-stone-600 leading-relaxed">{selectedStartup.problemStatement}</p>
                      </div>
                    )}
                    {selectedStartup.solution && (
                      <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/60">
                        <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-1">Solution</h4>
                        <p className="text-xs text-stone-600 leading-relaxed">{selectedStartup.solution}</p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/50">
                      <span className="text-[10px] font-medium text-stone-500 uppercase">Industry</span>
                      <p className="text-xs font-semibold text-stone-900 mt-0.5">{selectedStartup.industry || 'General'}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/50">
                      <span className="text-[10px] font-medium text-stone-500 uppercase">Target Market</span>
                      <p className="text-xs font-semibold text-stone-900 mt-0.5 truncate">{selectedStartup.targetMarket || 'N/A'}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/50">
                      <span className="text-[10px] font-medium text-stone-500 uppercase">Team Size</span>
                      <p className="text-xs font-semibold text-stone-900 mt-0.5">{selectedStartup.teamSize || '1'} members</p>
                    </div>
                  </div>

                  {selectedStartup.fundingGoal && (
                    <div className="p-4 rounded-xl bg-[#f5e9dd]/50 border border-[#8d4624]/20 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-[#8d4624] font-semibold">Funding Goal</span>
                        <p className="text-xl font-black text-[#8d4624]">
                          ₹{Number(selectedStartup.fundingGoal).toLocaleString()}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleDownloadStartupPDF(selectedStartup)}
                        className="bg-[#8d4624] hover:bg-[#72371c] text-white rounded-xl gap-1 text-xs"
                      >
                        <ArrowDownTrayIcon className="w-3.5 h-3.5" />
                        Download Proposal
                      </Button>
                    </div>
                  )}
                </div>
              </ScrollArea>

              <DialogFooter className="p-4 border-t border-stone-100 bg-stone-50/50 flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedStartup(null)} className="rounded-xl text-xs">
                  Close
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    const st = selectedStartup;
                    setSelectedStartup(null);
                    handleEditStartup(st);
                  }}
                  className="bg-[#8d4624] hover:bg-[#72371c] text-white rounded-xl text-xs"
                >
                  Edit Startup
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Startup Confirmation */}
      <Dialog open={!!showDeleteConfirm} onOpenChange={(open) => !open && setShowDeleteConfirm(null)}>
        <DialogContent className="max-w-md rounded-2xl bg-white p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-stone-900">Delete Startup?</DialogTitle>
            <DialogDescription className="text-xs text-stone-500 mt-1">
              Are you sure you want to delete this startup profile? This action is permanent and cannot be reversed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex justify-end gap-2">
            <Button
              variant="outline"
              disabled={deleting}
              className="rounded-xl text-xs"
              onClick={() => setShowDeleteConfirm(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleting}
              className="rounded-xl text-xs"
              onClick={() => handleDeleteStartup(showDeleteConfirm)}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default MyStartups;

