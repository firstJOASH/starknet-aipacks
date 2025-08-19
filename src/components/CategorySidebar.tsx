import { useRef, useEffect, useState } from "react";
import { useGSAP } from "@/hooks/useGSAP";
import { useAppStore } from "@/stores/useAppStore";
import { DATASET_CATEGORIES, DatasetCategory } from "@/lib/starknet";
import { Button } from "@/components/ui/button";
import { Plus, Folder } from "lucide-react";

export const CategorySidebar = () => {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { animatePageEnter } = useGSAP();
  const {
    selectedCategory,
    setSelectedCategory,
    setUploadModalOpen,
    contractDatasets,
  } = useAppStore();

  const [totalVolumeSTRK, setTotalVolumeSTRK] = useState("0.000");
  const [totalDatasets, setTotalDatasets] = useState(0);
  const [activeUsersCount, setActiveUsersCount] = useState(0);

  useEffect(() => {
    if (sidebarRef.current) {
      animatePageEnter(sidebarRef.current);
    }
  }, []);

  // Recalculate stats whenever contractDatasets changes
  useEffect(() => {
    setTotalDatasets(contractDatasets.length);

    // Total Volume
    const totalVolumeWei = contractDatasets.reduce(
      (sum, d) => sum + d.price,
      0n
    );
    const strkWhole = totalVolumeWei / 10n ** 18n;
    const strkFraction = (totalVolumeWei % 10n ** 18n) / 10n ** 15n; // 3 decimals
    const formattedWhole = strkWhole
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    setTotalVolumeSTRK(
      `${formattedWhole}.${strkFraction.toString().padStart(3, "0")}`
    );

    // Active Users
    const uniqueUsers = new Set<string>();
    contractDatasets.forEach((d) => uniqueUsers.add(d.owner.toLowerCase()));
    setActiveUsersCount(uniqueUsers.size);
  }, [contractDatasets]);

  const categories: (DatasetCategory | "All")[] = [
    "All",
    ...DATASET_CATEGORIES,
  ];

  return (
    <div
      ref={sidebarRef}
      className="w-64 bg-card border-r border-border h-full"
    >
      <div className="p-6 space-y-6">
        {/* Upload Button */}
        <Button
          onClick={() => setUploadModalOpen(true)}
          className="w-full ainest-btn-primary flex items-center justify-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Upload Dataset</span>
        </Button>

        {/* Categories */}
        <div className="space-y-2">
          <h3 className="font-semibold text-foreground text-sm uppercase tracking-wide mb-4">
            Categories
          </h3>

          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`
                w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2
                ${
                  selectedCategory === category
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }
              `}
            >
              <Folder className="h-4 w-4" />
              <span className="text-sm">{category}</span>
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="pt-6 border-t border-border space-y-3">
          <div className="text-xs text-muted-foreground uppercase tracking-wide">
            Statistics
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Datasets</span>
              <span className="font-medium text-foreground">
                {totalDatasets}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Volume</span>
              <span className="font-medium text-foreground">
                {totalVolumeSTRK} STRK
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Active Users</span>
              <span className="font-medium text-foreground">
                {activeUsersCount}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
