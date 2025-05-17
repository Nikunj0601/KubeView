import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { Star, GitFork } from "lucide-react";
import { GithubRepo } from "../models/github";

interface RepositoryCardProps {
  repo: GithubRepo;
  isPrivate?: boolean;
}

export const RepositoryCard: React.FC<RepositoryCardProps> = ({
  repo,
  isPrivate,
}) => {
  const navigate = useNavigate();
  const handleClick = () => {
    // Extract owner from full_name (format: "owner/repo")
    const owner = repo.full_name?.split("/")[0];
    navigate(`/repos/${owner}/${repo.name}`, { state: { repo } });
  };

  return (
    <Card
      className="hover:border-gray-400 transition-colors cursor-pointer"
      onClick={handleClick}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-blue-600 hover:underline">
            {repo.name}
          </h3>
          {isPrivate && <Badge variant="secondary">Private</Badge>}
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {repo.description || "No description provided"}
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center">
            <Star className="w-4 h-4 mr-1" />
            <span>{repo.stars || 0}</span>
          </div>
          <div className="flex items-center">
            <GitFork className="w-4 h-4 mr-1" />
            <span>{repo.forks || 0}</span>
          </div>
          <div className="flex-1 text-right">
            <span className="text-xs text-gray-500">
              Updated{" "}
              {repo.updatedAt
                ? new Date(repo.updatedAt).toLocaleDateString()
                : "recently"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
