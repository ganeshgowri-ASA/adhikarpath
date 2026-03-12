// /home/user/adhikarpath/components/account/DownloadsClient.tsx
"use client";

import { Download, FileText, BookOpen, ClipboardList, Wrench, Info } from "lucide-react";

interface DownloadItem {
  id: string;
  name: string;
  version: string;
  category: string;
  format: "PDF" | "XLSX" | "ZIP" | "DOCX";
  size: string;
  filename: string;
}

const DOWNLOADS: DownloadItem[] = [
  // User Guides
  {
    id: "1",
    name: "AdhikarPath User Guide",
    version: "v2.3",
    category: "User Guides",
    format: "PDF",
    size: "2.4 MB",
    filename: "AdhikarPath_User_Guide_v2.3.pdf",
  },
  {
    id: "2",
    name: "Manager Approval Guide",
    version: "v1.5",
    category: "User Guides",
    format: "PDF",
    size: "1.6 MB",
    filename: "Manager_Approval_Guide_v1.5.pdf",
  },
  // Policies
  {
    id: "3",
    name: "Access Request Policy",
    version: "v1.8",
    category: "Policies",
    format: "PDF",
    size: "1.1 MB",
    filename: "Access_Request_Policy_v1.8.pdf",
  },
  {
    id: "4",
    name: "Security Compliance Framework",
    version: "v4.0",
    category: "Policies",
    format: "PDF",
    size: "5.1 MB",
    filename: "Security_Compliance_Framework_v4.0.pdf",
  },
  // Reference
  {
    id: "5",
    name: "IAM Quick Reference Card",
    version: "v3.1",
    category: "Reference",
    format: "PDF",
    size: "0.8 MB",
    filename: "IAM_Quick_Reference_Card_v3.1.pdf",
  },
  {
    id: "6",
    name: "System Access Matrix",
    version: "v2024.12",
    category: "Reference",
    format: "XLSX",
    size: "0.5 MB",
    filename: "System_Access_Matrix_v2024.12.xlsx",
  },
  // Handbooks
  {
    id: "7",
    name: "Role Owner Handbook",
    version: "v2.0",
    category: "Handbooks",
    format: "PDF",
    size: "3.2 MB",
    filename: "Role_Owner_Handbook_v2.0.pdf",
  },
  // Tools
  {
    id: "8",
    name: "Audit Trail Export Tool",
    version: "v1.2",
    category: "Tools",
    format: "ZIP",
    size: "12 MB",
    filename: "Audit_Trail_Export_Tool_v1.2.zip",
  },
];

const CATEGORY_ORDER = ["User Guides", "Policies", "Reference", "Handbooks", "Tools"];

const CATEGORY_META: Record<
  string,
  { icon: React.ComponentType<{ className?: string }>; color: string; bg: string }
> = {
  "User Guides": { icon: BookOpen, color: "text-[#1565C0]", bg: "bg-blue-50" },
  Policies: { icon: ClipboardList, color: "text-purple-700", bg: "bg-purple-50" },
  Reference: { icon: Info, color: "text-teal-700", bg: "bg-teal-50" },
  Handbooks: { icon: FileText, color: "text-orange-700", bg: "bg-orange-50" },
  Tools: { icon: Wrench, color: "text-gray-700", bg: "bg-gray-100" },
};

const FORMAT_BADGE: Record<string, string> = {
  PDF: "bg-red-50 text-red-700",
  XLSX: "bg-green-50 text-green-700",
  ZIP: "bg-gray-100 text-gray-700",
  DOCX: "bg-blue-50 text-[#1565C0]",
};

function groupByCategory(items: DownloadItem[]): Record<string, DownloadItem[]> {
  return items.reduce<Record<string, DownloadItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});
}

export function DownloadsClient() {
  const grouped = groupByCategory(DOWNLOADS);

  function handleDownload(item: DownloadItem) {
    alert(`Download initiated for ${item.filename}`);
  }

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 flex items-center gap-4">
        <div className="w-11 h-11 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
          <Download className="w-6 h-6 text-[#1565C0]" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-gray-900">Resource Library</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Access the latest guides, policy documents, reference materials and tools for the
            AdhikarPath IAM portal.
          </p>
        </div>
      </div>

      {/* Category sections */}
      {CATEGORY_ORDER.filter((cat) => grouped[cat]).map((category) => {
        const items = grouped[category];
        const meta = CATEGORY_META[category] ?? {
          icon: FileText,
          color: "text-gray-700",
          bg: "bg-gray-100",
        };
        const CategoryIcon = meta.icon;

        return (
          <div key={category} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            {/* Section header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-lg ${meta.bg} flex items-center justify-center shrink-0`}
              >
                <CategoryIcon className={`w-4 h-4 ${meta.color}`} />
              </div>
              <h3 className="text-sm font-semibold text-gray-800">{category}</h3>
              <span className="ml-auto text-xs text-gray-400">
                {items.length} document{items.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Table */}
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Document Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Version
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Format
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                        <span className="font-medium text-gray-900">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        {item.version}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                          FORMAT_BADGE[item.format] ?? "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {item.format}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">{item.size}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDownload(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#1565C0] rounded-lg hover:bg-[#003c8f] transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}
