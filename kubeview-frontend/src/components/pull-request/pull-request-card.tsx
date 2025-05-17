import React from "react";
import { Badge } from "../ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";
import { GithubPullRequest } from "../../models/github";
import { formatDistanceToNow } from "date-fns";
import { useNavigate, useParams } from "react-router-dom";

interface PullRequestCardProps {
  pullRequest: GithubPullRequest;
}

export const PullRequestCard: React.FC<PullRequestCardProps> = ({
  pullRequest,
}) => {
  const { title, number, html_url, user, created_at, status } = pullRequest;
  const { owner, name } = useParams<{ owner: string; name: string }>();
  const navigate = useNavigate();

  const statusColors = {
    open: "bg-green-500",
    closed: "bg-red-500",
    merged: "bg-purple-500",
  };

  const handleClick = () => {
    navigate(`/repos/${owner}/${name}/pull/${number}`, {
      state: { pullRequest },
    });
  };

  return (
    <div
      className="flex items-start p-4 border rounded-lg hover:bg-gray-50 group cursor-pointer"
      onClick={handleClick}
    >
      <Avatar className="h-10 w-10 mr-4">
        <AvatarImage src={user.avatar_url} alt={user.login} />
        <AvatarFallback>{user.login[0].toUpperCase()}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate pr-4 group-hover:text-blue-600">
              {title}
            </h3>
            <div className="mt-1 text-sm text-gray-500 flex items-center space-x-2">
              <span>#{number}</span>
              <span>•</span>
              <span>
                opened {formatDistanceToNow(new Date(created_at))} ago by{" "}
                {user.login}
              </span>
            </div>
          </div>
          <Badge
            variant="outline"
            className={`ml-4 capitalize ${
              statusColors[status as keyof typeof statusColors] || "bg-gray-500"
            } text-white`}
          >
            {status}
          </Badge>
        </div>
      </div>
    </div>
  );
};
