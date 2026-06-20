import React, { useState, useEffect } from "react";
import Button from "../../../components/ui/Button/Button";
import Input from "../../../components/ui/Input/Input";
import Modal from "../../../components/ui/Modal/Modal";
import { getGithubInfo, type GithubInfo } from "../../../api/repositories";
import {
  attachGithubResource,
  removeGithubAttachment,
  getGithubAttachments,
  type GithubAttachment,
} from "../../../api/tasks";

interface Props {
  boardId: string;
  cardId: string;
  taskId: string;
  isOwner: boolean;
}

export default function GithubAttachments({ boardId, cardId, taskId, isOwner }: Props) {
  const [attachments, setAttachments] = useState<GithubAttachment[]>([]);
  const [repoInput, setRepoInput] = useState("");
  const [githubInfo, setGithubInfo] = useState<GithubInfo | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    fetchAttachments();
  }, [taskId]);

  const fetchAttachments = async () => {
    try {
      const data = await getGithubAttachments(boardId, cardId, taskId);
      setAttachments(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoInput.includes("/")) {
      setError("Please enter repository as owner/repo");
      return;
    }
    const [owner, repo] = repoInput.split("/");
    setIsSearching(true);
    setError(null);
    try {
      const info = await getGithubInfo(owner, repo);
      setGithubInfo(info);
    } catch (err: any) {
      setError(err.message || "Failed to fetch repository info");
      setGithubInfo(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAttach = async (type: "pull_request" | "commit" | "issue", number?: string, sha?: string) => {
    try {
      await attachGithubResource(boardId, cardId, taskId, type, number, sha);
      await fetchAttachments();
      setGithubInfo(null);
      setShowSearch(false);
      setRepoInput("");
    } catch (err: any) {
      alert(err.message || "Failed to attach resource");
    }
  };

  const handleRemove = async (attachmentId: string) => {
    try {
      await removeGithubAttachment(boardId, cardId, taskId, attachmentId);
      await fetchAttachments();
    } catch (err: any) {
      alert(err.message || "Failed to remove attachment");
    }
  };

  return (
    <div className="mb-4">
      <div className="mb-3">
        <div className="d-flex align-items-center gap-2 mb-2">
          <i className="bi bi-github text-secondary modal-header-icon"></i>
          <h6 className="m-0 fw-bold text-white">GitHub</h6>
        </div>
        {isOwner && (
          <Button variant="secondary" size="sm" fullWidth onClick={() => setShowSearch(true)}>
            Add Resource
          </Button>
        )}
      </div>

      <Modal isOpen={showSearch} onClose={() => { setShowSearch(false); setGithubInfo(null); }} title="Add GitHub Resource">
        <div>
          <form onSubmit={handleSearch} className="d-flex gap-2 mb-3">
            <Input
              value={repoInput}
              onChange={(e) => setRepoInput(e.target.value)}
              placeholder="owner/repo (e.g. facebook/react)"
              className="form-control-sm"
              containerClassName="flex-grow-1"
            />
            <Button type="submit" size="sm" disabled={isSearching} className="fw-bold px-3">
              {isSearching ? "Searching..." : "Search"}
            </Button>
          </form>
          {error && <div className="text-danger small mb-2">{error}</div>}

          {githubInfo && (
            <div className="github-info-results pe-2" style={{ maxHeight: "350px", overflowY: "auto" }}>
              <div className="small fw-bold text-secondary mb-2 mt-1">Pull Requests</div>
              {githubInfo.pulls.length === 0 && <div className="small text-white-50">No PRs found</div>}
              {githubInfo.pulls.map(pr => (
                <div key={`pr-${pr.pullNumber}`} className="d-flex justify-content-between align-items-center mb-2 text-white small border-bottom border-secondary pb-1">
                  <span className="text-truncate me-2">#{pr.pullNumber} {pr.title}</span>
                  <Button variant="primary" size="sm" className="py-0 px-2" style={{ fontSize: '12px' }} onClick={() => handleAttach("pull_request", pr.pullNumber)}>Attach</Button>
                </div>
              ))}
              
              <div className="small fw-bold text-secondary mt-3 mb-2">Issues</div>
              {githubInfo.issues.length === 0 && <div className="small text-white-50">No Issues found</div>}
              {githubInfo.issues.map(issue => (
                <div key={`issue-${issue.issueNumber}`} className="d-flex justify-content-between align-items-center mb-2 text-white small border-bottom border-secondary pb-1">
                  <span className="text-truncate me-2">#{issue.issueNumber} {issue.title}</span>
                  <Button variant="primary" size="sm" className="py-0 px-2" style={{ fontSize: '12px' }} onClick={() => handleAttach("issue", issue.issueNumber)}>Attach</Button>
                </div>
              ))}

              <div className="small fw-bold text-secondary mt-3 mb-2">Commits</div>
              {githubInfo.commits.length === 0 && <div className="small text-white-50">No Commits found</div>}
              {githubInfo.commits.map(commit => (
                <div key={`commit-${commit.sha}`} className="d-flex justify-content-between align-items-center mb-2 text-white small border-bottom border-secondary pb-1">
                  <span className="text-truncate me-2">{commit.sha.substring(0,7)} {commit.message}</span>
                  <Button variant="primary" size="sm" className="py-0 px-2" style={{ fontSize: '12px' }} onClick={() => handleAttach("commit", undefined, commit.sha)}>Attach</Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {attachments.length > 0 ? (
        <div className="d-flex flex-column gap-2">
          {attachments.map(att => (
            <div key={att._id || att.attachmentId} className="d-flex align-items-center justify-content-between bg-dark p-2 rounded border border-secondary">
              <div className="d-flex align-items-center gap-2 text-white small">
                {att.type === "pull_request" && <i className="bi bi-git text-success"></i>}
                {att.type === "issue" && <i className="bi bi-record-circle text-danger"></i>}
                {att.type === "commit" && <i className="bi bi-code-commit text-info"></i>}
                <span className="text-capitalize fw-bold">{att.type.replace("_", " ")}</span>
                <span>{att.number ? `#${att.number}` : att.sha?.substring(0, 7)}</span>
              </div>
              {isOwner && (
                <Button variant="ghost" size="sm" className="text-danger p-1 border-0" onClick={() => handleRemove(att._id || att.attachmentId!)}>
                  <i className="bi bi-trash"></i>
                </Button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-white-50 small">No GitHub resources attached.</div>
      )}
    </div>
  );
}
