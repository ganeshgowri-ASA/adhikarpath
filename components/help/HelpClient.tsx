"use client";

import { useEffect, useState } from "react";
import {
  Search,
  ChevronRight,
  ChevronDown,
  FileText,
  Loader2,
  BookOpen,
  TreePine,
  AlignLeft,
} from "lucide-react";

interface HelpDoc {
  id: string;
  title: string;
  content?: string;
  parentId?: string | null;
  children?: HelpDoc[];
}

type ViewMode = "tree" | "search";

export function HelpClient() {
  const [viewMode, setViewMode] = useState<ViewMode>("tree");
  const [docs, setDocs] = useState<HelpDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<HelpDoc[]>([]);
  const [searching, setSearching] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [selectedDoc, setSelectedDoc] = useState<HelpDoc | null>(null);

  useEffect(() => {
    fetchRootDocs();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 2) {
        performSearch(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  async function fetchRootDocs() {
    setLoading(true);
    try {
      const res = await fetch("/api/help");
      const data = await res.json();
      setDocs(data.docs || []);
    } finally {
      setLoading(false);
    }
  }

  async function fetchChildren(parentId: string) {
    const res = await fetch(`/api/help?parentId=${parentId}`);
    const data = await res.json();
    return data.docs as HelpDoc[];
  }

  async function toggleExpand(doc: HelpDoc) {
    if (expandedIds.has(doc.id)) {
      setExpandedIds((prev) => {
        const next = new Set(prev);
        next.delete(doc.id);
        return next;
      });
    } else {
      // Load children if needed
      if (!doc.children || doc.children.length === 0) {
        const children = await fetchChildren(doc.id);
        setDocs((prev) => updateDocChildren(prev, doc.id, children));
      }
      setExpandedIds((prev) => new Set([...prev, doc.id]));
    }
  }

  function updateDocChildren(list: HelpDoc[], id: string, children: HelpDoc[]): HelpDoc[] {
    return list.map((d) => {
      if (d.id === id) return { ...d, children };
      if (d.children) return { ...d, children: updateDocChildren(d.children, id, children) };
      return d;
    });
  }

  async function performSearch(q: string) {
    setSearching(true);
    try {
      const res = await fetch(`/api/help?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSearchResults(data.docs || []);
    } finally {
      setSearching(false);
    }
  }

  function TreeNode({ doc, depth = 0 }: { doc: HelpDoc; depth?: number }) {
    const isExpanded = expandedIds.has(doc.id);
    const hasChildren = (doc.children?.length ?? 0) > 0 || depth < 2;

    return (
      <div>
        <div
          className={`flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors group ${
            selectedDoc?.id === doc.id ? "bg-blue-100 text-[#1565C0]" : "text-gray-700"
          }`}
          style={{ paddingLeft: `${12 + depth * 20}px` }}
          onClick={() => {
            setSelectedDoc(doc);
            if (doc.children !== undefined || depth < 2) toggleExpand(doc);
          }}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            )
          ) : (
            <span className="w-3.5 h-3.5 shrink-0" />
          )}
          <FileText className={`w-4 h-4 shrink-0 ${selectedDoc?.id === doc.id ? "text-[#1565C0]" : "text-gray-400 group-hover:text-[#1565C0]"}`} />
          <span className="text-sm">{doc.title}</span>
        </div>
        {isExpanded && doc.children && (
          <div>
            {doc.children.map((child) => (
              <TreeNode key={child.id} doc={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and View Toggle */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); if (e.target.value.length >= 2) setViewMode("search"); else setViewMode("tree"); }}
            placeholder="Search help documents..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1565C0]"
          />
        </div>
        <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-1">
          <button
            onClick={() => setViewMode("tree")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              viewMode === "tree" ? "bg-[#1565C0] text-white" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <TreePine className="w-3.5 h-3.5" />
            Tree View
          </button>
          <button
            onClick={() => setViewMode("search")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              viewMode === "search" ? "bg-[#1565C0] text-white" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <AlignLeft className="w-3.5 h-3.5" />
            List View
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Tree/Search */}
        <div className="adhikar-card p-4 max-h-[calc(100vh-240px)] overflow-y-auto">
          <div className="flex items-center gap-2 mb-3 px-1">
            <BookOpen className="w-4 h-4 text-[#1565C0]" />
            <h3 className="font-semibold text-gray-900 text-sm">
              {viewMode === "search" ? "Search Results" : "Documentation"}
            </h3>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-[#1565C0]" />
            </div>
          ) : viewMode === "search" ? (
            <div>
              {searching ? (
                <div className="flex items-center gap-2 py-4 text-sm text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" /> Searching...
                </div>
              ) : searchResults.length === 0 ? (
                <p className="text-sm text-gray-500 py-4 text-center">
                  {searchQuery.length < 2 ? "Type at least 2 characters to search" : "No results found"}
                </p>
              ) : (
                <div className="space-y-1">
                  {searchResults.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => setSelectedDoc(doc)}
                      className={`w-full text-left flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-blue-50 transition-colors ${
                        selectedDoc?.id === doc.id ? "bg-blue-100 text-[#1565C0]" : "text-gray-700"
                      }`}
                    >
                      <FileText className="w-4 h-4 shrink-0 text-[#1565C0]" />
                      <span className="text-sm">{doc.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-0.5">
              {docs.map((doc) => (
                <TreeNode key={doc.id} doc={doc} />
              ))}
            </div>
          )}
        </div>

        {/* Right: Content */}
        <div className="lg:col-span-2 adhikar-card p-6 max-h-[calc(100vh-240px)] overflow-y-auto">
          {selectedDoc ? (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">{selectedDoc.title}</h2>
              <div className="prose prose-sm text-gray-700 max-w-none">
                {selectedDoc.content ? (
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {selectedDoc.content}
                  </div>
                ) : (
                  <p className="text-gray-500">Select a document to view its content.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-16 text-center">
              <BookOpen className="w-12 h-12 text-gray-200 mb-4" />
              <h3 className="text-lg font-medium text-gray-400 mb-2">Select a Document</h3>
              <p className="text-sm text-gray-400">
                Choose a topic from the tree or use the search to find help content.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
