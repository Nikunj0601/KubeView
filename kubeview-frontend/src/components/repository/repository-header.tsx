import React from "react";
import { Link } from "react-router-dom";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { ArrowLeft, GitFork, Star } from "lucide-react";
import { GithubRepo } from "../../models/github";
import { formatDistanceToNow } from "date-fns";

interface RepositoryHeaderProps {
  repo: GithubRepo;
}

export const RepositoryHeader: React.FC<RepositoryHeaderProps> = ({ repo }) => {
  return (
    <div className="mb-8">
      <Link
        to="/dashboard"
        className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to repositories
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            {repo.name}
            {repo.isPrivate && (
              <Badge variant="secondary" className="ml-3">
                Private
              </Badge>
            )}
          </h1>
          <p className="text-gray-600 mt-2">{repo.description}</p>
        </div>

        <div className="flex gap-4">
          <Button variant="outline" className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            Star
            <span className="ml-1">{repo.stars || 0}</span>
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <GitFork className="w-4 h-4" />
            Fork
            <span className="ml-1">{repo.forks || 0}</span>
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-6 mt-6 text-sm text-gray-600">
        <div className="flex items-center">
          <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
          TypeScript
        </div>
        <div>
          Updated {formatDistanceToNow(new Date(repo.updatedAt || Date.now()))}{" "}
          ago
        </div>
        {repo.license && <div>License: {repo.license}</div>}
      </div>
    </div>
  );
};
