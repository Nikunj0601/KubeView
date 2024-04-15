export default () => ({
  port: process.env.PORT || 8080,
  github: {
    client_id: process.env.GITHUB_OAUTH_CLIENT_ID,
    client_secret: process.env.GITHUB_OAUTH_SECRET,
    callback_url: process.env.GITHUB_OAUTH_CALLBACK_URL,
  },
  database: {
    path: process.env.SQLITE_DATABASE_PATH,
  },
  jwt: {
    secret: process.env.JWT_SECRET_KEY,
  },
});
