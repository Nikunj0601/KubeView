let host = "";

try {
  if (process.env.REACT_APP_API_URL) {
    host = new URL(process.env.REACT_APP_API_URL).origin;
  }
} catch (e) {
  console.log({ host });
}

export default {
  API_URL: `${host}`,
  ENV: "development",
  bearerTokenKey: "token",
};
