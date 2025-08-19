// src/pages/Profile.tsx
import { useRef, useEffect, useMemo, useState } from "react";
import {
  useAccount,
  useContract,
  useSendTransaction,
  useEvents,
} from "@starknet-react/core";
import { useAppStore } from "@/stores/useAppStore";
import { useGSAP } from "@/hooks/useGSAP";
// import { Dataset, DatasetCategory } from "@/lib/starknet";
import { DatasetCard } from "@/components/DatasetCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Upload, Wallet, Copy, ExternalLink, History } from "lucide-react";
import AINEST_ABI from "@/utils/AINEST_ABI.json";
import { AINEST_ADDRESS } from "@/utils/contracts";
import { toU256, fromU256 } from "@/utils/cairo";
import { BlockTag } from "starknet";

export const Profile = () => {
  const profileRef = useRef<HTMLDivElement>(null);
  const { animatePageEnter } = useGSAP();
  const { address, isConnected } = useAccount();
  const { contractDatasets, setUploadModalOpen } = useAppStore();
  const { contract } = useContract({
    abi: AINEST_ABI as any,
    address: AINEST_ADDRESS,
  });
  const { send } = useSendTransaction({
    calls: undefined,
  });
  const { toast } = useToast();

  const myAddr = (address || "").toLowerCase();
  const [activeTab, setActiveTab] = useState<
    "onSale" | "purchased" | "sold" | "activity"
  >("onSale");
  const originalOwnerStr = function (dataset: any) {
    return typeof dataset.originalOwner === "string"
      ? dataset.originalOwner
      : `0x${BigInt(dataset.originalOwner).toString(16)}`;
  };

  // Owned by me (current owner)
  const myOwned = useMemo(
    () => contractDatasets.filter((d) => d.owner?.toLowerCase() === myAddr),
    [contractDatasets, myAddr]
  );

  // My listings still for sale
  const myOnSale = useMemo(
    () =>
      contractDatasets.filter((d) => {
        const originalOwnerFormatted = originalOwnerStr(d);
        return (
          originalOwnerFormatted.toLowerCase() === myAddr &&
          d.owner?.toLowerCase() === myAddr &&
          d.listed
        );
      }),
    [contractDatasets, myAddr]
  );

  // Purchased by me
  const myPurchased = useMemo(
    () =>
      contractDatasets.filter((d) => {
        const originalOwnerFormatted = originalOwnerStr(d);
        return (
          d.owner?.toLowerCase() === myAddr &&
          originalOwnerFormatted?.toLowerCase() !== myAddr
        );
      }),
    [contractDatasets, myAddr]
  );

  // Sold by me
  const mySold = useMemo(
    () =>
      contractDatasets.filter((d) => {
        const originalOwnerFormatted = originalOwnerStr(d);
        return (
          originalOwnerFormatted?.toLowerCase() === myAddr &&
          d.owner?.toLowerCase() !== myAddr
        );
      }),
    [contractDatasets, myAddr]
  );

  // Basic stats
  const totalUploads = myOnSale.length + mySold.length;
  const totalOwnedNow = myOwned.length;

  // Fetch recent activity from contract events
  const [recentActivity, setRecentActivity] = useState<
    { id: number; action: string; timestamp: string }[]
  >([]);

  const { data: transferredEvents, error: transferredError } = useEvents({
    address: AINEST_ADDRESS,
    eventName: "DatasetTransferred",
    fromBlock: 0,
    toBlock: BlockTag.LATEST,
    pageSize: 20,
    retry: 3,
    retryDelay: 1000,
    enabled: true,
    refetchInterval: 30000,
  });

  const { data: relistedEvents, error: relistedError } = useEvents({
    address: AINEST_ADDRESS,
    eventName: "DatasetRelisted",
    fromBlock: 0,
    toBlock: BlockTag.LATEST,
    pageSize: 20,
    retry: 3,
    retryDelay: 1000,
    enabled: true,
    refetchInterval: 30000,
  });

  useEffect(() => {
    const activity: { id: number; action: string; timestamp: string }[] = [];

    if (transferredEvents) {
      const pages = transferredEvents.pages as any[];
      for (const [pageIndex, page] of pages.entries()) {
        if (Array.isArray(page)) {
          for (const [eventIndex, event] of page.entries()) {
            const dataset_id = event.data[0];
            const from = event.data[1];
            const to = event.data[2];
            activity.push({
              id: pageIndex * 20 + eventIndex,
              action: `Transferred dataset #${Number(event.data[0])} from ${
                event.data[1]
              } to ${event.data[2]}`,
              timestamp: new Date().toISOString(), // Replace with block timestamp
            });
          }
        } else if (page && page.data) {
          // Handle case where page is a single event
          const dataset_id = page.data[0];
          const from = page.data[1];
          const to = page.data[2];
          activity.push({
            id: pageIndex * 20,
            action: `Transferred dataset #${Number(page.data[0])} from ${
              page.data[1]
            } to ${page.data[2]}`,
            timestamp: new Date().toISOString(), // Replace with block timestamp
          });
        }
      }
    }

    if (relistedEvents) {
      const pages = relistedEvents.pages as any[];
      for (const [pageIndex, page] of pages.entries()) {
        if (Array.isArray(page)) {
          for (const [eventIndex, event] of page.entries()) {
            const dataset_id = event.data[0];
            const owner = event.data[1];
            const price = event.data[2];
            activity.push({
              id: pageIndex * 20 + eventIndex,
              action: `Relisted dataset #${Number(event.data[0])} by ${
                event.data[1]
              } for ${Number(event.data[2])}`,
              timestamp: new Date().toISOString(), // Replace with block timestamp
            });
          }
        } else if (page && page.data) {
          // Handle case where page is a single event
          const dataset_id = page.data[0];
          const owner = page.data[1];
          const price = page.data[2];
          activity.push({
            id: pageIndex * 20,
            action: `Relisted dataset #${Number(page.data[0])} by ${
              page.data[1]
            } for ${Number(page.data[2])}`,
            timestamp: new Date().toISOString(), // Replace with block timestamp
          });
        }
      }
    }

    setRecentActivity(activity);
  }, [transferredEvents, relistedEvents]);

  if (transferredError || relistedError) {
    console.error(
      "Failed to fetch activity:",
      transferredError || relistedError
    );
  }

  useEffect(() => {
    if (profileRef.current) animatePageEnter(profileRef.current);
  }, [animatePageEnter]);

  const formatAddress = (addr: string) =>
    `${addr.slice(0, 8)}...${addr.slice(-6)}`;

  const copyAddress = () => address && navigator.clipboard.writeText(address);

  const generateAvatar = (addr: string) => {
    const hash = addr.slice(2, 8);
    const hue = parseInt(hash || "0", 16) % 360;
    return `hsl(${hue}, 50%, 50%)`;
  };

  const handleRelist = async (datasetId: string) => {
    if (!contract) return;
    try {
      let price;
      const newPrice = toU256(price); // 1 STRK in wei (adjust as needed)

      const call = {
        contractAddress: AINEST_ADDRESS,
        entrypoint: "list_for_sale",
        calldata: [
          BigInt(datasetId),
          { low: newPrice.low, high: newPrice.high },
        ],
      };

      if (!call) {
        throw new Error("Failed to create contract call");
      }

      console.log("Contract call:", call);
      // 5) Send
      send([call]);

      setTimeout(() => toast({ title: "Dataset relisted!" }), 5000);
    } catch (err) {
      console.error(err);

      setTimeout(() => toast({ title: "failed to relist dataset" }), 5000);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Wallet className="h-16 w-16 text-muted-foreground mx-auto" />
          <h2 className="text-2xl font-semibold text-foreground">
            Connect Your Wallet
          </h2>
          <p className="text-muted-foreground">
            Please connect your wallet to view your profile
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={profileRef} className="min-h-screen p-6">
      <div className="container mx-auto max-w-6xl space-y-8">
        {/* Profile Header */}
        <div className="ainest-card">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            {/* Avatar */}
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl"
              style={{ backgroundColor: generateAvatar(address || "") }}
            >
              {address?.slice(2, 4).toUpperCase()}
            </div>

            {/* User Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  My Profile
                </h1>
                <div className="flex items-center space-x-2">
                  <code className="bg-muted px-3 py-1 rounded font-mono text-sm">
                    {formatAddress(address || "")}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyAddress}
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="h-6 w-6 p-0"
                  >
                    <a
                      href={`https://starkscan.co/contract/${address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Upload className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Uploads:
                  </span>
                  <Badge variant="secondary">{totalUploads}</Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Currently Own:
                  </span>
                  <Badge variant="secondary">{totalOwnedNow}</Badge>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              <Button
                onClick={() => setUploadModalOpen(true)}
                className="ainest-btn-primary flex items-center space-x-2"
              >
                <Upload className="h-4 w-4" />
                <span>Upload Dataset</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-6 border-b pb-2">
          <button
            onClick={() => setActiveTab("onSale")}
            className={activeTab === "onSale" ? "font-bold" : ""}
          >
            On Sale
          </button>
          <button
            onClick={() => setActiveTab("purchased")}
            className={activeTab === "purchased" ? "font-bold" : ""}
          >
            Purchased
          </button>
          <button
            onClick={() => setActiveTab("sold")}
            className={activeTab === "sold" ? "font-bold" : ""}
          >
            Sold
          </button>
          <button
            onClick={() => setActiveTab("activity")}
            className={activeTab === "activity" ? "font-bold" : ""}
          >
            Recent Activity
          </button>
        </div>

        {/* Sections */}
        {activeTab === "onSale" && (
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">On Sale</h2>
            {myOnSale.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myOnSale.map((dataset) => (
                  <div key={dataset.id.toString()} className="space-y-2">
                    <DatasetCard dataset={dataset} onView={() => {}} />
                    <Button
                      size="sm"
                      onClick={() => handleRelist(dataset.id.toString())}
                    >
                      Re-list
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p>No active listings</p>
            )}
          </section>
        )}

        {activeTab === "purchased" && (
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">
              Purchased
            </h2>
            {myPurchased.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myPurchased.map((dataset) => (
                  <DatasetCard
                    key={dataset.id.toString()}
                    dataset={dataset}
                    onView={() => {}}
                  />
                ))}
              </div>
            ) : (
              <p>No purchases yet</p>
            )}
          </section>
        )}

        {activeTab === "sold" && (
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">Sold</h2>
            {mySold.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mySold.map((dataset) => (
                  <DatasetCard key={dataset.id.toString()} dataset={dataset} />
                ))}
              </div>
            ) : (
              <p>No sold datasets</p>
            )}
          </section>
        )}

        {activeTab === "activity" && (
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
              <History className="h-5 w-5" /> Recent Activity
            </h2>
            <ul className="space-y-2">
              {recentActivity.map((a) => (
                <li key={a.id} className="flex justify-between border-b pb-2">
                  <span>{a.action}</span>
                  <span className="text-muted-foreground text-sm">
                    {a.timestamp}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
};
