/**
 * MongoDB Connection & Config Manager
 * Stores connection URI and credentials helper for IP Docket Guard.
 */

export const MONGODB_CONFIG = {
  uri: process.env.MONGODB_URI || "mongodb+srv://<db_username>:<db_password>@cluster0.8uu2r1h.mongodb.net/?appName=Cluster0",
  cluster: "Cluster0",
  host: "cluster0.8uu2r1h.mongodb.net",
  dbName: "ip_docket_guard",
};

export const getFormattedMongoUri = (username?: string, password?: string): string => {
  if (username && password) {
    return MONGODB_CONFIG.uri
      .replace('<db_username>', encodeURIComponent(username))
      .replace('<db_password>', encodeURIComponent(password));
  }
  return MONGODB_CONFIG.uri;
};
