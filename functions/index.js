const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const axios = require("axios");

admin.initializeApp();
const db = admin.firestore();

exports.getGithubInfo = onCall({ cors: true }, async (request) => {
  // Authentication / user information is automatically added to the request.
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "The function must be called while authenticated.",
    );
  }

  const { owner, repo } = request.data;
  if (!owner || !repo) {
    throw new HttpsError(
      "invalid-argument",
      "The function must be called with owner and repo.",
    );
  }

  const uid = request.auth.uid;
  
  // We need to fetch the user from our 'users' collection to get their githubAccessToken
  const userDoc = await db.collection("users").doc(uid).get();

  if (!userDoc.exists) {
    throw new HttpsError("not-found", "User not found in database.");
  }

  const user = userDoc.data();
  if (!user.githubAccessToken) {
    throw new HttpsError(
      "permission-denied",
      "User is not authenticated with GitHub",
    );
  }

  const githubToken = user.githubAccessToken;
  const repositoryId = `${owner}/${repo}`;
  const headers = {
    Authorization: `Bearer ${githubToken}`,
    Accept: "application/vnd.github.v3+json",
  };

  const baseUrl = `https://api.github.com/repos/${repositoryId}`;

  try {
    const [branchesRes, pullsRes, issuesRes, commitsRes] = await Promise.all([
      axios
        .get(`${baseUrl}/branches`, { headers })
        .catch((e) => {
          console.error("Branches error:", e.response?.data || e.message);
          return { data: [] };
        }),
      axios
        .get(`${baseUrl}/pulls?state=all`, { headers })
        .catch((e) => {
          console.error("Pulls error:", e.response?.data || e.message);
          return { data: [] };
        }),
      axios
        .get(`${baseUrl}/issues?state=all`, { headers })
        .catch((e) => {
          console.error("Issues error:", e.response?.data || e.message);
          return { data: [] };
        }),
      axios
        .get(`${baseUrl}/commits`, { headers })
        .catch((e) => {
          console.error("Commits error:", e.response?.data || e.message);
          return { data: [] };
        }),
    ]);

    // GitHub's issues API returns PRs as well. Filter them out.
    const issuesOnly = issuesRes.data.filter((issue) => !issue.pull_request);

    return {
      repositoryId,
      branches: branchesRes.data.map((b) => ({
        name: b.name,
        lastCommitSha: b.commit.sha,
      })),
      pulls: pullsRes.data.map((p) => ({
        title: p.title,
        pullNumber: String(p.number),
      })),
      issues: issuesOnly.map((i) => ({
        title: i.title,
        issueNumber: String(i.number),
      })),
      commits: commitsRes.data.map((c) => ({
        sha: c.sha,
        message: c.commit.message,
      })),
    };
  } catch (err) {
    console.error("Failed to fetch repository info:", err);
    throw new HttpsError(
      "internal",
      "Internal server error while fetching GitHub info",
    );
  }
});
