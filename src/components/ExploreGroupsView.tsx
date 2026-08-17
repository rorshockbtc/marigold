"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Search, Plus, MapPin, Users, Info, Shield, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { FilterControl } from "@/components/ui/FilterControl";
import { useUser } from "@clerk/nextjs";

interface Group {
  id: string;
  name: string;
  description: string;
  jurisdiction: string;
  emoji: string;
  membersCount: number;
  unsplashQuery?: string;
  imageUrl?: string;
}

const DEFAULT_GROUPS: Group[] = [
  {
    id: "msfe",
    name: "Mississippi Fair Elections",
    description: "Auditing Hinds and Rankin county registration rolls. Verifying commercial P.O. Box matches and population flight discrepancies.",
    jurisdiction: "Mississippi (Statewide)",
    emoji: "🦅",
    membersCount: 3,
    unsplashQuery: "mississippi landscape"
  },
  {
    id: "acme-sandbox",
    name: "ACME Civic Data Sandbox",
    description: "A testing ground for new algorithmic chunking models and Nivo chart testing.",
    jurisdiction: "Global (Testing)",
    emoji: "🧪",
    membersCount: 1,
    unsplashQuery: "technology lab"
  }
];

function GroupCard({ group, onClick }: { group: Group, onClick: () => void }) {
  const [unsplashData, setUnsplashData] = useState<{
    url: string;
    photographerName: string;
    photographerUrl: string;
    downloadLocation: string;
  } | null>(null);

  useEffect(() => {
    if (group.imageUrl) {
      setUnsplashData({
        url: group.imageUrl,
        photographerName: 'Unknown',
        photographerUrl: '#',
        downloadLocation: ''
      });
      return;
    }

    if (group.unsplashQuery) {
      fetch(`/api/unsplash?query=${encodeURIComponent(group.unsplashQuery)}`)
        .then(res => res.json())
        .then(data => {
          if (data.url) {
            setUnsplashData(data);
            if (data.downloadLocation) {
              fetch('/api/unsplash/download', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ downloadLocation: data.downloadLocation })
              }).catch(() => {});
            }
          }
        })
        .catch(() => {});
    }
  }, [group.unsplashQuery, group.imageUrl]);

  return (
    <Card className="hover:shadow-lg transition-all hover:border-[#D96B27]/40 cursor-pointer flex flex-col h-full overflow-hidden" onClick={onClick}>
      <div 
        className="h-32 w-full bg-slate-200 relative overflow-hidden group/image"
        style={{
          backgroundImage: unsplashData ? `url(${unsplashData.url})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
        
        {/* Unsplash Attribution */}
        {unsplashData?.photographerName && unsplashData.photographerName !== 'Unknown' && (
          <div className="absolute top-2 right-2 opacity-0 group-hover/image:opacity-100 transition-opacity bg-black/50 backdrop-blur-sm text-[10px] text-white px-2 py-0.5 rounded-full pointer-events-auto">
            Photo by <a href={unsplashData.photographerUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-300" onClick={e => e.stopPropagation()}>{unsplashData.photographerName}</a> on <a href="https://unsplash.com/?utm_source=marigold_insights&utm_medium=referral" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-300" onClick={e => e.stopPropagation()}>Unsplash</a>
          </div>
        )}

        <div className="absolute bottom-3 left-4 right-4 flex justify-between items-end pointer-events-none">
          <span className="text-4xl bg-white w-14 h-14 rounded-xl flex items-center justify-center border border-slate-100 shadow-md transform translate-y-2">{group.emoji}</span>
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-sm">
            <Users className="w-3.5 h-3.5" />
            {group.membersCount}
          </div>
        </div>
      </div>
      
      <CardContent className="p-5 pt-6 flex-1 flex flex-col bg-white">
        <h3 className="text-lg font-bold text-slate-900 mb-1 leading-tight mt-2">{group.name}</h3>
        <div className="flex items-center gap-1.5 text-xs text-[#D96B27] font-semibold mb-3">
          <MapPin className="w-3.5 h-3.5" />
          {group.jurisdiction}
        </div>
        <p className="text-sm text-slate-600 line-clamp-3 mb-6 flex-1 leading-relaxed">
          {group.description}
        </p>
        <div className="mt-auto">
          <Button variant="outline" className="w-full font-bold text-slate-700 bg-slate-50 border-slate-200">
            View Details & Apply
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ExploreGroupsView() {
  const { user } = useUser();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("alphabetical");
  const [groups, setGroups] = useState<Group[]>(DEFAULT_GROUPS);
  
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [showApplySheet, setShowApplySheet] = useState(false);
  const [applyNote, setApplyNote] = useState("");
  const [applyStatus, setApplyStatus] = useState<"idle" | "submitting" | "success">("idle");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");
  const [newGroupEmoji, setNewGroupEmoji] = useState("📊");
  const [newGroupJurisdiction, setNewGroupJurisdiction] = useState("");
  const [newGroupImageQuery, setNewGroupImageQuery] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("marigold_custom_groups");
    if (saved) {
      try {
        const customGroups = JSON.parse(saved);
        setGroups([...DEFAULT_GROUPS, ...customGroups]);
      } catch (e) {}
    }
  }, []);

  const filteredGroups = groups
    .filter(g => g.name.toLowerCase().includes(search.toLowerCase()) || g.jurisdiction.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === "alphabetical") return a.name.localeCompare(b.name);
      if (sort === "members") return b.membersCount - a.membersCount;
      return 0;
    });

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup) return;
    setApplyStatus("submitting");
    setTimeout(() => {
      setApplyStatus("success");
      setTimeout(() => {
        setShowApplySheet(false);
        setApplyStatus("idle");
        setApplyNote("");
      }, 2000);
    }, 800);
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    const newGroup: Group = {
      id: `grp-${Date.now()}`,
      name: newGroupName,
      description: newGroupDesc,
      jurisdiction: newGroupJurisdiction,
      emoji: newGroupEmoji,
      membersCount: 1,
      unsplashQuery: newGroupImageQuery || newGroupJurisdiction || "community"
    };

    const updatedGroups = [...groups, newGroup];
    setGroups(updatedGroups);

    const customOnly = updatedGroups.filter(g => !DEFAULT_GROUPS.find(d => d.id === g.id));
    localStorage.setItem("marigold_custom_groups", JSON.stringify(customOnly));

    fetch("/api/user/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "join", groupName: newGroup.name })
    }).catch(console.error);

    const localJoined = localStorage.getItem("marigold_joined_groups");
    let joined = [];
    if (localJoined) try { joined = JSON.parse(localJoined); } catch (e) {}
    joined.push(newGroup.name);
    localStorage.setItem("marigold_joined_groups", JSON.stringify(joined));

    localStorage.setItem("marigold_active_group", newGroup.name);
    window.dispatchEvent(new CustomEvent('marigold-group-change', { detail: { group: newGroup.name } }));

    setShowCreateModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 pb-24 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-900">Explore Groups</h1>
          <p className="text-slate-600 mt-1">Discover local civic auditing chapters and request access to their shared data pools.</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} variant="primary" className="shadow-md">
          <Plus className="w-4 h-4 mr-2" />
          Create New Group
        </Button>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-8 flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input 
            placeholder="Search groups by name or jurisdiction..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 border-slate-300 w-full"
          />
        </div>
        <div className="w-full sm:w-48">
          <FilterControl
            label=""
            value={sort}
            onChange={setSort}
            options={[
              { value: "alphabetical", label: "Alphabetical" },
              { value: "members", label: "Most Members" }
            ]}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGroups.map(group => (
          <GroupCard key={group.id} group={group} onClick={() => {
            setSelectedGroup(group);
            setShowApplySheet(true);
          }} />
        ))}
      </div>

      {filteredGroups.length === 0 && (
        <div className="text-center py-20">
          <div className="text-4xl mb-4">🕵️</div>
          <h3 className="text-xl font-bold text-slate-800">No groups found</h3>
          <p className="text-slate-500 max-w-md mx-auto mt-2">We couldn't find any groups matching your search criteria. Try a different term or create your own group!</p>
        </div>
      )}

      {/* Apply to Join Side Sheet */}
      {showApplySheet && selectedGroup && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-[#FAF8F5]">
              <h2 className="text-xl font-serif font-bold text-slate-900">Join Group</h2>
              <button onClick={() => setShowApplySheet(false)} className="text-slate-400 hover:text-slate-700 text-xl font-bold p-2">✕</button>
            </div>
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="text-6xl text-center mb-4">{selectedGroup.emoji}</div>
              <h3 className="text-2xl font-bold text-center text-slate-900 mb-2">{selectedGroup.name}</h3>
              <div className="flex justify-center items-center gap-2 text-sm text-[#D96B27] font-semibold mb-6">
                <MapPin className="w-4 h-4" /> {selectedGroup.jurisdiction}
              </div>
              
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-8">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-2"><Info className="w-4 h-4" /> About the Group</h4>
                <p className="text-sm text-slate-700 leading-relaxed">{selectedGroup.description}</p>
              </div>

              <form onSubmit={handleApply} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Message to Administrators</label>
                  <p className="text-xs text-slate-500 mb-2">Explain who you are and why you want to access this group's shared data.</p>
                  <textarea 
                    className="w-full min-h-[120px] p-3 text-sm rounded-xl border border-slate-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    placeholder="Hi, I am volunteering to audit the cross-county anomalies..."
                    value={applyNote}
                    onChange={(e) => setApplyNote(e.target.value)}
                    required
                  />
                </div>
                
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex gap-3 text-amber-800 text-xs">
                  <Shield className="w-5 h-5 shrink-0 text-amber-600" />
                  <p>Your application will be sent securely to the group's administrators for review.</p>
                </div>

                <div className="pt-4">
                  <Button type="submit" variant="primary" className="w-full py-6 text-lg shadow-lg relative overflow-hidden" disabled={applyStatus !== "idle"}>
                    {applyStatus === "idle" && "Submit Application"}
                    {applyStatus === "submitting" && "Sending securely..."}
                    {applyStatus === "success" && (
                      <span className="flex items-center gap-2"><Check className="w-5 h-5" /> Application Sent</span>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-[#FAF8F5]">
              <h2 className="text-xl font-serif font-bold text-slate-900">Create New Group</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-700 text-xl font-bold p-2">✕</button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="create-group-form" onSubmit={handleCreateGroup} className="space-y-5">
                <div className="flex gap-4">
                  <div className="w-20">
                    <Input 
                      label="Emoji"
                      value={newGroupEmoji}
                      onChange={(e) => setNewGroupEmoji(e.target.value)}
                      maxLength={2}
                      className="text-center text-2xl h-12"
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <Input 
                      label="Group Name"
                      placeholder="e.g. Nevada Election Review"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      className="h-12 font-bold"
                      required
                    />
                  </div>
                </div>

                <Input 
                  label="Jurisdiction / Location"
                  placeholder="e.g. Clark County, NV"
                  value={newGroupJurisdiction}
                  onChange={(e) => setNewGroupJurisdiction(e.target.value)}
                  required
                />
                
                <Input 
                  label="Unsplash Image Search Term"
                  placeholder="e.g. las vegas landscape (Optional)"
                  value={newGroupImageQuery}
                  onChange={(e) => setNewGroupImageQuery(e.target.value)}
                />

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Group Mission / Description</label>
                  <textarea 
                    className="w-full min-h-[100px] p-3 text-sm rounded-xl border border-slate-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    placeholder="Briefly describe the focus of this auditing group..."
                    value={newGroupDesc}
                    onChange={(e) => setNewGroupDesc(e.target.value)}
                    required
                  />
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
              <Button type="button" onClick={() => setShowCreateModal(false)} variant="secondary">Cancel</Button>
              <Button type="submit" form="create-group-form" variant="primary">Create & Join Group</Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
