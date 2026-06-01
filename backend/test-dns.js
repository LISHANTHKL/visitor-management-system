import dns from "dns";

dns.resolveSrv(
  "_mongodb._tcp.visitor-management-clus.ggqval7.mongodb.net",
  (err, records) => {
    console.log("ERROR:", err);
    console.log("RECORDS:", records);
  }
);