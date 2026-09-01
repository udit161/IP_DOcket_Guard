/**
 * MongoDB Connection & Config Manager
 * Configured with MongoDB Atlas credentials for IP Docket Guard.
 */

export const MONGODB_CONFIG = {
  uri: process.env.MONGODB_URI || "mongodb+srv://Udit%20kumar:%40Udit7613@cluster0.8uu2r1h.mongodb.net/?appName=Cluster0",
  cluster: "Cluster0",
  host: "cluster0.8uu2r1h.mongodb.net",
  dbName: "ip_docket_guard",
};

export const getFormattedMongoUri = (): string => {
  return MONGODB_CONFIG.uri;
};
