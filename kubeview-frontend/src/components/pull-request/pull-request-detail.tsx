import React, { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { ArrowLeft, GitBranch, GitMerge } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { formatDistanceToNow } from "date-fns";
import { KubernetesFilesModal } from "../modals/kubernetes-files-modal";
import { useGithubPullRequest } from "../../hooks/useGithub";
import { GithubPullRequest } from "../../models/github";
import { useKubeEnvironment } from "../../hooks/useEnvironment";

// Dummy data interface
interface PreviewEnvironment {
  status: "running" | "pending" | "failed" | null;
  url?: string;
  logs?: string[];
}

export const PullRequestDetail: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { owner, name, number } = useParams<{
    owner: string;
    name: string;
    number: string;
  }>();

  const { state } = useLocation();

  const initialPullRequest = state?.pullRequest as GithubPullRequest;

  const {
    data: pullRequest,
    isLoading: isPullRequestLoading,
    isError: isPullRequestError,
  } = useGithubPullRequest(
    owner!,
    name!,
    parseInt(number || "0"),
    initialPullRequest
  );

  const { data: previewEnv, isLoading: isEnvironmentLoading } =
    useKubeEnvironment(owner!, name!, parseInt(number || "0"));

  console.log(previewEnv);
  if (isPullRequestLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-gray-500">Loading Pull Request...</div>
      </div>
    );
  }

  if (isPullRequestError || !pullRequest) {
    console.log(pullRequest);

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-500">
          Error loading Pull Request. Please try again.
        </div>
      </div>
    );
  }

  const statusColors = {
    open: "bg-green-500",
    closed: "bg-red-500",
    merged: "bg-purple-500",
  };

  const handleCreatePreview = (files: string[]) => {
    console.log("Creating preview environment with files:", files);
    // TODO: Implement preview environment creation
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        to={`/repos/${owner}/${name}`}
        className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to pull requests
      </Link>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={pullRequest.user.avatar_url}
                alt={pullRequest.user.login}
              />
              <AvatarFallback>
                {pullRequest.user.login[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{pullRequest.title}</h1>
              <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                <span>#{pullRequest.number}</span>
                <span>•</span>
                <span>
                  {pullRequest.user.login} opened{" "}
                  {formatDistanceToNow(new Date(pullRequest.created_at))} ago
                </span>
              </div>
            </div>
          </div>
          <Badge
            variant="outline"
            className={`capitalize ${
              statusColors[pullRequest.status as keyof typeof statusColors] ||
              "bg-gray-500"
            } text-white px-3 py-1`}
          >
            {pullRequest.status}
          </Badge>
        </div>

        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-6">
          <div className="flex items-center">
            <GitBranch className="w-4 h-4 mr-2" />
            <span>{pullRequest.fromBranch}</span>
          </div>
          <GitMerge className="w-4 h-4" />
          <div className="flex items-center">
            <span>{pullRequest.toBranch}</span>
          </div>
        </div>

        <div className="prose max-w-none mb-8">
          <p>{pullRequest.description || "No description provided."}</p>
        </div>
        <h3 className="text-lg font-semibold mb-4">Preview Environment</h3>
        <Tabs defaultValue="overview" className="w-full">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
            </TabsList>

            {(previewEnv?.pods.length || previewEnv?.services.length) && (
              <Button onClick={() => setIsModalOpen(true)}>
                Create Preview Environment
              </Button>
            )}
          </div>
          <TabsContent value="overview" className="mt-6">
            <div className="bg-gray-50 rounded-lg p-6">
              {previewEnv?.pods.length || previewEnv?.services.length ? (
                <div className="bg-gray-50 rounded-lg p-3">
                  <h3 className="text-lg font-semibold mb-4">Pods</h3>
                  {previewEnv?.pods?.length ? (
                    previewEnv.pods.map((pod) => (
                      <div
                        key={pod.name}
                        className="mb-4 p-4 bg-white shadow rounded-lg"
                      >
                        <p className="text-sm font-medium">{pod.name}</p>
                        <p className="text-sm text-gray-500">
                          Status: {pod.phase}
                        </p>
                        <p className="text-sm text-gray-500">
                          Created At: {new Date(pod.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No pods available.</p>
                  )}

                  <h3 className="text-lg font-semibold mt-6 mb-4">Services</h3>
                  {previewEnv?.services?.length ? (
                    previewEnv.services.map((service) => (
                      <div
                        key={service.name}
                        className="mb-4 p-4 bg-white shadow rounded-lg"
                      >
                        <p className="text-sm font-medium">{service.name}</p>
                        <p className="text-sm text-gray-500">
                          IP: {service.ip}
                        </p>
                        <p className="text-sm text-gray-500">
                          Port: {service.port}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No services available.</p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">
                    No preview environment available for this pull request.
                  </p>
                  <Button onClick={() => setIsModalOpen(true)}>
                    Create Preview Environment
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="logs" className="mt-6">
            <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-gray-300">
              {previewEnv?.logs ? (
                <pre className="whitespace-pre-wrap">
                  {previewEnv?.logs?.join("\n")}
                </pre>
              ) : (
                <p className="text-center py-4">No logs available.</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <KubernetesFilesModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreatePreview}
      />
    </div>
  );
};
