import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Download, Loader2, Rocket, Copy, FileCode } from "lucide-react";

const Index = () => {
  const [sitemapUrl, setSitemapUrl] = useState("");
  const [extractedUrls, setExtractedUrls] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const extractUrlsFromSitemap = async () => {
    if (!sitemapUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a sitemap URL",
        variant: "destructive",
      });
      return;
    }

    try {
      new URL(sitemapUrl);
    } catch {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid sitemap URL",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        "https://llms-backend-1.onrender.com/extract-sitemap-urls",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url: sitemapUrl }),
        }
      );

      const result = await response.json();

      if (result.success && result.urls?.length > 0) {
        setExtractedUrls(result.urls.join("\n"));
        toast({
          title: "Sitemap Extracted!",
          description: `${result.count} URLs found.`,
        });
      } else {
        toast({
          title: "No URLs Found",
          description: "The sitemap did not return any URLs.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Sitemap extraction error:", error);
      toast({
        title: "Error",
        description: "Failed to extract sitemap URLs",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyUrlsToClipboard = async () => {
    if (!extractedUrls.trim()) {
      toast({
        title: "No URLs to copy",
        description: "Please extract URLs first",
        variant: "destructive",
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(extractedUrls);
      toast({
        title: "URLs copied!",
        description: "All URLs have been copied to your clipboard",
      });
    } catch (error) {
      console.error("Failed to copy URLs:", error);
      toast({
        title: "Copy failed",
        description: "Failed to copy URLs to clipboard",
        variant: "destructive",
      });
    }
  };

  const convertToXmlSitemap = () => {
    if (!extractedUrls.trim()) {
      toast({
        title: "No URLs to convert",
        description: "Please extract URLs first",
        variant: "destructive",
      });
      return;
    }

    const urls = extractedUrls.split("\n").filter((url) => url.trim());

    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${url.trim()}</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

    const blob = new Blob([xmlContent], {
      type: "application/xml;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", "sitemap.xml");
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "XML Sitemap created!",
      description: "Sitemap.xml file has been downloaded",
    });
  };

  const exportToCSV = () => {
    if (!extractedUrls.trim()) {
      toast({
        title: "No data to export",
        description: "Please extract URLs first",
        variant: "destructive",
      });
      return;
    }

    const urls = extractedUrls.split("\n").filter((url) => url.trim());
    const csvContent = ["URL\n", ...urls.map((url) => `"${url}"\n`)].join("");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", "sitemap-urls.csv");
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export successful!",
      description: "CSV file has been downloaded",
    });
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#FFB100] via-[#FFB100] to-[#FFB100] flex flex-col items-center justify-start pt-32 px-6">
      <div className="w-full max-w-2xl text-center mb-12">
        {/* Main Title
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 leading-tight"></h1> */}

        {/* Subtitle */}
        {/* <p className="text-xl text-gray-800 font-medium mb-12"></p> */}

        {/* Input and Button Section */}
        <div className="space-y-6">
          <div className="relative">
            <Input
              type="url"
              placeholder="Enter your sitemap URL..."
              value={sitemapUrl}
              onChange={(e) => setSitemapUrl(e.target.value)}
              className="h-16 text-lg px-6 rounded-2xl border-0 shadow-lg bg-white/90 backdrop-blur-sm placeholder:text-gray-500 focus:ring-4 focus:ring-white/30 transition-all duration-200"
            />
          </div>

          <Button
            onClick={extractUrlsFromSitemap}
            disabled={isLoading}
            className="h-16 bg-gray-900 hover:bg-gray-800 text-white px-12 font-semibold text-lg rounded-2xl shadow-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                Extracting...
              </>
            ) : (
              <>
                <Rocket className="w-5 h-5 mr-3" />
                Extract Now
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Results Section - Only show when there are results */}
      {extractedUrls && (
        <div className="w-full max-w-4xl">
          <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden">
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  Extracted URLs
                </h2>
                <div className="flex gap-3">
                  <Button
                    onClick={copyUrlsToClipboard}
                    variant="outline"
                    className="h-12 bg-white border-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 px-6 font-semibold rounded-xl shadow-sm transition-all duration-200"
                  >
                    <Copy className="w-5 h-5 mr-2" />
                    Copy URLs
                  </Button>
                  <Button
                    onClick={convertToXmlSitemap}
                    variant="outline"
                    className="h-12 bg-white border-2 border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 px-6 font-semibold rounded-xl shadow-sm transition-all duration-200"
                  >
                    <FileCode className="w-5 h-5 mr-2" />
                    Convert to XML
                  </Button>
                  <Button
                    onClick={exportToCSV}
                    variant="outline"
                    className="h-12 bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-yellow-300 px-6 font-semibold rounded-xl shadow-sm transition-all duration-200"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </div>

              <Textarea
                value={extractedUrls}
                onChange={(e) => setExtractedUrls(e.target.value)}
                className="min-h-[300px] border-2 border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-200 font-mono text-sm leading-relaxed p-6 rounded-xl shadow-sm transition-all duration-200 resize-none bg-gray-50"
                placeholder="Your extracted URLs will appear here..."
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Index;
