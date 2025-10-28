// api/ttdl.js
export default async function handler(req, res) {
  // allow simple CORS so index.html di domain sama bisa fetch
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const url = (req.query && req.query.url) || (req.url && new URL(req.url, `http://${req.headers.host}`).searchParams.get("url"));

  if (!url) {
    return res.status(400).json({ status: false, msg: "Missing url param" });
  }

  try {
    // proxy ke dlz.my.id (sumber yang kamu pake sebelumnya)
    const upstream = `https://api.dlz.my.id/api/ttdl?url=${encodeURIComponent(url)}`;

    const upstreamRes = await fetch(upstream, {
      headers: {
        accept: "application/json, text/plain, */*",
        // optionally spoof user-agent if needed:
        "user-agent": req.headers["user-agent"] || "Mozilla/5.0"
      }
    });

    const data = await upstreamRes.json();

    if (!data || !data.status) {
      return res.status(400).json({ status: false, msg: "Upstream returned error", upstream: data });
    }

    // return hanya data penting
    const result = {
      author: data.result.author,
      video: data.result.video,
      stats: data.result.stats
    };

    return res.status(200).json({ status: true, creator: "Dezz API (proxy)", result });
  } catch (err) {
    console.error("api/ttdl error:", err);
    return res.status(500).json({ status: false, msg: "Server error", error: String(err) });
  }
                                               }
