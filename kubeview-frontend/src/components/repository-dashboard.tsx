import React, { useState } from "react";
import { useGithubRepos } from "../hooks/useGithub";
import { RepositoryCard } from "./repository-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Search, Grid, List } from "lucide-react";
import { useAuth } from "./context/authProvider";
import { GithubRepo } from "@/models/github";

export const RepositoryDashboard: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: repos, isLoading } = useGithubRepos();

  const filteredRepos = repos?.filter((repo) =>
    repo.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Repository Dashboard</h1>
        <Button variant="outline">New Repository</Button>
      </div>

      <div className="mb-8">
        <Tabs defaultValue="all">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="public">Public</TabsTrigger>
              <TabsTrigger value="private">Private</TabsTrigger>
            </TabsList>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Find a repository..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-[300px]"
                />
              </div>
              <div className="flex border rounded-md">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className={viewMode === "grid" ? "bg-gray-100" : ""}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className={viewMode === "list" ? "bg-gray-100" : ""}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <TabsContent value="all">
            {isLoading ? (
              <div className="text-center py-8">Loading repositories...</div>
            ) : (
              <div
                className={`grid ${
                  viewMode === "grid" ? "grid-cols-3" : "grid-cols-1"
                } gap-4`}
              >
                {filteredRepos?.map((repo) => (
                  <RepositoryCard
                    key={repo.id}
                    repo={repo}
                    isPrivate={repo.isPrivate}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="public">
            <div
              className={`grid ${
                viewMode === "grid" ? "grid-cols-3" : "grid-cols-1"
              } gap-4`}
            >
              {filteredRepos
                ?.filter((repo) => !repo.isPrivate)
                .map((repo) => (
                  <RepositoryCard key={repo.id} repo={repo} />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="private">
            <div
              className={`grid ${
                viewMode === "grid" ? "grid-cols-3" : "grid-cols-1"
              } gap-4`}
            >
              {filteredRepos
                ?.filter((repo) => repo.isPrivate)
                .map((repo) => (
                  <RepositoryCard key={repo.id} repo={repo} isPrivate />
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
