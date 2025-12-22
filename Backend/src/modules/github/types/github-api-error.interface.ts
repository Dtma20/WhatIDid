interface GithubApiError extends Error {
  status: number;
}

export default GithubApiError;